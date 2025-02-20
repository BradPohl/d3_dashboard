/*
    This method enables saving the name charts. 
    It will check for any existing charts in the cookies and then add on to with the newly saved chart
*/
function saveChart(chartName) {
    const existingCharts = Cookies.get('chartNames') ? JSON.parse(Cookies.get('chartNames')) : [];
    existingCharts.push(chartName); // gathers any previous saved charts
    Cookies.set('chartNames', JSON.stringify(existingCharts), {expires: 1/288}); // sets cookie with the new saved chart name and it expires after 5 mins
    
    hideChartContainer(chartName); //hide chart once saved
    
    updateSavedChartsTable(existingCharts); 

    alert('Cookie has been set!'); // throws an alert onto webpage when the cookie has been set successfully
}

/*
    This method handles updating the Pinned Charts table 
    It will gets the current saved charts and inserts them into each row of the table dynamically
*/
function updateSavedChartsTable() {
    const chartNames = Cookies.get('chartNames') ? JSON.parse(Cookies.get('chartNames')) : []; // makes sure to get any previous saved cookies
    const table = document.getElementById('summaryTable');
    table.innerHTML = '';

    chartNames.forEach((name) => { // loop through the array of chartNames and display each name onto a table cell
        const row = table.insertRow(-1);
        const cell = row.insertCell(0);
        cell.textContent = name;
        cell.style.cursor = 'pointer';
        cell.addEventListener('click', function() {  // adding a listener to allow for un-hiding 
            toggleChartSavedState(name);
        });
    });
}

/*
    This method handles hiding a chart once its been saved
    It will reterive the containerId and then set the opacity to none
*/
function hideChartContainer(chartName) { 
    let containerId = getChartContainerId(chartName);
    const chartContainer = document.getElementById(containerId);
    chartContainer.style.display = 'none';
}

/*
    This method handles un-hiding a chart once its been hidden
    It will get the containerId and un-hide based on opcacity option
*/
function toggleChartSavedState(chartName) {
    let containerId = getChartContainerId(chartName);
    const chartContainer = document.getElementById(containerId);
    if (chartContainer.style.display === 'none') {
        chartContainer.style.display = ''; // Un-hide the container
        chartContainer.style.opacity = 1; // Reset opacity
    } else {
        chartContainer.style.display = 'none'; // Hide the container
    }
}

/*
    This method handles reteriving the correct container for the corresponding chart name
*/
function getChartContainerId(chartName) {
    switch(chartName) {
        case "Undergrad GPA Vs. GRE/GMAT Score":
            return "scatter-container";
        case "Which Field takes more online or on-campus programs?":
            return "stackedBar-container";
        case "Does Age impact the decision to get an MBA?":
            return "lineGraph-container";
        case "Reasons for getting an MBA":
            return "pieChart-container";
        default:
            return "";
    }
}

/*
    This is an eventListener method, it handles calling saveChart() & updateSavedChartsTable() methods after the save button is clicked.
*/
document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll('.button').forEach(button => {
        button.addEventListener('click', function() {
            const chartName = this.parentNode.textContent.trim();
            saveChart(chartName); // once button is clicked call saveChart to save the cookie
        });
    });
    updateSavedChartsTable(); // After cookie is saved to update Pinned Charts table
});