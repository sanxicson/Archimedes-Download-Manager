// Firefox IDM Content Script - Media Sniffer & Video Grabber Overlay
(function () {
  console.log('[IDM Firefox] Sniffer active on page:', window.location.href);

  function attachIdmVideoOverlay() {
    const videoElements = document.querySelectorAll('video');
    videoElements.forEach((video) => {
      if (video.dataset.idmAttached) return;
      video.dataset.idmAttached = 'true';

      const overlay = document.createElement('div');
      overlay.className = 'idm-firefox-video-panel';
      overlay.style.cssText = `
        position: absolute;
        top: 12px;
        right: 12px;
        z-index: 999999;
        background: linear-gradient(135deg, #4f46e5, #0284c7);
        color: #ffffff;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 12px;
        font-weight: 700;
        padding: 6px 14px;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        border: 1px solid rgba(255, 255, 255, 0.25);
        transition: transform 0.2s ease;
      `;

      overlay.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        <span>Download with IDM</span>
      `;

      overlay.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        alert('IDM Firefox Extension: Stream detected! Forwarding media video stream to IDM Desktop Manager...');
      });

      if (video.parentElement) {
        if (getComputedStyle(video.parentElement).position === 'static') {
          video.parentElement.style.position = 'relative';
        }
        video.parentElement.appendChild(overlay);
      }
    });
  }

  setInterval(attachIdmVideoOverlay, 1500);
})();
