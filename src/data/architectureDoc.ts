export const MERMAID_DIAGRAM_COMPONENT = `
flowchart TB
    subgraph Browser["Browser Ecosystem (Chrome / Edge / Firefox)"]
        MV3["Manifest V3 Extension\\n(Background Service Worker)"]
        NetReq["declarativeNetRequest & webRequest\\n(Header & Sniffer Interception)"]
        MV3 --> NetReq
    end

    subgraph IPC_Tier["IPC & Native Messaging Layer"]
        NM_Host["Rust Native Messaging Host\\n(stdio 32-bit LE length-prefixed protocol)"]
        RPC_Server["Local Domain Socket / Named Pipe IPC\\n(Tauri / Qt GUI Communication)"]
    end

    subgraph CoreEngine["Rust Core Networking Engine (Tokio Runtime)"]
        Multiplexer["Segment Multiplexer\\n(HTTP HEAD Probe & Chunk Allocator)"]
        WorkStealer["Work Stealing Coordinator\\n(Dynamic Range Splitting & Reallocation)"]
        TokenBucket["Token Bucket Rate Limiter\\n(Global & Per-Thread Bandwidth Throttle)"]
        BufferPool["Async Disk Writer & Memory Buffer\\n(mmap / Sequential Chunk Assembler)"]
        StatePersist["State Persistence Engine\\n(Atomic .adm_state JSON Write)"]
        
        Workers["Async Worker Pool\\n(Worker 1..N reqwest HTTP Range GET)"]
    end

    subgraph Storage["Storage Tier"]
        DiskFile["Final Output File\\n(Target File)"]
        StateFile[".adm_state Metadata\\n(ETag, Ranges, Checksum)"]
    end

    NetReq -->|chrome.runtime.sendNativeMessage| NM_Host
    NM_Host -->|Spawns / Communicates| Multiplexer
    RPC_Server <-->|IPC Sync| CoreEngine

    Multiplexer -->|Spawns 8-32 Tasks| Workers
    Workers --> TokenBucket
    TokenBucket -->|Throttle Bytes| BufferPool
    Workers -->|Signal Early Completion| WorkStealer
    WorkStealer -->|Split Target Segment| Workers
    BufferPool -->|Flush Partials| DiskFile
    StatePersist -->|Atomic Write| StateFile
    Multiplexer <--> StatePersist
`;

export const MERMAID_DIAGRAM_SEQUENCE = `
sequenceDiagram
    autonumber
    actor User
    participant Ext as Browser Extension (MV3)
    participant Host as Native Messaging Host
    participant Core as Rust Tokio Core Engine
    participant HTTP as Remote Server (HTTP/2)
    participant Disk as Disk Storage (.adm_state)

    User->>Ext: Clicks File Link or Intercepts Video Stream
    Ext->>Host: stdio json payload (URL, Headers, Cookies)
    Host->>Core: Dispatch Download Request
    Core->>HTTP: HEAD /file.zip (Check Accept-Ranges, Content-Length, ETag)
    HTTP-->>Core: 200 OK (Content-Length: 104857600, Accept-Ranges: bytes, ETag: "xyz")
    Core->>Disk: Initialize .adm_state (Range map: 8 equal segments)
    
    par Async Range Workers
        Core->>HTTP: GET /file.zip (Range: bytes=0-13107199)
        Core->>HTTP: GET /file.zip (Range: bytes=13107200-26214399)
        Core->>HTTP: ... Worker N GET Ranges
    end

    HTTP-->>Core: Stream HTTP Chunks
    Core->>Core: Apply TokenBucket Rate Limiter Throttle
    Core->>Disk: Flush Memory Buffers & Update .adm_state

    Note over Core,HTTP: Work Stealing Triggered!
    Core->>Core: Worker 3 finishes segment early
    Core->>Core: Find largest remaining segment (Worker 7)
    Core->>Core: Split Worker 7 range in half: [Mid, End] -> New Worker 3
    Core->>HTTP: Worker 3 requests GET (Range: bytes=Mid-End)

    Core->>Disk: All Segments Completed -> Stitch File & Delete .adm_state
    Core-->>Host: Download Finished Event
    Host-->>Ext: Show Finished Notification
`;

export const MODULE_BREAKDOWN_DOC = `
# Archimedes Download Manager (ADM) Architecture Specification

## 1. Executive Summary
This document defines the high-performance, multithreaded 1:1 architectural clone of Archimedes Download Manager (ADM). The core engine is implemented in **Rust** utilizing the **Tokio async framework** for high-concurrency non-blocking socket I/O, **Serde** for lockless state persistence, and a custom lock-free **Token Bucket** algorithm for precise connection pool rate-limiting.

## 2. Core Subsystems

### 2.1 The Multiplexer & Probe Engine
- **Probe Stage**: Before chunk allocation, the engine fires an HTTP \`HEAD\` request (falling back to range-header \`GET\` if \`HEAD\` is prohibited).
- **Capabilities Matrix**:
  - Validates \`Accept-Ranges: bytes\` header.
  - Extracts \`Content-Length\`, \`ETag\`, and \`Last-Modified\`.
  - Determines if server supports persistent HTTP/1.1 pipelining or HTTP/2 multiplexing.
- **Segment Allocation**: If range requests are supported, the target size $L$ is divided into $N$ default worker slots (default: 8, configurable up to 32). Worker $i$ gets target range:
  $\\text{Start}_i = i \\times \\lfloor L / N \\rfloor, \\quad \\text{End}_i = (i == N-1) ? (L - 1) : ((i + 1) \\times \\lfloor L / N \\rfloor - 1)$

### 2.2 Dynamic Reallocation & Work Stealing (The ADM Secret Sauce)
Traditional split downloaders fail when one socket thread hits a slow network pipe or ISP throttling. ADM solves this via **Dynamic Work Stealing**:
- Each active worker reports progress to an asynchronous coordinator channel.
- When Worker $A$ exhausts its allocated range, it enters the **Stealer State**.
- The Coordinator scans all remaining active workers $W_1 \\dots W_k$ to locate the worker holding the **largest remaining un-downloaded byte range** ($\Delta = \\text{End} - \\text{Current}$).
- If $\Delta > \\text{Threshold}$ (e.g., $> 256 \\text{ KB}$):
  1. The target worker's remaining segment $[\\text{Current}, \\text{End}]$ is atomically split at $\\text{Mid} = \\text{Current} + \\lfloor \\Delta / 2 \\rfloor$.
  2. The target worker's boundary is shrunk to $[\\text{Current}, \\text{Mid}]$.
  3. Worker $A$ is spawned with target range $[\\text{Mid} + 1, \\text{End}]$.

### 2.3 State Persistence (\`.adm_state\`)
To guarantee instant pause/resume across unexpected system power failures or process kills:
- A companion file \`<filename>.adm_state\` is atomically flushed to disk using standard write-replace semantics (\`rename\`).
- Tracks state metadata:
  - \`url\`, \`etag\`, \`last_modified\`, \`total_bytes\`.
  - Array of ranges \`[start, current, end]\` and completed contiguous bitmaps.
  - SHA-256 state signature.
- On resume:
  1. Engine sends a conditional \`HEAD\` request with \`If-Match: <etag>\` or \`If-Unmodified-Since: <date>\`.
  2. If valid, resumes remaining uncompleted chunks without redownloading a single byte.

### 2.4 Token Bucket Speed Limiter
Global download speed throttling is applied across all parallel sockets simultaneously:
- Shared atomic token bucket initialized with capacity $C$ and refill rate $R$ (bytes/sec).
- Every worker socket must request $k$ tokens from the global bucket before consuming $k$ bytes from its TCP read stream.
- If tokens are depleted, workers yield execution to Tokio's timer wheel (\`tokio::time::sleep\`).

### 2.5 Native Messaging Host IPC Protocol
- Interceptor extension uses WebExtensions Native Messaging Protocol:
  - Communication over \`stdin\` / \`stdout\`.
  - Each message is prefixed with a **32-bit Little-Endian integer** specifying the JSON payload byte length.
  - JSON payload contains requested download headers (User-Agent, Referer, Cookies, Content-Disposition).
`;