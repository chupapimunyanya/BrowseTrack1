function getDateString(nDate){
  let nDateDate=nDate.getDate();
  let nDateMonth=nDate.getMonth()+1;
  let nDateYear=nDate.getFullYear();
  if(nDateDate<10){nDateDate="0"+nDateDate;};
  if(nDateMonth<10){nDateMonth="0"+nDateMonth;};
  let presentDate = ""+nDateYear+"-"+nDateMonth+"-"+nDateDate;
  return presentDate;
}
function getDomain(tablink){
    let url =  tablink[0].url;
    return url.split("/")[2];
};

function secondsToString(seconds,compressed=false){
  let hours = parseInt(seconds/3600);
  seconds = seconds%3600;
  let minutes= parseInt(seconds/60);
  seconds = seconds%60;
  let timeString = "";
  if(hours){
    timeString += hours + " hr(s) ";
  }
  if(minutes){
    timeString += minutes + " min ";
  }
  if(seconds){
    timeString += seconds+ " sec "
  }
  if(!compressed){
    return timeString;
  }
  else{
    if(hours){
      return(`${hours}h`);
    }
    if(minutes){
      return(`${minutes}m`);
    }
    if(seconds){
      return(`${seconds}s`);
    }
  }
};


var allKeys, timeSpent, totalTimeSpent, sortedTimeList, topCount, topDataSet, topLabels, dateChart;
var color = [
  "rgb(139, 69, 19)",   // Dark Brown
  "rgb(160, 82, 45)",   // Saddle Brown
  "rgb(205, 133, 63)",  // Peru
  "rgb(222, 184, 135)", // Burlywood
  "rgb(245, 230, 211)", // Light Beige
  "rgb(230, 184, 156)", // Light Brown
  "rgb(143, 188, 143)", // Dark Sea Green
  "rgb(154, 205, 50)",  // Yellow Green
  "rgb(34, 139, 34)",   // Forest Green
  "rgb(50, 205, 50)"    // Lime Green
];

totalTimeSpent = 0;
var today = getDateString(new Date())
chrome.storage.local.get(today, function(storedItems){
  allKeys = Object.keys(storedItems[today]);
  timeSpent = [];
  sortedTimeList = [];
  for (let i = 0; i < allKeys.length; i++ ){
    let webURL = allKeys[i];
    timeSpent.push(storedItems[today][webURL]);
    totalTimeSpent += storedItems[today][webURL];
    sortedTimeList.push([webURL, storedItems[today][webURL]]);
  }
  sortedTimeList.sort((a,b) => b[1] - a[1]);
  console.log(sortedTimeList);

  topCount = allKeys.length > 10 ? 10 : allKeys.length;
  console.log(topCount);

  document.getElementById("totalTimeToday").innerText = secondsToString(totalTimeSpent);
  topDataSet = [];
  topLabels = [];
  for(let j = 0; j < topCount; j++){
    topDataSet.push(sortedTimeList[j][1]);
    topLabels.push(sortedTimeList[j][0]);
  }
  
  const webTable = document.getElementById('webList');
  for(let i = 0; i < allKeys.length; i++){
    let webURL = sortedTimeList[i][0];
    let row = document.createElement('tr');
    let serialNumber = document.createElement('td');
    serialNumber.innerText = i+1;
    let siteURL = document.createElement('td');
    siteURL.innerText = webURL;
    let siteTime = document.createElement('td');
    siteTime.innerText = secondsToString(sortedTimeList[i][1]);
    row.appendChild(serialNumber);
    row.appendChild(siteURL);
    row.appendChild(siteTime);
    webTable.appendChild(row);
    console.log(row);
  }
  
  // Changed to a single stacked horizontal bar chart
  new Chart(document.getElementById("pie-chart"), {
    type: 'horizontalBar',
    data: {
      labels: [''],  // Empty label for the y-axis
      datasets: topLabels.map((label, index) => {
        return {
          label: label,
          backgroundColor: color[index % color.length],
          data: [topDataSet[index]], // Each dataset has just one value
          borderWidth: 1,
          borderColor: '#fff',
          barThickness: 40, // Setting barThickness at dataset level
          maxBarThickness: 40,
          
        }
      })
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      title: {
        display: false // Hide title
      },
      legend: {
        display: true,
        position: 'top', // Show domains on top
        labels: {
          padding: 5, // Reduce padding in legend labels
          boxWidth: 10, // Smaller color boxes
          fontSize: 14 // Slightly smaller text
        },
        align: 'center'
      },
      layout: {
        padding: {
          top: 5,
          bottom: 5,
          right: 5,
          left: 5
        }
      },
      plugins: {
        datalabels: {
          display: false // Disable datalabels if you have this plugin
        }
      },
      scales: {
        xAxes: [{
          stacked: true, // This makes the bars stack
          ticks: {
            display: false, // Hide ticks
            beginAtZero: true
          },
          gridLines: {
            display: false // Hide grid lines
          }
        }],
        yAxes: [{
          stacked: true, // This makes the bars stack
          gridLines: {
            display: false // Hide grid lines
          },
          ticks: {
            display: false // Hide ticks
          }
        }]
      },
      tooltips: {
        enabled: true,
        mode: 'nearest',
        intersect: true,
        callbacks: {
          title: function(tooltipItems, data) {
            const datasetIndex = tooltipItems[0].datasetIndex;
            return data.datasets[datasetIndex].label;
          },
          label: function(tooltipItem, data) {
            return 'Time spent: ' + secondsToString(tooltipItem.value);
          }
        }
      }
    }
  });
});

chrome.storage.local.get(null,function(items){
  let datesStored = Object.keys(items);
  datesStored.sort();
  const calendar = document.getElementById("dateValue");
  let minDate = datesStored[0];
  let maxDate = datesStored[datesStored.length-1];
  calendar.min = minDate;
  calendar.max = maxDate;
});


document.getElementById("dateSubmit").addEventListener('click',function(){
  const calendar = document.getElementById("dateValue");
  if(calendar.value===""){
    document.getElementById("tryAgain").innerText = "Invalid date! Please try again.";
    document.getElementById("tryAgain").classList.remove("d-none");
  }
  else{
    document.getElementById("tryAgain").classList.add("d-none");
    let givenDate = calendar.value;
    chrome.storage.local.get(givenDate,function(thatDay){
      if(thatDay[givenDate] == null){
        document.getElementById("tryAgain").innerText = "No records exist for this day!";
        document.getElementById("tryAgain").classList.remove("d-none");
      }
      else{
        let sites = Object.keys(thatDay[givenDate]);
        let times=[];
        for(let i=0;i<sites.length;i++){
          times.push([sites[i],thatDay[givenDate][sites[i]]]);
        }
        times.sort(function(a,b){return b[1]-a[1]});
        let topTen = times.length>10? 10:times.length;
        let dataSet = [];
        let thatDayTotal = 0;
        let dataSetLabels = [];
        
        for(let i=0;i<topTen;i++){
          dataSet.push(times[i][1]);
          dataSetLabels.push(times[i][0]);
          thatDayTotal+= times[i][1];
        }
        
        let chartTitle = "Top Visited Sites on "+givenDate;
        
        if(dateChart){
          dateChart.destroy()
        }
        
        // Create new chart using dataSetLabels and dataSet directly
        dateChart = new Chart(document.getElementById("differentDayChart"), {
          type: 'horizontalBar',
          data: {
            labels: [''],  // Empty label for the y-axis
            datasets: dataSetLabels.map((label, index) => {
              return {
                label: label,
                backgroundColor: color[index % color.length],
                data: [dataSet[index]], // Each dataset has just one value
                borderWidth: 1,
                borderColor: '#fff',
                barThickness: 40,
                maxBarThickness: 40,
              }
            })
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            title: {
              display: false // Hide title
            },
            legend: {
              display: true,
              position: 'top', // Show domains on top
              labels: {
                padding: 5, // Reduce padding in legend labels
                boxWidth: 10, // Smaller color boxes
                fontSize: 14 // Slightly smaller text
              },
              align: 'center'
            },
            layout: {
              padding: {
                top: 5,
                bottom: 5,
                right: 5,
                left: 5
              }
            },
            plugins: {
              datalabels: {
                display: false // Disable datalabels if you have this plugin
              }
            },
            scales: {
              xAxes: [{
                stacked: true, // This makes the bars stack
                ticks: {
                  display: false, // Hide ticks
                  beginAtZero: true
                },
                gridLines: {
                  display: false // Hide grid lines
                }
              }],
              yAxes: [{
                stacked: true, // This makes the bars stack
                gridLines: {
                  display: false // Hide grid lines
                },
                ticks: {
                  display: false // Hide ticks
                }
              }]
            },
            tooltips: {
              enabled: true,
              mode: 'nearest',
              intersect: true,
              callbacks: {
                title: function(tooltipItems, data) {
                  const datasetIndex = tooltipItems[0].datasetIndex;
                  return data.datasets[datasetIndex].label;
                },
                label: function(tooltipItem, data) {
                  return 'Time spent: ' + secondsToString(tooltipItem.value);
                }
              }
            }
          }
        });
  
        document.getElementById("statsRow").classList.remove("d-none");
        document.getElementById("totalTimeThatDay").innerText = secondsToString(thatDayTotal);
        const webList2 = document.getElementById("webList2");
        while (webList2.firstChild) {
          webList2.removeChild(webList2.lastChild);
        }
        for(let i=0;i<times.length;i++){
          let row = document.createElement('tr');
          let col1 = document.createElement('td');
          col1.innerText = i+1;
          row.appendChild(col1);
          let col2 = document.createElement('td');
          col2.innerText = times[i][0];
          row.appendChild(col2);
          let col3 = document.createElement('td');
          col3.innerText = secondsToString(times[i][1]);
          row.appendChild(col3);
          webList2.appendChild(row);
        }   
      }
    });
  }
});

// Add event listener for Last 7 Days button
document.getElementById("last7DaysSubmit").addEventListener('click', function() {
  document.getElementById("tryAgain").classList.add("d-none");
  
  // Get current date and format it as YYYY-MM-DD
  const today = new Date();
  
  // Create an array to store the last 7 days dates
  const last7Days = [];
  
  // Generate the dates for the last 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // Format date as YYYY-MM-DD (same format as calendar value)
    const formattedDate = date.toISOString().split('T')[0];
    last7Days.push(formattedDate);
  }
  
  // Store for accumulated data across all days
  let aggregatedData = {};
  let daysProcessed = 0;
  let missedDays = 0;
  
  // Process each day and aggregate the results
  last7Days.forEach(day => {
    chrome.storage.local.get(day, function(thatDay) {
      daysProcessed++;
      
      if (thatDay[day] != null) {
        // Process data for this day
        const sites = Object.keys(thatDay[day]);
        
        // Add each site's time to the aggregated data
        sites.forEach(site => {
          if (aggregatedData[site]) {
            aggregatedData[site] += thatDay[day][site];
          } else {
            aggregatedData[site] = thatDay[day][site];
          }
        });
      } else {
        // No data for this day
        missedDays++;
      }
      
      // When all days have been processed, display the results
      if (daysProcessed === 7) {
        if (Object.keys(aggregatedData).length === 0) {
          document.getElementById("tryAgain").innerText = "No records exist for the last 7 days!";
          document.getElementById("tryAgain").classList.remove("d-none");
          return;
        }
        
        // Convert aggregated data to array format for sorting
        let times = Object.keys(aggregatedData).map(site => [site, aggregatedData[site]]);
        
        // Sort by time (descending)
        times.sort(function(a, b) { return b[1] - a[1] });
        
        // Take top 10 (or fewer if less than 10 sites)
        let topTen = times.length > 10 ? 10 : times.length;
        let dataSet = [];
        let totalTime = 0;
        let dataSetLabels = [];
        
        for (let i = 0; i < topTen; i++) {
          dataSet.push(times[i][1]);
          dataSetLabels.push(times[i][0]);
          totalTime += times[i][1];
        }
        
        // Generate chart title with date range
        const startDate = last7Days[6];
        const endDate = last7Days[0];
        let chartTitle = `Top Visited Sites (${startDate} to ${endDate})`;
        
        // Destroy existing chart if it exists
        if (dateChart) {
          dateChart.destroy();
        }
        
        // Create new chart with aggregated data
        dateChart = new Chart(document.getElementById("differentDayChart"), {
          type: 'horizontalBar',
          data: {
            labels: [''],  // Empty label for the y-axis
            datasets: dataSetLabels.map((label, index) => {
              return {
                label: label,
                backgroundColor: color[index % color.length],
                data: [dataSet[index]], // Each dataset has just one value
                borderWidth: 1,
                borderColor: '#fff',
                barThickness: 40,
                maxBarThickness: 40,
              }
            })
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            title: {
              display: false // Hide title
            },
            legend: {
              display: true,
              position: 'top', // Show domains on top
              labels: {
                padding: 5, // Reduce padding in legend labels
                boxWidth: 10, // Smaller color boxes
                fontSize: 14 // Slightly smaller text
              },
              align: 'center'
            },
            layout: {
              padding: {
                top: 5,
                bottom: 5,
                right: 5,
                left: 5
              }
            },
            plugins: {
              datalabels: {
                display: false // Disable datalabels if you have this plugin
              }
            },
            scales: {
              xAxes: [{
                stacked: true, // This makes the bars stack
                ticks: {
                  display: false, // Hide ticks
                  beginAtZero: true
                },
                gridLines: {
                  display: false // Hide grid lines
                }
              }],
              yAxes: [{
                stacked: true, // This makes the bars stack
                gridLines: {
                  display: false // Hide grid lines
                },
                ticks: {
                  display: false // Hide ticks
                }
              }]
            },
            tooltips: {
              enabled: true,
              mode: 'nearest',
              intersect: true,
              callbacks: {
                title: function(tooltipItems, data) {
                  const datasetIndex = tooltipItems[0].datasetIndex;
                  return data.datasets[datasetIndex].label;
                },
                label: function(tooltipItem, data) {
                  return 'Time spent: ' + secondsToString(tooltipItem.value);
                }
              }
            }
          }
        });
        
        // Show stats row and update total time
        document.getElementById("statsRow").classList.remove("d-none");
        document.getElementById("totalTimeThatDay").innerText = secondsToString(totalTime);
        
        // Update table with all the sites data
        const webList2 = document.getElementById("webList2");
        while (webList2.firstChild) {
          webList2.removeChild(webList2.lastChild);
        }
        
        for (let i = 0; i < times.length; i++) {
          let row = document.createElement('tr');
          
          let col1 = document.createElement('td');
          col1.innerText = i + 1;
          row.appendChild(col1);
          
          let col2 = document.createElement('td');
          col2.innerText = times[i][0];
          row.appendChild(col2);
          
          let col3 = document.createElement('td');
          col3.innerText = secondsToString(times[i][1]);
          row.appendChild(col3);
          
          webList2.appendChild(row);
        }
      }
    });
  });
});

function getDateTotalTime(storedObject,date){
  let websiteLinks = Object.keys(storedObject[date]);
  let noOfWebsites = websiteLinks.length;
  let totalTime = 0;
  for(let i = 0 ; i<noOfWebsites;i++){
    totalTime+= storedObject[date][websiteLinks[i]];
  }
  return totalTime;
};
var monthNames = ["","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
document.getElementById('weekTab').addEventListener('click',function(){
  chrome.storage.local.get(null,function(storedItems){
    let datesList = Object.keys(storedItems);
    let noOfDays = datesList.length>=7 ? 7 : datesList.length;
    let timeEachDay= [];
    let dateLabels = [];
    let weeksTotalTime= 0;
    datesList.sort();
    for(let i = datesList.length-noOfDays;i<datesList.length;i++){
      let month = parseInt(datesList[i][5]+datesList[i][6]);
      let label = datesList[i][8]+datesList[i][9]+" "+monthNames[month];
      //0123-56-89
      dateLabels.push(label);
      let dayTime = getDateTotalTime(storedItems,datesList[i]);
      timeEachDay.push(dayTime);
      weeksTotalTime += dayTime;
    }
    let weeklyAverage = parseInt(weeksTotalTime/noOfDays);
    weeklyAverage = secondsToString(weeklyAverage);
    let weeklyMax = Math.max.apply(Math,timeEachDay);
    weeklyMax = secondsToString(weeklyMax);
    document.getElementById("weekAvg").innerText = weeklyAverage;
    document.getElementById("weekMax").innerText = weeklyMax;
    const weeklyChart = document.getElementById("pastWeek");
    let weeklyChartDetails = {};
    weeklyChartDetails["type"]= 'line';
    let dataObj= {};
    dataObj["labels"] = dateLabels;
    dataObj["datasets"] = [{label:"Time Spent",
    fill:true,
    backgroundColor: "rgb(250, 230, 199)",
    lineTension:0.2,
    borderColor: "rgb(193, 154, 107)",
    pointBackgroundColor:"rgb(243, 217, 178)",
    data: timeEachDay,
  }]
    weeklyChartDetails["data"] = dataObj;
    weeklyChartDetails["options"] = {
      legend:{display:false},
      //title:{display:true,text:"Time Spent Online in the Recent Past"},
      scales:{yAxes:[{scaleLabel:{display:true,labelString:"Time (sec)", fontSize:10},}]}
    };
    new Chart(weeklyChart,weeklyChartDetails);
  });
});


// Function to export table data to Excel
function exportTableToExcel(tableId, fileName) {
  // Get the table element
  const table = document.getElementById(tableId);
  if (!table) return;
  
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  
  // Extract data from table
  const data = [];
  
  // Add header row
  const headerRow = [];
  const headers = table.querySelectorAll('thead th');
  headers.forEach(header => {
    headerRow.push(header.innerText);
  });
  data.push(headerRow);
  
  // Add data rows
  const rows = table.querySelectorAll('tbody tr');
  rows.forEach(row => {
    const dataRow = [];
    const cells = row.querySelectorAll('td');
    cells.forEach(cell => {
      dataRow.push(cell.innerText);
    });
    data.push(dataRow);
  });
  
  // Create worksheet from data
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  
  // Generate filename with current date
  const today = getDateString(new Date());
  const fullFileName = `${fileName}_${today}.xlsx`;
  
  // Write workbook and download
  XLSX.writeFile(wb, fullFileName);
}

// Event listeners for export buttons
document.addEventListener('DOMContentLoaded', function() {
  // Export button for today's data
  document.getElementById('exportBtn1').addEventListener('click', function() {
    exportTableToExcel('webList', 'BrowseTrack_Today');
  });
  
  // Export button for specific date data
  document.getElementById('exportBtn2').addEventListener('click', function() {
    const selectedDate = document.getElementById('dateValue').value;
    const fileName = selectedDate ? 
      `BrowseTrack_${selectedDate}` : 
      'BrowseTrack_Selected_Date';
    exportTableToExcel('webList2', fileName);
  });
});


// Функция для создания кастомного календаря в BrowseTrack
function initBrowseTrackCalendar() {
  // Находим элементы DOM
  const dateInput = document.getElementById('dateValue');
  const dateSubmitBtn = document.getElementById('dateSubmit');
  
  if (!dateInput) return; // Выходим, если элемент не найден
  
  // Создаем HTML-структуру для кастомного календаря
  const calendarEl = document.createElement('div');
  calendarEl.className = 'bt-calendar';
  calendarEl.id = 'btCalendar';
  
  // Добавляем HTML для календаря
  calendarEl.innerHTML = `
    <div class="bt-calendar-header">
      <div class="bt-month-nav">
        <button type="button" class="bt-nav-btn" id="btPrevMonth">&lt;</button>
        <span class="bt-month-year" id="btCurrentMonthYear"></span>
        <button type="button" class="bt-nav-btn" id="btNextMonth">&gt;</button>
      </div>
    </div>
    <div class="bt-calendar-days" id="btCalendarDays">
      <div class="bt-day-name">Mon</div>
      <div class="bt-day-name">Tue</div>
      <div class="bt-day-name">Wed</div>
      <div class="bt-day-name">Thu</div>
      <div class="bt-day-name">Fri</div>
      <div class="bt-day-name">Sat</div>
      <div class="bt-day-name">Sun</div>
    </div>
    <div class="bt-calendar-actions">
      <button type="button" class="bt-action-btn bt-clear-btn" id="btClearDate">Clear</button>
      <button type="button" class="bt-action-btn bt-today-btn" id="btTodayDate">Today</button>
    </div>
  `;
  
  // Вставляем календарь после input
  dateInput.parentNode.insertBefore(calendarEl, dateInput.nextSibling);
  
  // Находим элементы управления календарем
  const calendarContainer = document.getElementById('btCalendar');
  const monthYearEl = document.getElementById('btCurrentMonthYear');
  const prevMonthBtn = document.getElementById('btPrevMonth');
  const nextMonthBtn = document.getElementById('btNextMonth');
  const clearDateBtn = document.getElementById('btClearDate');
  const todayDateBtn = document.getElementById('btTodayDate');
  const calendarDaysContainer = document.getElementById('btCalendarDays');
  
  // Состояние календаря
  let currentDate = new Date();
  let selectedDate = null;
  
// Array of months
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

  
  // Функция обновления календаря
  function renderCalendar() {
    // Обновляем заголовок с месяцем и годом
    monthYearEl.textContent = `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    
    // Очищаем дни календаря (кроме дней недели)
    const dayElements = calendarDaysContainer.querySelectorAll('.bt-calendar-day');
    dayElements.forEach(day => day.remove());
    
    // Получаем первый день месяца
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    // Получаем последний день месяца
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    // Определяем день недели для первого дня месяца (0 - воскресенье, 1 - понедельник)
    let firstDayOfWeek = firstDayOfMonth.getDay();
    // Преобразуем для календаря, начинающегося с понедельника
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    // Добавляем пустые ячейки для выравнивания первого дня
    for (let i = 0; i < firstDayOfWeek; i++) {
      const emptyDay = document.createElement('div');
      emptyDay.className = 'bt-calendar-day';
      calendarDaysContainer.appendChild(emptyDay);
    }
    
    // Заполняем календарь днями текущего месяца
    const today = new Date();
    
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const dayElement = document.createElement('div');
      dayElement.className = 'bt-calendar-day bt-day';
      dayElement.textContent = day;
      
      const dateToCheck = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      
      // Отмечаем сегодняшний день
      if (
        today.getDate() === day && 
        today.getMonth() === currentDate.getMonth() && 
        today.getFullYear() === currentDate.getFullYear()
      ) {
        dayElement.classList.add('today');
      }
      
      // Отмечаем выбранный день
      if (
        selectedDate && 
        selectedDate.getDate() === day && 
        selectedDate.getMonth() === currentDate.getMonth() && 
        selectedDate.getFullYear() === currentDate.getFullYear()
      ) {
        dayElement.classList.add('selected');
      }
      
      // Добавляем обработчик клика для выбора даты
      dayElement.addEventListener('click', () => {
        selectDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
      });
      
      calendarDaysContainer.appendChild(dayElement);
    }
  }
  
  // Функция для выбора даты
  function selectDate(date) {
    selectedDate = date;
    
    // Форматируем дату для input в формате YYYY-MM-DD
    const formattedDate = formatDate(date);
    dateInput.value = formattedDate;
    
    // Обновляем отображение календаря
    renderCalendar();
    
    // Скрываем календарь
    calendarContainer.classList.remove('show');
  }
  
  // Функция форматирования даты в формат YYYY-MM-DD
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Функция для перехода к предыдущему месяцу
  function gotoPrevMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  }
  
  // Функция для перехода к следующему месяцу
  function gotoNextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  }
  
  // Функция для выбора текущей даты
  function selectToday() {
    const today = new Date();
    currentDate = new Date(today.getFullYear(), today.getMonth(), 1);
    selectDate(today);
  }
  
  // Функция для очистки выбранной даты
  function clearDate() {
    selectedDate = null;
    dateInput.value = '';
    renderCalendar();
    calendarContainer.classList.remove('show');
  }
  
  // Обработчики событий для управления календарем
  prevMonthBtn.addEventListener('click', gotoPrevMonth);
  nextMonthBtn.addEventListener('click', gotoNextMonth);
  clearDateBtn.addEventListener('click', clearDate);
  todayDateBtn.addEventListener('click', selectToday);
  
  // Показываем календарь при клике на input
  dateInput.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    calendarContainer.classList.toggle('show');
  });
  
  // Скрываем календарь при клике вне его области
  document.addEventListener('click', function(e) {
    if (!calendarContainer.contains(e.target) && e.target !== dateInput) {
      calendarContainer.classList.remove('show');
    }
  });
  
  // Предотвращаем открытие нативного календаря
  dateInput.addEventListener('focus', function(e) {
    this.blur();
  });
  
  // Инициализируем календарь
  renderCalendar();
  
  // Если в input уже есть дата, устанавливаем её в календаре
  if (dateInput.value) {
    const parts = dateInput.value.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        selectedDate = date;
        currentDate = new Date(year, month, 1);
        renderCalendar();
      }
    }
  }
}

// Запускаем инициализацию календаря после загрузки DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBrowseTrackCalendar);
} else {
  initBrowseTrackCalendar();
}