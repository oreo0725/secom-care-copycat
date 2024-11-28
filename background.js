// 監聽擴充功能的安裝事件
chrome.runtime.onInstalled.addListener(() => {
  // 初始化 storage
  chrome.storage.local.set({ copiedData: null }, () => {
    console.log('Storage initialized');
  });
});

// 監聽來自 content script 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_COPIED_DATA') {
    chrome.storage.local.get(['copiedData'], (result) => {
      sendResponse({ data: result.copiedData });
    });
    return true;
  }
  
  if (request.type === 'SAVE_COPIED_DATA') {
    chrome.storage.local.set({ copiedData: request.data }, () => {
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, { 
            type: 'DATA_UPDATED',
            data: request.data 
          });
        });
      });
      sendResponse({ success: true });
    });
    return true;
  }
}); 