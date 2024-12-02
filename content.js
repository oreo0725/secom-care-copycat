// 欄位的 XPath 定義
const FIELD_MAPPINGS = {
  residential: '#residential_level_text',
  psychological: '#psychological_level_text',
  health: '#health_level_text',
  healthEducation: '#health_education_level_text',
  specialMatters: '#special_matters_text'
};

// 新增欄位組定義
const FIELD_GROUPS = {
  awareness: {
    type: 'checkbox',
    items: ['#awareness1', '#awareness2', '#awareness3', '#awareness4', '#awareness5', '#awareness6'],
    textInput: '#awareness6_text'
  },
  circulation: {
    type: 'checkbox',
    items: ['#circulation1', '#circulation2', '#circulation3', '#circulation4'],
    textInput: '#circulation4_text'
  },
  vision_left: {
    type: 'radio',
    name: 'visionleft',
    items: ['#vision_left2', '#vision_left3', '#vision_left4', '#vision_left5'],
    textInput: '#vision_left5_text'
  },
  vision_right: {
    type: 'radio',
    name: 'visionright',
    items: ['#vision_right1', '#vision_right2', '#vision_right3', '#vision_right4'],
    textInput: '#vision_right4_text'
  },
  hearing_left: {
    type: 'radio',
    name: 'hearingleft',
    items: ['#hearing_left2', '#hearing_left3', '#hearing_left5', '#hearing_left6'],
    textInput: '#hearing_left6_context'
  },
  hearing_right: {
    type: 'radio',
    name: 'hearingright',
    items: ['#hearing_right1', '#hearing_right2', '#hearing_right4', '#hearing_right5'],
    textInput: '#hearing_right5_context'
  },
  breathing: {
    type: 'checkbox',
    items: ['#breathing2', '#breathing3', '#breathing4']
  },
  breathing_type: {
    type: 'checkbox',
    items: ['#breathing_type1', '#breathing_type2', '#breathing_type3', '#breathing_type4', 
            '#breathing_type5', '#breathing_type6', '#breathing_type7'],
    textInput: '#breathing_type7_text'
  },
  eating_habits: {
    type: 'checkbox',
    items: ['#eating_habits1', '#eating_habits2', '#eating_habits3', '#eating_habits4', 
            '#eating_habits5', '#eating_habits6', '#eating_habits7', '#eating_habits8', 
            '#eating_habits9', '#eating_habits10', '#eating_habits11', '#eating_habits12'],
    textInput: '#eating_habits12_text'
  },
  food_source: {
    type: 'checkbox',
    items: ['#food_source1', '#food_source2', '#food_source3', '#food_source4'],
    textInput: '#food_source4_text'
  },
  excretion_urine: {
    type: 'checkbox',
    items: ['#excretion_urine2', '#excretion_urine3', '#excretion_urine4', 
            '#excretion_urine5', '#excretion_urine6'],
    textInput: '#excretion_urine6_text'
  },
  excretion_stool: {
    type: 'checkbox',
    items: ['#excretion_stool1', '#excretion_stool2', '#excretion_stool3', 
            '#excretion_stool4', '#excretion_stool5', '#excretion_stool6'],
    textInput: '#excretion_stool6_text'
  },
  activity: {
    type: 'checkbox',
    items: ['#activity1', '#activity2', '#activity3', '#activity4']
  },
  physical_disorder: {
    type: 'checkbox',
    items: ['#physical_disorder1', '#physical_disorder2', '#physical_disorder3', '#physical_disorder4']
  },
  activity_method: {
    type: 'checkbox',
    items: ['#activity_method1', '#activity_method2', '#activity_method3', 
            '#activity_method4', '#activity_method5', '#activity_method6']
  },
  fall_down: {
    type: 'radio',
    name: 'fall_down',
    items: ['#fall_down1', '#fall_down2']
  },
  special_event: {
    type: 'radio',
    name: 'special_event',
    items: ['#special_event1', '#special_event2'],
    textInput: '#special_event3'
  },
  skin: {
    type: 'radio',
    name: 'skin',
    items: ['#skin1', '#skin2']
  }
};

// 收集欄位數據
async function collectFieldData(group, config) {
  const data = {
    values: [],
    other: ''
  };
  
  if (config.type === 'checkbox') {
    for (const selector of config.items) {
      const element = await getElement(selector);
      if (element && element.checked) {
        data.values.push(element.value);
      }
    }
  } else if (config.type === 'radio') {
    // 遍歷所有可能的選項來找到被選中的
    for (const selector of config.items) {
      const element = await getElement(selector);
      if (element && element.checked) {
        data.values.push(element.value);
        break;
      }
    }
  }
  
  if (config.textInput) {
    const textElement = await getElement(config.textInput);
    if (textElement) {
      data.other = textElement.value;
    }
  }
  
  return data;
}

// 獲取健康教育文字
async function getHealthEducationText() {
  const result = await chrome.storage.local.get(['healthEducationText']);
  return result.healthEducationText || '提醒近日溫氣仍不穩定...'; // 預設值
}

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

  const debugBtn = document.createElement('button');
  debugBtn.textContent = 'Show Data';
  debugBtn.className = 'control-button';
  debugBtn.onclick = async () => {
    const response = await chrome.runtime.sendMessage({ type: 'GET_COPIED_DATA' });
    console.log('Stored data:', response.data);
  };

  panel.appendChild(copyBtn);
  panel.appendChild(pasteBtn);
  panel.appendChild(debugBtn);
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

    // 收集原有欄位數據
    const basicData = {
      residential: (await getElement(FIELD_MAPPINGS.residential)).value,
      psychological: (await getElement(FIELD_MAPPINGS.psychological)).value,
      health: (await getElement(FIELD_MAPPINGS.health)).value,
      specialMatters: (await getElement(FIELD_MAPPINGS.specialMatters)).value
    };

    // 收集新增欄位數據
    const extendedData = {};
    for (const [group, config] of Object.entries(FIELD_GROUPS)) {
      extendedData[group] = await collectFieldData(group, config);
    }

    await chrome.runtime.sendMessage({ 
      type: 'SAVE_COPIED_DATA', 
      data: {
        ...basicData,
        ...extendedData
      }
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

// 新增一個函數來處理貼上欄位數據
async function applyFieldData(group, config, data) {
  if (!data) return;
  
  if (config.type === 'checkbox') {
    // 先清除所有選中狀態
    config.items.forEach(async selector => {
      const element = await getElement(selector);
      if (element) {
        element.checked = false;
      }
    });
    
    // 設置新的選中狀態
    config.items.forEach(async selector => {
      const element = await getElement(selector);
      if (element && data.values.includes(element.value)) {
        element.checked = true;
      }
    });
  } else if (config.type === 'radio') {
    const value = data.values[0]; // radio 只會有一個值
    if (value) {
      config.items.forEach(async selector => {
        const element = await getElement(selector);
        if (element && element.value === value) {
          element.checked = true;
        }
      });
    }
  }
  
  // 處理文字輸入
  if (config.textInput && data.other) {
    const textElement = await getElement(config.textInput);
    if (textElement) {
      textElement.value = data.other;
    }
  }
}

// 修改貼上處理函數
async function handlePaste() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_COPIED_DATA' });
    if (!response.data) {
      alert('no copied data');
      return;
    }

    const data = response.data;
    
    // 處理基本欄位
    Object.entries(FIELD_MAPPINGS).forEach(async ([key, selector]) => {
      try {
        const element = await getElement(selector);
        element.value = '';
        
        if (key === 'healthEducation') {
          element.value = await getHealthEducationText();
        } else {
          element.value = data[key] || '';
        }
      } catch (error) {
        alert(error.message);
      }
    });

    // 處理新增欄位
    Object.entries(FIELD_GROUPS).forEach(async ([group, config]) => {
      try {
        await applyFieldData(group, config, data[group]);
      } catch (error) {
        alert(`處理 ${group} 欄位時發生錯誤: ${error.message}`);
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