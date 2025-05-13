// Вспомогательные функции
function isValidURL(givenURL) {
  if (givenURL) {
    if (givenURL.includes(".")) {
      return true;
    }
    else {
      return false;
    }
  }
  else {
    return false;
  }
}

function secondsToString(seconds, compressed = false) {
  let hours = parseInt(seconds / 3600);
  seconds = seconds % 3600;
  let minutes = parseInt(seconds / 60);
  seconds = seconds % 60;
  let timeString = "";
  if (hours) {
    timeString += hours + " hrs ";
  }
  if (minutes) {
    timeString += minutes + " min ";
  }
  if (seconds) {
    timeString += seconds + " sec ";
  }
  if (!compressed) {
    return timeString;
  }
  else {
    if (hours) {
      return (`${hours}h`);
    }
    if (minutes) {
      return (`${minutes}m`);
    }
    if (seconds) {
      return (`${seconds}s`);
    }
    return "";
  }
}

function getDateString(nDate) {
  let nDateDate = nDate.getDate();
  let nDateMonth = nDate.getMonth() + 1;
  let nDateYear = nDate.getFullYear();
  if (nDateDate < 10) { nDateDate = "0" + nDateDate; };
  if (nDateMonth < 10) { nDateMonth = "0" + nDateMonth; };
  let presentDate = nDateYear + "-" + nDateMonth + "-" + nDateDate;
  return presentDate;
}

function getDomain(tablink) {
  if (tablink && tablink.length > 0 && tablink[0].url) {
    let url = tablink[0].url;
    return url.split("/")[2];
  }
  else {
    return null;
  }
}

// Основная функция обновления времени
function updateTime() {
  chrome.tabs.query({ "active": true, "lastFocusedWindow": true }, function (activeTab) {
    let domain = getDomain(activeTab);
    if (isValidURL(domain)) {
      let today = new Date();
      let presentDate = getDateString(today);
      let timeSoFar = 0;
      
      chrome.storage.local.get(presentDate, function (storedObject) {
        if (storedObject[presentDate]) {
          if (storedObject[presentDate][domain]) {
            timeSoFar = storedObject[presentDate][domain] + 1;
            storedObject[presentDate][domain] = timeSoFar;
          }
          else {
            timeSoFar++;
            storedObject[presentDate][domain] = timeSoFar;
          }
        }
        else {
          timeSoFar++;
          storedObject[presentDate] = {};
          storedObject[presentDate][domain] = timeSoFar;
        }
        
        chrome.storage.local.set(storedObject, function () {
          console.log("Set " + domain + " at " + storedObject[presentDate][domain]);
          // Используем chrome.action вместо chrome.browserAction
          chrome.action.setBadgeText({ 'text': secondsToString(timeSoFar, true) });
        });
      });
    }
    else {
      // Используем chrome.action вместо chrome.browserAction
      chrome.action.setBadgeText({ 'text': '' });
    }
  });
}

// Обработка состояния активности в Service Worker
let trackerState = {
  intervalID: null,
  isRunning: false
};

// Инициализация трекера
function initTracker() {
  if (!trackerState.isRunning) {
    trackerState.intervalID = setInterval(updateTime, 1000);
    trackerState.isRunning = true;
  }
}

// Остановка трекера
function stopTracker() {
  if (trackerState.isRunning && trackerState.intervalID) {
    clearInterval(trackerState.intervalID);
    trackerState.intervalID = null;
    trackerState.isRunning = false;
  }
}

// Проверка фокуса окна
function checkFocus() {
  chrome.windows.getCurrent(function (window) {
    if (window.focused) {
      initTracker();
    }
    else {
      stopTracker();
    }
  });
}

// Service Worker активируется при установке расширения
chrome.runtime.onInstalled.addListener(() => {
  console.log('BrowseTrack extension installed');
  initTracker();
});

// Сохраняем трекер активным при изменении вкладок
chrome.tabs.onActivated.addListener(() => {
  updateTime();
});

// Регулярная проверка фокуса
setInterval(checkFocus, 500);

// Предотвращение выгрузки Service Worker
const keepAlive = () => setInterval(chrome.runtime.getPlatformInfo, 20e3);
chrome.runtime.onStartup.addListener(keepAlive);
keepAlive();