const setHourUp = (e) => {
  const input = document.getElementById("input-hour");
  const value = parseInt(input.value);
  input.value = (value + 1) % 24;
};

const setHourDown = (e) => {
  const input = document.getElementById("input-hour");
  const value = parseInt(input.value);
  input.value = (value - 1 + 24) % 24;
};

const setMinuteUp = (e) => {
  const input = document.getElementById("input-minute");
  const value = parseInt(input.value);
  input.value = (value + 1) % 60;
};

const setMinuteDown = (e) => {
  const input = document.getElementById("input-minute");
  const value = parseInt(input.value);
  input.value = (value - 1 + 60) % 60;
};

const setSecondUp = (e) => {
  const input = document.getElementById("input-second");
  const value = parseInt(input.value);
  input.value = (value + 1) % 60;
};

const setSecondDown = (e) => {
  const input = document.getElementById("input-second");
  const value = parseInt(input.value);
  input.value = (value - 1 + 60) % 60;
};

let isTimerRunning = false;
let currentInterval = null;

const startTimer = (e) => {
  const hour = document.getElementById("input-hour").value;
  const minute = document.getElementById("input-minute").value;
  const second = document.getElementById("input-second").value;

  const totalSeconds =
    Number(hour) * 3600 + Number(minute) * 60 + Number(second);

  if (totalSeconds <= 0) {
    alert("시간을 설정해주세요!");
    return;
  }

  isTimerRunning = true;
  updateButtonState();
  disableInputs();

  startCountdown(totalSeconds);
};

const stopTimer = (e) => {
  //   chrome.runtime.sendMessage({ action: "stopTimer" });

  if (currentInterval) {
    clearInterval(currentInterval);
    currentInterval = null;
  }

  isTimerRunning = false;
  updateButtonState();
  enableInputs();
};

const toggleTimer = () => {
  if (isTimerRunning) {
    stopTimer();
  } else {
    startTimer();
  }
};

const updateButtonState = () => {
  const button = document.getElementById("timer-button");
  const icon = button.querySelector(".button-icon");

  if (isTimerRunning) {
    icon.className = "fas fa-stop button-icon";
    button.lastChild.textContent = "타이머 중지";
  } else {
    icon.className = "fas fa-play button-icon";
    button.lastChild.textContent = "타이머 시작";
  }
};

const enableInputs = () => {
  document.getElementById("input-hour").disabled = false;
  document.getElementById("input-minute").disabled = false;
  document.getElementById("input-second").disabled = false;
};

const disableInputs = () => {
  document.getElementById("input-hour").disabled = true;
  document.getElementById("input-minute").disabled = true;
  document.getElementById("input-second").disabled = true;
};

const startCountdown = (remainingTime) => {
  if (currentInterval) {
    clearInterval(currentInterval);
  }

  currentInterval = setInterval(() => {
    if (remainingTime <= 0) {
      clearInterval(currentInterval);
      currentInterval = null;
      isTimerRunning = false;
      updateButtonState();
      enableInputs();
      return;
    }

    remainingTime = remainingTime - 1;
    let currentRemainingTime = remainingTime;
    const hours = Math.floor(currentRemainingTime / 60 / 60);
    currentRemainingTime = currentRemainingTime - hours * 60 * 60;

    const minutes = Math.floor(currentRemainingTime / 60);
    currentRemainingTime = currentRemainingTime - minutes * 60;
    const seconds = currentRemainingTime;

    document.getElementById("input-hour").value = hours;
    document.getElementById("input-minute").value = minutes;
    document.getElementById("input-second").value = seconds;
  }, 1000);
};

document.addEventListener("DOMContentLoaded", () => {
  // 현재 탭 정보 가져오기
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTabId = tabs[0].id;

    // background.js에 종료 시간을 물어봄
    chrome.runtime.sendMessage(
      { action: "getTimer", tabId: currentTabId },
      (response) => {
        // 3단계: 응답 처리
        if (response && response.remainingTime) {
          isTimerRunning = true;
          updateButtonState();
          disableInputs();
          startCountdown(response.remainingTime);
        }
      }
    );
  });
});
