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
      disableInputs();
      updateButtonStop();
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
    },
    (response) => {
      if (!(response || response.success)) {
        alert("타이머 취소에 실패했습니다.");
        return;
      }

      isTimerRunning = false;
      updateButtonStart();
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

const updateButtonStop = () => {
  const button = document.getElementById("timer-button");
  const icon = button.querySelector(".button-icon");
  icon.className = "fas fa-stop button-icon";
  button.lastChild.textContent = "타이머 중지";
};

const updateButtonStart = () => {
  const button = document.getElementById("timer-button");
  const icon = button.querySelector(".button-icon");
  icon.className = "fas fa-play button-icon";
  button.lastChild.textContent = "타이머 시작";
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
    remainingTime = remainingTime - 1;
    setTimeBySeconds(remainingTime);
  }, 1000);
};

const setTimeBySeconds = (seconds) => {
  document.getElementById("input-hour").value = Math.floor(seconds / 3600);
  document.getElementById("input-minute").value = Math.floor(
    (seconds % 3600) / 60
  );
  document.getElementById("input-second").value = seconds % 60;
};

document.addEventListener("DOMContentLoaded", () => {
  // 이벤트 리스너 등록
  document.getElementById("hour-up").addEventListener("click", setHourUp);
  document.getElementById("hour-down").addEventListener("click", setHourDown);
  document.getElementById("minute-up").addEventListener("click", setMinuteUp);
  document
    .getElementById("minute-down")
    .addEventListener("click", setMinuteDown);
  document.getElementById("second-up").addEventListener("click", setSecondUp);
  document
    .getElementById("second-down")
    .addEventListener("click", setSecondDown);
  document
    .getElementById("timer-button")
    .addEventListener("click", toggleTimer);

  chrome.runtime.sendMessage({ action: "getTimer" }, (response) => {
    if (response && response.remainingTime) {
      isTimerRunning = true;
      setTimeBySeconds(Math.floor(response.remainingTime / 1000));
      updateButtonStop();
      disableInputs();
      setCountdown(Math.floor(response.remainingTime / 1000));
      return;
    }
    chrome.runtime.sendMessage(
      { action: "getRecentlySetSeconds" },
      (response) => {
        setTimeBySeconds(response.recentlySetSeconds);
        updateButtonStart();
        enableInputs();
      }
    );
  });
});
