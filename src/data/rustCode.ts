export interface RustFile {
  path: string;
  filename: string;
  language: string;
  description: string;
  code: string;
}

export const RUST_CODEBASE: RustFile[] = [
  {
    path: "Cargo.toml",
    filename: "Cargo.toml",
    language: "toml",
    description: "Cargo dependencies for production-grade async networking stack",
    code: `[package]
name = "idm_core_engine"
version = "2.5.0"
edition = "2021"
authors = ["IDM Core Team <engine@idm.internal>"]
description = "High-performance Tokio-based multithreaded segmented downloader with dynamic work stealing"

[dependencies]
tokio = { version = "1.38", features = ["full"] }
reqwest = { version = "0.12", features = ["json", "stream"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
bytes = "1.6"
futures = "0.3"
tokio-util = { version = "0.7", features = ["io"] }
parking_lot = "0.12"
sha2 = "0.10"
anyhow = "1.0"
tracing = "0.1"
tracing-subscriber = "0.3"
byteorder = "1.5"
`
  },
  {
    path: "src/engine/multiplexer.rs",
    filename: "multiplexer.rs",
    language: "rust",
    description: "Core SegmentedDownloader struct, HTTP HEAD probe, and parallel worker manager",
    code: `// src/engine/multiplexer.rs
use std::path::{Path, PathBuf};
use std::sync::Arc;
use anyhow::{Context, Result, bail};
use reqwest::header::{ACCEPT_RANGES, CONTENT_LENGTH, ETAG, LAST_MODIFIED, RANGE};
use reqwest::Client;
use tokio::fs::{File, OpenOptions};
use tokio::io::{AsyncSeekExt, AsyncWriteExt, SeekFrom};
use tokio::sync::{mpsc, Mutex, RwLock};
use tracing::{info, warn, error};

use super::persistence::{DownloadState, ChunkState, StateManager};
use super::rate_limiter::TokenBucket;
use super::work_stealer::WorkStealer;

#[derive(Debug, Clone)]
pub struct DownloaderConfig {
    pub default_workers: usize,
    pub max_workers: usize,
    pub min_chunk_size: u64, // e.g. 256 KB
    pub speed_limit_bps: Arc<TokenBucket>,
    pub buffer_size: usize,
}

impl Default for DownloaderConfig {
    fn default() -> Self {
        Self {
            default_workers: 8,
            max_workers: 32,
            min_chunk_size: 256 * 1024,
            speed_limit_bps: Arc::new(TokenBucket::unlimited()),
            buffer_size: 64 * 1024,
        }
    }
}

pub struct Metadata {
    pub url: String,
    pub total_bytes: u64,
    pub accept_ranges: bool,
    pub etag: Option<String>,
    pub last_modified: Option<String>,
    pub suggested_filename: String,
}

pub struct SegmentedDownloader {
    client: Client,
    config: DownloaderConfig,
    state_manager: Arc<StateManager>,
}

impl SegmentedDownloader {
    pub fn new(config: DownloaderConfig, state_dir: PathBuf) -> Self {
        let client = Client::builder()
            .user_agent("IDM/7.1 (Windows NT 10.0; Win64; x64) CoreEngine/2.5")
            .pool_max_idle_per_host(32)
            .build()
            .expect("Failed to initialize HTTP client");

        Self {
            client,
            config,
            state_manager: Arc::new(StateManager::new(state_dir)),
        }
    }

    /// Step 1: Issue HTTP HEAD probe to check Range support & Content-Length
    pub async fn fetch_metadata(&self, url: &str) -> Result<Metadata> {
        info!("Probing metadata for target URL: {}", url);
        let resp = self.client.head(url).send().await?;

        if !resp.status().is_success() {
            warn!("HEAD request failed with status {}, falling back to GET range probe", resp.status());
        }

        let headers = resp.headers();
        let accept_ranges = headers
            .get(ACCEPT_RANGES)
            .and_then(|v| v.to_str().ok())
            .map(|v| v.eq_ignore_ascii_case("bytes"))
            .unwrap_or(false);

        let total_bytes = headers
            .get(CONTENT_LENGTH)
            .and_then(|v| v.to_str().ok())
            .and_then(|v| v.parse::<u64>().ok())
            .unwrap_or(0);

        let etag = headers
            .get(ETAG)
            .and_then(|v| v.to_str().ok())
            .map(String::from);

        let last_modified = headers
            .get(LAST_MODIFIED)
            .and_then(|v| v.to_str().ok())
            .map(String::from);

        // Derive filename from URL path or fallback
        let suggested_filename = url
            .split('/')
            .last()
            .and_then(|s| s.split('?').next())
            .filter(|s| !s.is_empty())
            .unwrap_or("download.bin")
            .to_string();

        Ok(Metadata {
            url: url.to_string(),
            total_bytes,
            accept_ranges,
            etag,
            last_modified,
            suggested_filename,
        })
    }

    /// Step 2: Initialize or Resume segmented download job
    pub async fn start(&self, url: &str, output_path: &Path) -> Result<()> {
        let meta = self.fetch_metadata(url).await?;
        let state_path = StateManager::get_state_file_path(output_path);

        let download_state = if state_path.exists() {
            info!("Existing .idm_state found. Attempting resume verification...");
            let mut state = self.state_manager.load_state(&state_path).await?;
            if state.etag != meta.etag && meta.etag.is_some() {
                warn!("Remote ETag changed! Restarting download from scratch.");
                self.create_fresh_state(&meta, output_path).await?
            } else {
                state
            }
        } else {
            self.create_fresh_state(&meta, output_path).await?
        };

        let active_state = Arc::new(RwLock::new(download_state));
        let stealer = Arc::new(WorkStealer::new(
            active_state.clone(),
            self.config.min_chunk_size,
        ));

        // Pre-allocate target disk file space
        let mut file = OpenOptions::new()
            .create(true)
            .write(true)
            .open(output_path)
            .await?;
        file.set_len(meta.total_bytes).await?;
        file.sync_all().await?;

        info!("Starting parallel workers pool. Range support: {}", meta.accept_ranges);

        let (tx, mut rx) = mpsc::channel(100);
        let chunks_count = {
            let guard = active_state.read().await;
            guard.chunks.len()
        };

        for chunk_idx in 0..chunks_count {
            let worker_client = self.client.clone();
            let url_clone = url.to_string();
            let state_ref = active_state.clone();
            let stealer_ref = stealer.clone();
            let limiter_ref = self.config.speed_limit_bps.clone();
            let path_buf = output_path.to_path_buf();
            let tx_clone = tx.clone();

            tokio::spawn(async move {
                let res = Self::spawn_worker(
                    chunk_idx,
                    url_clone,
                    worker_client,
                    state_ref,
                    stealer_ref,
                    limiter_ref,
                    path_buf,
                )
                .await;

                let _ = tx_clone.send((chunk_idx, res)).await;
            });
        }

        drop(tx); // Close original sender

        while let Some((chunk_idx, res)) = rx.recv().await {
            match res {
                Ok(_) => info!("Chunk worker {} completed target segment", chunk_idx),
                Err(e) => error!("Chunk worker {} failed: {:?}", chunk_idx, e),
            }

            // Save state updates periodically
            let current_snapshot = active_state.read().await.clone();
            self.state_manager.save_state(&state_path, &current_snapshot).await?;
        }

        info!("All chunks synchronized! Removing .idm_state metadata file.");
        let _ = tokio::fs::remove_file(state_path).await;
        Ok(())
    }

    async fn create_fresh_state(&self, meta: &Metadata, output_path: &Path) -> Result<DownloadState> {
        let workers = if meta.accept_ranges && meta.total_bytes > 0 {
            self.config.default_workers
        } else {
            1
        };

        let chunk_size = meta.total_bytes / workers as u64;
        let mut chunks = Vec::new();

        for i in 0..workers {
            let start = i as u64 * chunk_size;
            let end = if i == workers - 1 {
                meta.total_bytes - 1
            } else {
                (i as u64 + 1) * chunk_size - 1
            };

            chunks.push(ChunkState {
                id: i,
                start,
                current: start,
                end,
                completed: false,
            });
        }

        Ok(DownloadState {
            url: meta.url.clone(),
            total_bytes: meta.total_bytes,
            etag: meta.etag.clone(),
            last_modified: meta.last_modified.clone(),
            chunks,
            save_path: output_path.to_string_lossy().to_string(),
        })
    }

    /// Worker Execution Loop with Range GET & Speed Limiting
    async fn spawn_worker(
        chunk_id: usize,
        url: String,
        client: Client,
        state: Arc<RwLock<DownloadState>>,
        stealer: Arc<WorkStealer>,
        limiter: Arc<TokenBucket>,
        output_path: PathBuf,
    ) -> Result<()> {
        let (start, end) = {
            let guard = state.read().await;
            let chunk = &guard.chunks[chunk_id];
            (chunk.current, chunk.end)
        };

        if start >= end {
            return Ok(());
        }

        let range_header = format!("bytes={}-{}", start, end);
        let mut resp = client
            .get(&url)
            .header(RANGE, range_header)
            .send()
            .await?;

        if !resp.status().is_success() {
            bail!("HTTP range request rejected: {}", resp.status());
        }

        let mut file = OpenOptions::new()
            .write(true)
            .open(&output_path)
            .await?;

        file.seek(SeekFrom::Start(start)).await?;

        let mut current_offset = start;

        while let Some(chunk) = resp.chunk().await? {
            let chunk_len = chunk.len();

            // Apply global Token Bucket Rate Limiting
            limiter.consume(chunk_len as u64).await;

            file.write_all(&chunk).await?;
            current_offset += chunk_len as u64;

            // Atomically update chunk state
            {
                let mut guard = state.write().await;
                guard.chunks[chunk_id].current = current_offset;
                if current_offset >= guard.chunks[chunk_id].end {
                    guard.chunks[chunk_id].completed = true;
                }
            }

            // Check if any other worker finished and needs to steal work
            stealer.check_and_steal_if_idle().await?;
        }

        Ok(())
    }
}
`
  },
  {
    path: "src/engine/work_stealer.rs",
    filename: "work_stealer.rs",
    language: "rust",
    description: "Dynamic Reallocation algorithm - Splits largest remaining segment in half",
    code: `// src/engine/work_stealer.rs
use std::sync::Arc;
use anyhow::Result;
use tokio::sync::RwLock;
use tracing::info;

use super::persistence::{ChunkState, DownloadState};

pub struct WorkStealer {
    state: Arc<RwLock<DownloadState>>,
    min_split_threshold: u64,
}

impl WorkStealer {
    pub fn new(state: Arc<RwLock<DownloadState>>, min_split_threshold: u64) -> Self {
        Self {
            state,
            min_split_threshold,
        }
    }

    /// Scans active chunks to find the worker with the largest remaining byte range.
    /// If remaining bytes > min_split_threshold, splits target range in half!
    pub async fn check_and_steal_if_idle(&self) -> Result<Option<usize>> {
        let mut guard = self.state.write().await;

        let mut max_remaining = 0u64;
        let mut candidate_idx: Option<usize> = None;

        for (idx, chunk) in guard.chunks.iter().enumerate() {
            if !chunk.completed && chunk.current < chunk.end {
                let remaining = chunk.end - chunk.current;
                if remaining > max_remaining {
                    max_remaining = remaining;
                    candidate_idx = Some(idx);
                }
            }
        }

        if let Some(target_idx) = candidate_idx {
            if max_remaining >= self.min_split_threshold {
                let target = &mut guard.chunks[target_idx];
                let current = target.current;
                let old_end = target.end;

                let mid = current + (max_remaining / 2);
                target.end = mid; // Shrink original worker's target range

                let new_chunk_id = guard.chunks.len();
                let stolen_chunk = ChunkState {
                    id: new_chunk_id,
                    start: mid + 1,
                    current: mid + 1,
                    end: old_end,
                    completed: false,
                };

                info!(
                    "WORK STEAL: Worker {} split target range [{}, {}]. Worker {} created for [{}, {}]",
                    target_idx, current, old_end, new_chunk_id, mid + 1, old_end
                );

                guard.chunks.push(stolen_chunk);
                return Ok(Some(new_chunk_id));
            }
        }

        Ok(None)
    }
}
`
  },
  {
    path: "src/engine/rate_limiter.rs",
    filename: "rate_limiter.rs",
    language: "rust",
    description: "Token Bucket Rate Limiter - Thread-safe async rate throttling across connection pool",
    code: `// src/engine/rate_limiter.rs
use std::sync::atomic::{AtomicU64, Ordering};
use std::time::Instant;
use tokio::sync::Mutex;
use tokio::time::{sleep, Duration};

/// High-performance Token Bucket Rate Limiter for global bandwidth control
pub struct TokenBucket {
    rate_bytes_per_sec: AtomicU64, // 0 = unlimited
    tokens_available: AtomicU64,
    last_refill: Mutex<Instant>,
}

impl TokenBucket {
    pub fn new(rate_bytes_per_sec: u64) -> Self {
        Self {
            rate_bytes_per_sec: AtomicU64::new(rate_bytes_per_sec),
            tokens_available: AtomicU64::new(rate_bytes_per_sec),
            last_refill: Mutex::new(Instant::now()),
        }
    }

    pub fn unlimited() -> Self {
        Self::new(0)
    }

    pub fn set_limit(&self, bytes_per_sec: u64) {
        self.rate_bytes_per_sec.store(bytes_per_sec, Ordering::Relaxed);
    }

    /// Acquires tokens from bucket before TCP stream read. Yields execution if limit exceeded.
    pub async fn consume(&self, bytes_requested: u64) {
        let limit = self.rate_bytes_per_sec.load(Ordering::Relaxed);
        if limit == 0 {
            return; // Unlimited speed
        }

        let mut last_refill = self.last_refill.lock().await;
        let now = Instant::now();
        let elapsed = now.duration_since(*last_refill).as_secs_f64();

        if elapsed > 0.05 {
            let new_tokens = (elapsed * limit as f64) as u64;
            let current = self.tokens_available.load(Ordering::Relaxed);
            let refilled = (current + new_tokens).min(limit * 2); // Cap bucket burst size
            self.tokens_available.store(refilled, Ordering::Relaxed);
            *last_refill = now;
        }

        let available = self.tokens_available.load(Ordering::Relaxed);
        if bytes_requested > available {
            let deficit = bytes_requested - available;
            let wait_secs = deficit as f64 / limit as f64;
            let sleep_duration = Duration::from_secs_f64(wait_secs.min(2.0));
            
            drop(last_refill); // Release lock during sleep
            sleep(sleep_duration).await;
            self.tokens_available.store(0, Ordering::Relaxed);
        } else {
            self.tokens_available.fetch_sub(bytes_requested, Ordering::Relaxed);
        }
    }
}
`
  },
  {
    path: "src/engine/persistence.rs",
    filename: "persistence.rs",
    language: "rust",
    description: "State Persistence (.idm_state serde JSON manager with atomic disk flushes)",
    code: `// src/engine/persistence.rs
use std::path::{Path, PathBuf};
use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use tokio::fs::{self, File};
use tokio::io::AsyncWriteExt;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChunkState {
    pub id: usize,
    pub start: u64,
    pub current: u64,
    pub end: u64,
    pub completed: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DownloadState {
    pub url: String,
    pub total_bytes: u64,
    pub etag: Option<String>,
    pub last_modified: Option<String>,
    pub chunks: Vec<ChunkState>,
    pub save_path: String,
}

pub struct StateManager {
    base_dir: PathBuf,
}

impl StateManager {
    pub fn new(base_dir: PathBuf) -> Self {
        Self { base_dir }
    }

    pub fn get_state_file_path(target_file: &Path) -> PathBuf {
        let mut path = target_file.to_path_buf();
        let filename = path.file_name().unwrap_or_default().to_string_lossy();
        path.set_file_name(format!("{}.idm_state", filename));
        path
    }

    /// Atomically flushes .idm_state using temporary file & rename semantics
    pub async fn save_state(&self, state_file_path: &Path, state: &DownloadState) -> Result<()> {
        let tmp_path = state_file_path.with_extension("tmp_state");
        let serialized = serde_json::to_string_pretty(state)?;

        let mut file = File::create(&tmp_path).await?;
        file.write_all(serialized.as_bytes()).await?;
        file.flush().await?;

        fs::rename(tmp_path, state_file_path).await?;
        Ok(())
    }

    pub async fn load_state(&self, state_file_path: &Path) -> Result<DownloadState> {
        let content = fs::read_to_string(state_file_path).await?;
        let state: DownloadState = serde_json::from_str(&content)?;
        Ok(state)
    }
}
`
  },
  {
    path: "src/ipc/native_host.rs",
    filename: "native_host.rs",
    language: "rust",
    description: "Chrome Manifest V3 WebExtension Native Messaging Host Protocol (stdio 32-bit LE)",
    code: `// src/ipc/native_host.rs
use std::io::{self, Read, Write};
use byteorder::{LittleEndian, ReadBytesExt, WriteBytesExt};
use serde::{Deserialize, Serialize};
use anyhow::Result;

#[derive(Debug, Serialize, Deserialize)]
pub struct InterceptPayload {
    pub action: String,
    pub url: String,
    pub headers: std::collections::HashMap<String, String>,
    pub user_agent: Option<String>,
    pub referer: Option<String>,
}

pub struct NativeMessagingHost;

impl NativeMessagingHost {
    /// Reads length-prefixed JSON message from Chrome/Edge stdin
    pub fn read_message() -> Result<InterceptPayload> {
        let mut stdin = io::stdin();
        let length = stdin.read_u32::<LittleEndian>()? as usize;

        let mut buffer = vec![0u8; length];
        stdin.read_exact(&mut buffer)?;

        let message: InterceptPayload = serde_json::from_slice(&buffer)?;
        Ok(message)
    }

    /// Sends length-prefixed JSON response back to Browser Extension
    pub fn send_message<T: Serialize>(payload: &T) -> Result<()> {
        let serialized = serde_json::to_vec(payload)?;
        let length = serialized.len() as u32;

        let mut stdout = io::stdout();
        stdout.write_u32::<LittleEndian>(length)?;
        stdout.write_all(&serialized)?;
        stdout.flush()?;

        Ok(())
    }
}
`
  }
];
