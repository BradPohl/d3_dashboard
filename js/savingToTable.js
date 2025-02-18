/*
    This method enables saving the name charts. 
    It will check for any existing charts in the cookies and then add on to with the newly saved chart
*/
function saveChart(chartName) {
    const existingCharts = Cookies.get('chartNames') ? JSON.parse(Cookies.get('chartNames')) : [];
    existingCharts.push(chartName); // gathers any previous saved charts
    Cookies.set('chartNames', JSON.stringify(existingCharts), {expires: 1}); // sets cookie with the new saved chart name and it expires after 1 day
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
    });
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