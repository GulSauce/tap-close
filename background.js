chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getTimer") {
    (async () => {
      const tabId = await getTabId();
      const alarmName = `closeTab-${tabId}`;

      chrome.alarms.get(alarmName, (alarm) => {
        if (alarm) {
          const remainingTime = alarm.scheduledTime - Date.now();
          sendResponse({ remainingTime: remainingTime });
        } else {
          sendResponse({ remainingTime: null });
        }
      });
    })();
    return true;
  }

  if (message.action === "getRecentlySetSeconds") {
    (async () => {
      const recentlySetSeconds =
        (await chrome.storage.local.get("recentlySetSeconds"))
          .recentlySetSeconds || 0;

      sendResponse({ recentlySetSeconds: recentlySetSeconds });
    })();
    return true;
  }

  if (message.action === "setTimer") {
    (async () => {
      const tabId = await getTabId();
      if (!tabId) return;

      chrome.storage.local.set({ recentlySetSeconds: message.seconds });

      chrome.alarms.create(`closeTab-${tabId}`, {
        when: message.seconds * 1000 + Date.now(),
      });
      sendResponse({ success: true });
    })();
    return true;
  }

  if (message.action === "cancelTimer") {
    (async () => {
      const tabId = await getTabId();
      if (!tabId) return;

      chrome.alarms.clear(`closeTab-${tabId}`, (wasCleared) => {
        sendResponse({ success: wasCleared });
      });
    })();
    return true;
  }
});

const getTabId = () => {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs.length > 0 && tabs[0].id) {
        resolve(tabs[0].id);
      } else {
        resolve(null);
      }
    });
  });
};

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name.startsWith("closeTab-")) {
    const tabIdToClose = parseInt(alarm.name.split("-")[1]);
    if (!isNaN(tabIdToClose)) {
      chrome.tabs.remove(tabIdToClose);
      chrome.alarms.clear(alarm.name);
    }
  }
});
