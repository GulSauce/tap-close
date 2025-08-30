let isTimerRunning = false;
let currentInterval = null;

const setHourUp = (e) => {
  if (isTimerRunning) {
    return;
  }

  const input = document.getElementById("input-hour");
  const value = parseInt(input.value);
  input.value = (value + 1) % 24;
};

const setHourDown = (e) => {
  if (isTimerRunning) {
    return;
  }

  const input = document.getElementById("input-hour");
  const value = parseInt(input.value);
  input.value = (value - 1 + 24) % 24;
};

const setMinuteUp = (e) => {
  if (isTimerRunning) {
    return;
  }

  const input = document.getElementById("input-minute");
  const value = parseInt(input.value);
  input.value = (value + 1) % 60;
};

const setMinuteDown = (e) => {
  if (isTimerRunning) {
    return;
  }

  const input = document.getElementById("input-minute");
  const value = parseInt(input.value);
  input.value = (value - 1 + 60) % 60;
};

const setSecondUp = (e) => {
  if (isTimerRunning) {
    return;
  }

  const input = document.getElementById("input-second");
  const value = parseInt(input.value);
  input.value = (value + 1) % 60;
};

const setSecondDown = (e) => {
  if (isTimerRunning) {
    return;
  }

  const input = document.getElementById("input-second");
  const value = parseInt(input.value);
  input.value = (value - 1 + 60) % 60;
};

const startTimer = (e) => {
  if (isTimerRunning) {
    return;
  }

  if (currentInterval) {
    clearInterval(currentInterval);
    currentInterval = null;
  }

  const hour = document.getElementById("input-hour").value;
  const minute = document.getElementById("input-minute").value;
  const second = document.getElementById("input-second").value;

  const totalSeconds =
    Number(hour) * 3600 + Number(minute) * 60 + Number(second);

  if (totalSeconds <= 0) {
    alert("시간을 설정해주세요!");
    return;
  }

  chrome.runtime.sendMessage(
    {
      action: "setTimer",
      seconds: totalSeconds,
    },
    (response) => {
      if (!(response || response.success)) {
        alert("타이머 설정에 실패했습니다.");
        return;
      }

      isTimerRunning = true;
      updateButtonState();
      disableInputs();
      setCountdown(totalSeconds);
    }
  );
};

const stopTimer = (e) => {
  if (!isTimerRunning) {
    return;
  }

  if (currentInterval) {
    clearInterval(currentInterval);
    currentInterval = null;
  }

  chrome.runtime.sendMessage(
    {
      action: "cancelTimer",
      tabId: currentTabId,
    },
    (response) => {
      if (!(response || response.success)) {
        alert("타이머 취소에 실패했습니다.");
        return;
      }

      isTimerRunning = false;
      updateButtonState();
      enableInputs();
    }
  );
};

const toggleTimer = () => {
  if (!isTimerRunning) {
    startTimer();
    return;
  }

  stopTimer();
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

const setCountdown = (remainingTime) => {
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
  chrome.runtime.sendMessage({ action: "getTimer" }, (response) => {
    if (response && response.remainingTime) {
      isTimerRunning = true;
      updateButtonState();
      disableInputs();
      setCountdown(response.remainingTime);
    }
  });
});
