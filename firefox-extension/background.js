// Firefox IDM Integration Module - Background Service Worker
const IDM_HOST = 'http://localhost:3000';

console.log('[IDM Firefox Extension] Background service initialized v2.5.0');

// Intercept browser downloads and route to IDM
if (typeof browser !== 'undefined' && browser.downloads) {
  browser.downloads.onCreated.addListener((downloadItem) => {
    console.log('[IDM Firefox] Intercepted new download item:', downloadItem.url);

    // Cancel built-in browser download and pass to IDM
    browser.downloads.cancel(downloadItem.id).then(() => {
      fetch(`${IDM_HOST}/api/downloads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: downloadItem.url,
          filename: downloadItem.filename || 'download_file',
          referrer: downloadItem.referrer || '',
        }),
      }).catch((err) => {
        console.warn('[IDM Firefox] Could not send to IDM engine at localhost:3000:', err);
      });
    });
  });

  // Register Firefox Context Menu
  browser.contextMenus.create({
    id: 'idm-download-context',
    title: 'Download with IDM',
    contexts: ['link', 'video', 'audio', 'image'],
  });

  browser.contextMenus.onClicked.addListener((info) => {
    if (info.menuItemId === 'idm-download-context') {
      const targetUrl = info.linkUrl || info.srcUrl;
      if (targetUrl) {
        console.log('[IDM Firefox] Context menu download trigger:', targetUrl);
      }
    }
  });
}
