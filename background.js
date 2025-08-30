chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "getTimer") {
    const tabId = await getTabId();
    const alarmName = `closeTab-${tabId}`;

    chrome.alarms.get(alarmName, (alarm) => {
      if (alarm) {
        remainingTime = alarm.when - Date.now();
        sendResponse({ remainingTime: remainingTime });
      } else {
        sendResponse({ remainingTime: null });
      }
    });
  }

  if (message.action === "setTimer") {
    const tabId = await getTabId();

    chrome.alarms.create(`closeTab-${tabId}`, {
      when: message.seconds * 1000 + Date.now(),
    });

    sendResponse({ success: true });
  }

  if (message.action === "cancelTimer") {
    const tabId = await getTabId();
    chrome.alarms.clear(`closeTab-${tabId}`);
  }

  return true;
});

const getTabId = () => {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs[0].id);
      reject(null);
    });
  });
};

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name.startsWith("closeTab-")) {
    const tabIdToClose = parseInt(alarm.name.split("-")[1]);

    chrome.tabs.remove(tabIdToClose, () => {});
    chrome.alarms.clear(alarm.name);
  }
});
