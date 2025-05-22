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
  "rgb(139, 69, 19)",   //Dark Brown
  "rgb(160, 82, 45)",   //Saddle Brown
  "rgb(205, 133, 63)",  //Peru
  "rgb(222, 184, 135)", //Burlywood
  "rgb(245, 230, 211)", //Light Beige
  "rgb(230, 184, 156)", //Light Brown
  "rgb(143, 188, 143)", //Dark Sea Green
  "rgb(154, 205, 50)",  //Yellow Green
  "rgb(34, 139, 34)",   //Forest Green
  "rgb(50, 205, 50)"    //Lime Green
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
  
  //Horizontal bar chart
  new Chart(document.getElementById("pie-chart"), {
    type: 'horizontalBar',
    data: {
      labels: [''],
      datasets: topLabels.map((label, index) => {
        return {
          label: label,
          backgroundColor: color[index % color.length],
          data: [topDataSet[index]],
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
        display: false
      },
      legend: {
        display: true,
        position: 'top',
        labels: {
          padding: 5,
          boxWidth: 10,
          fontSize: 14
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
          display: false 
        }
      },
      scales: {
        xAxes: [{
          stacked: true,
          ticks: {
            display: false,
            beginAtZero: true
          },
          gridLines: {
            display: false 
          }
        }],
        yAxes: [{
          stacked: true, 
          gridLines: {
            display: false
          },
          ticks: {
            display: false 
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
        
        dateChart = new Chart(document.getElementById("differentDayChart"), {
          type: 'horizontalBar',
          data: {
            labels: [''], 
            datasets: dataSetLabels.map((label, index) => {
              return {
                label: label,
                backgroundColor: color[index % color.length],
                data: [dataSet[index]], 
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
              display: false 
            },
            legend: {
              display: true,
              position: 'top',
              labels: {
                padding: 5, 
                boxWidth: 10, 
                fontSize: 14 
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
                display: false 
              }
            },
            scales: {
              xAxes: [{
                stacked: true, 
                ticks: {
                  display: false, 
                  beginAtZero: true
                },
                gridLines: {
                  display: false 
                }
              }],
              yAxes: [{
                stacked: true, 
                gridLines: {
                  display: false 
                },
                ticks: {
                  display: false 
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

//Last 7 Days
document.getElementById("last7DaysSubmit").addEventListener('click', function() {
  document.getElementById("tryAgain").classList.add("d-none");
  
  const today = new Date();
  
  const last7Days = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    const formattedDate = date.toISOString().split('T')[0];
    last7Days.push(formattedDate);
  }
  
  let aggregatedData = {};
  let daysProcessed = 0;
  let missedDays = 0;
  
  last7Days.forEach(day => {
    chrome.storage.local.get(day, function(thatDay) {
      daysProcessed++;
      
      if (thatDay[day] != null) {
        const sites = Object.keys(thatDay[day]);
        
        sites.forEach(site => {
          if (aggregatedData[site]) {
            aggregatedData[site] += thatDay[day][site];
          } else {
            aggregatedData[site] = thatDay[day][site];
          }
        });
      } else {
        missedDays++;
      }
      
      if (daysProcessed === 7) {
        if (Object.keys(aggregatedData).length === 0) {
          document.getElementById("tryAgain").innerText = "No records exist for the last 7 days!";
          document.getElementById("tryAgain").classList.remove("d-none");
          return;
        }
        
        let times = Object.keys(aggregatedData).map(site => [site, aggregatedData[site]]);
        
        times.sort(function(a, b) { return b[1] - a[1] });
        
        let topTen = times.length > 10 ? 10 : times.length;
        let dataSet = [];
        let totalTime = 0;
        let dataSetLabels = [];
        
        for (let i = 0; i < topTen; i++) {
          dataSet.push(times[i][1]);
          dataSetLabels.push(times[i][0]);
          totalTime += times[i][1];
        }
        
        const startDate = last7Days[6];
        const endDate = last7Days[0];
        let chartTitle = `Top Visited Sites (${startDate} to ${endDate})`;
        
        if (dateChart) {
          dateChart.destroy();
        }
        
        dateChart = new Chart(document.getElementById("differentDayChart"), {
          type: 'horizontalBar',
          data: {
            labels: [''], 
            datasets: dataSetLabels.map((label, index) => {
              return {
                label: label,
                backgroundColor: color[index % color.length],
                data: [dataSet[index]], 
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
              display: false 
            },
            legend: {
              display: true,
              position: 'top',
              labels: {
                padding: 5, 
                boxWidth: 10, 
                fontSize: 14 
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
                display: false 
              }
            },
            scales: {
              xAxes: [{
                stacked: true, 
                ticks: {
                  display: false, 
                  beginAtZero: true
                },
                gridLines: {
                  display: false 
                }
              }],
              yAxes: [{
                stacked: true, 
                gridLines: {
                  display: false 
                },
                ticks: {
                  display: false 
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
        
        //Stats row
        document.getElementById("statsRow").classList.remove("d-none");
        document.getElementById("totalTimeThatDay").innerText = secondsToString(totalTime);
        
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
      scales:{yAxes:[{scaleLabel:{display:true,labelString:"Time (sec)", fontSize:10},}]}
    };
    new Chart(weeklyChart,weeklyChartDetails);
  });
});


function exportTableToExcel(tableId, fileName) {
  const table = document.getElementById(tableId);
  if (!table) return;
  
  const wb = XLSX.utils.book_new();
  
  const data = [];
  
  const headerRow = [];
  const headers = table.querySelectorAll('thead th');
  headers.forEach(header => {
    headerRow.push(header.innerText);
  });
  data.push(headerRow);
  
  const rows = table.querySelectorAll('tbody tr');
  rows.forEach(row => {
    const dataRow = [];
    const cells = row.querySelectorAll('td');
    cells.forEach(cell => {
      dataRow.push(cell.innerText);
    });
    data.push(dataRow);
  });
  
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  
  const today = getDateString(new Date());
  const fullFileName = `${fileName}_${today}.xlsx`;
  
  XLSX.writeFile(wb, fullFileName);
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('exportBtn1').addEventListener('click', function() {
    exportTableToExcel('webList', 'BrowseTrack_Today');
  });
  
  document.getElementById('exportBtn2').addEventListener('click', function() {
    const selectedDate = document.getElementById('dateValue').value;
    const fileName = selectedDate ? 
      `BrowseTrack_${selectedDate}` : 
      'BrowseTrack_Selected_Date';
    exportTableToExcel('webList2', fileName);
  });
});


function initBrowseTrackCalendar() {
  const dateInput = document.getElementById('dateValue');
  const dateSubmitBtn = document.getElementById('dateSubmit');
  
  if (!dateInput) return; 
  const calendarEl = document.createElement('div');
  calendarEl.className = 'bt-calendar';
  calendarEl.id = 'btCalendar';
  
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
  
  dateInput.parentNode.insertBefore(calendarEl, dateInput.nextSibling);
  
  const calendarContainer = document.getElementById('btCalendar');
  const monthYearEl = document.getElementById('btCurrentMonthYear');
  const prevMonthBtn = document.getElementById('btPrevMonth');
  const nextMonthBtn = document.getElementById('btNextMonth');
  const clearDateBtn = document.getElementById('btClearDate');
  const todayDateBtn = document.getElementById('btTodayDate');
  const calendarDaysContainer = document.getElementById('btCalendarDays');
  
  let currentDate = new Date();
  let selectedDate = null;
  
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

  
  function renderCalendar() {
    monthYearEl.textContent = `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    
    const dayElements = calendarDaysContainer.querySelectorAll('.bt-calendar-day');
    dayElements.forEach(day => day.remove());
    
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    let firstDayOfWeek = firstDayOfMonth.getDay();
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    for (let i = 0; i < firstDayOfWeek; i++) {
      const emptyDay = document.createElement('div');
      emptyDay.className = 'bt-calendar-day';
      calendarDaysContainer.appendChild(emptyDay);
    }
    
    const today = new Date();
    
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const dayElement = document.createElement('div');
      dayElement.className = 'bt-calendar-day bt-day';
      dayElement.textContent = day;
      
      const dateToCheck = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      
      if (
        today.getDate() === day && 
        today.getMonth() === currentDate.getMonth() && 
        today.getFullYear() === currentDate.getFullYear()
      ) {
        dayElement.classList.add('today');
      }
      
      if (
        selectedDate && 
        selectedDate.getDate() === day && 
        selectedDate.getMonth() === currentDate.getMonth() && 
        selectedDate.getFullYear() === currentDate.getFullYear()
      ) {
        dayElement.classList.add('selected');
      }
      
      dayElement.addEventListener('click', () => {
        selectDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
      });
      
      calendarDaysContainer.appendChild(dayElement);
    }
  }
  
  function selectDate(date) {
    selectedDate = date;    
    const formattedDate = formatDate(date);
    dateInput.value = formattedDate;
    renderCalendar();
    calendarContainer.classList.remove('show');
  }
  
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  function gotoPrevMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  }
  
  function gotoNextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  }
  
  function selectToday() {
    const today = new Date();
    currentDate = new Date(today.getFullYear(), today.getMonth(), 1);
    selectDate(today);
  }
  
  function clearDate() {
    selectedDate = null;
    dateInput.value = '';
    renderCalendar();
    calendarContainer.classList.remove('show');
  }
  
  prevMonthBtn.addEventListener('click', gotoPrevMonth);
  nextMonthBtn.addEventListener('click', gotoNextMonth);
  clearDateBtn.addEventListener('click', clearDate);
  todayDateBtn.addEventListener('click', selectToday);
  
  dateInput.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    calendarContainer.classList.toggle('show');
  });
  
  document.addEventListener('click', function(e) {
    if (!calendarContainer.contains(e.target) && e.target !== dateInput) {
      calendarContainer.classList.remove('show');
    }
  });
  
  dateInput.addEventListener('focus', function(e) {
    this.blur();
  });  
  renderCalendar();
  
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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBrowseTrackCalendar);
} else {
  initBrowseTrackCalendar();
}