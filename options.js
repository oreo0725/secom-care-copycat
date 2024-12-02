// 載入儲存的設定
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['healthEducationText'], (result) => {
    document.getElementById('healthEducationText').value = 
      result.healthEducationText || '提醒近日溫氣仍不穩定，要注意保暖，尤其早晚偏涼，提醒案主要記得帶雨具、外套或帽子。心血管疾病者注意血壓變化，定期複診，如果血壓有劇烈波動要及時就診。';
  });
});

// 儲存設定
document.getElementById('save').addEventListener('click', () => {
  const text = document.getElementById('healthEducationText').value;
  chrome.storage.local.set({
    healthEducationText: text
  }, () => {
    const status = document.getElementById('status');
    status.textContent = '已儲存';
    setTimeout(() => {
      status.textContent = '';
    }, 2000);
  });
}); 