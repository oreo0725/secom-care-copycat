// 監聽擴充功能的安裝事件
chrome.runtime.onInstalled.addListener(() => {
  // 初始化 storage
  chrome.storage.local.set({ 
    copiedData: null,
    healthEducationText: '提醒近日溫氣仍不穩定，要注意保暖，尤其早晚偏涼，提醒案主要記得帶雨具、外套或帽子。心血管疾病者注意血壓變化，定期複診，如果血壓有劇烈波動要及時就診。'
  }, () => {
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