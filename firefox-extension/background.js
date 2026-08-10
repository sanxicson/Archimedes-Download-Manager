// Firefox ADM Integration Module - Background Service Worker
const ADM_HOST = 'http://localhost:3000';

console.log('[ADM Firefox Extension] Background service initialized v2.5.0');

// Intercept browser downloads and route to ADM
if (typeof browser !== 'undefined' && browser.downloads) {
  browser.downloads.onCreated.addListener((downloadItem) => {
    console.log('[ADM Firefox] Intercepted new download item:', downloadItem.url);

    // Cancel built-in browser download and pass to ADM
    browser.downloads.cancel(downloadItem.id).then(() => {
      fetch(`${ADM_HOST}/api/downloads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: downloadItem.url,
          filename: downloadItem.filename || 'download_file',
          referrer: downloadItem.referrer || '',
        }),
      }).catch((err) => {
        console.warn('[ADM Firefox] Could not send to ADM engine at localhost:3000:', err);
      });
    });
  });

  // Register Firefox Context Menu
  browser.contextMenus.create({
    id: 'adm-download-context',
    title: 'Download with Archimedes Download Manager',
    contexts: ['link', 'video', 'audio', 'image'],
  });

  browser.contextMenus.onClicked.addListener((info) => {
    if (info.menuItemId === 'adm-download-context') {
      const targetUrl = info.linkUrl || info.srcUrl;
      if (targetUrl) {
        console.log('[ADM Firefox] Context menu download trigger:', targetUrl);
        fetch(`${ADM_HOST}/api/downloads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: targetUrl,
            filename: targetUrl.split('/').pop().split('?')[0] || 'downloaded_file',
            referrer: info.pageUrl || '',
          }),
        }).catch((err) => {
          console.warn('[ADM Firefox] Could not send to ADM engine at localhost:3000:', err);
        });
      }
    }
  });
}