chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getTimer") {
    const tabId = message.tabId;

    // 스토리지에서 해당 탭의 종료 시간을 찾음
    chrome.storage.local.get(`timer-${tabId}`, (result) => {
      // 찾은 정보를 담아 응답을 보냄
      sendResponse({ scheduledTime: result[`timer-${tabId}`] || null });
    });

    return true; // 비동기 응답을 위해 필수
  }
});
