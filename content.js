// 欄位的 XPath 定義
const FIELD_MAPPINGS = {
  residential: '#residential_level_text',
  psychological: '#psychological_level_text',
  health: '#health_level_text',
  healthEducation: '#health_education_level_text',
  specialMatters: '#special_matters_text'
};

const FIXED_HEALTH_EDUCATION_TEXT = '提醒近日溫氣仍不穩定，要注意保暖，尤其早晚偏涼，提醒案主要記得帶雨具、外套或帽子。心血管疾病者注意血壓變化，定期複診，如果血壓有劇烈波動要及時就診。';

// 在頂部添加監聽器
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // 檢查 runtime 是否有效
  if (!chrome.runtime.id) {
    return;
  }

  if (request.type === 'DATA_UPDATED') {
    // 更新所有分頁中的 paste 按鈕狀態
    const pasteBtn = document.querySelector('#care-control-panel .control-button:nth-child(2)');
    if (pasteBtn) {
      pasteBtn.disabled = !request.data;
      pasteBtn.style.opacity = request.data ? '1' : '0.5';
    }
  }
});

// 通過 XPath 獲取元素
function getElement(selector) {
  return new Promise((resolve, reject) => {
    let retryCount = 0;
    const maxRetries = 5;
    
    const findElement = () => {
      // 先嘗試在主頁面中查找
      let element = document.querySelector(selector);
      
      // 如果主頁面中找不到，則嘗試在 iframe 中查找
      if (!element) {
        const iframes = document.querySelectorAll('iframe');
        
        for (const iframe of iframes) {
          try {
            element = iframe.contentDocument.querySelector(selector);
            if (element) break;
          } catch (e) {
            console.log('無法訪問 iframe:', e);
          }
        }
      }
      
      if (element) {
        element.disabled = false;
        resolve(element);
      } else if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(findElement, 500);
      } else {
        reject(new Error(`找不到欄位：${selector}`));
      }
    }
    
    findElement();
  });
}

// 創建控制面板
function createControlPanel() {
  const panel = document.createElement('div');
  panel.id = 'care-control-panel';

  const copyBtn = document.createElement('button');
  copyBtn.textContent = 'Copy';
  copyBtn.className = 'control-button';
  copyBtn.onclick = handleCopy;

  const pasteBtn = document.createElement('button');
  pasteBtn.textContent = 'Paste';
  pasteBtn.className = 'control-button';
  pasteBtn.onclick = handlePaste;

  panel.appendChild(copyBtn);
  panel.appendChild(pasteBtn);
  document.body.appendChild(panel);

  // 檢查是否有複製的數據
  checkCopiedData(pasteBtn);
}

// 檢查複製的數據
async function checkCopiedData(pasteBtn) {
  try {
    if (!chrome.runtime.id) {
      return;
    }
    const response = await chrome.runtime.sendMessage({ type: 'GET_COPIED_DATA' });
    pasteBtn.disabled = !response.data;
    pasteBtn.style.opacity = response.data ? '1' : '0.5';
  } catch (error) {
    console.log('檢查複製數據時發生錯誤:', error);
  }
}

// 顯示成功圖標
function showSuccessIcon(button) {
  const icon = document.createElement('span');
  icon.textContent = '✓';
  icon.className = 'success-icon';
  button.appendChild(icon);

  setTimeout(() => {
    icon.remove();
  }, 3000);
}

// 複製處理
async function handleCopy() {
  try {
    if (!chrome.runtime.id) {
      alert('擴充功能需要重新載入，請重新整理頁面');
      return;
    }
    const data = {
      residential: (await getElement(FIELD_MAPPINGS.residential)).value,
      psychological: (await getElement(FIELD_MAPPINGS.psychological)).value,
      health: (await getElement(FIELD_MAPPINGS.health)).value,
      specialMatters: (await getElement(FIELD_MAPPINGS.specialMatters)).value
    };

    await chrome.runtime.sendMessage({ 
      type: 'SAVE_COPIED_DATA', 
      data: data 
    });

    showSuccessIcon(document.querySelector('#care-control-panel button'));
    checkCopiedData(document.querySelectorAll('#care-control-panel button')[1]);
  } catch (error) {
    if (!chrome.runtime.id) {
      alert('擴充功能需要重新載入，請重新整理頁面');
    } else {
      alert(error.message);
    }
  }
}

// 貼上處理
async function handlePaste() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_COPIED_DATA' });
    if (!response.data) {
      alert('no copied data');
      return;
    }

    const data = response.data;
    
    // 清空並填入所有欄位
    Object.entries(FIELD_MAPPINGS).forEach(async ([key, selector]) => {
      try {
        const element = await getElement(selector);
        element.value = '';
        
        if (key === 'healthEducation') {
          element.value = FIXED_HEALTH_EDUCATION_TEXT;
        } else {
          element.value = data[key] || '';
        }
      } catch (error) {
        alert(error.message);
      }
    });
  } catch (error) {
    alert(error.message);
  }
}

// 當頁面加載完成時創建控制面板
if (window.location.hostname === 'care.secom.com.tw') {
  createControlPanel();
} 