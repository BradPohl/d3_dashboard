// console.log("main.js")

// //Wait for all DOM elements to load then load the data and create the visualizations
// document.addEventListener("DOMContentLoaded", function(){
//     loadData(function(data){
//         createScatterPlot(data);
//         createStackedBarChart(data);
//         createLineGraph(data);
//         createPieChart(data);

//         draggable();
//     });
// });

// /**
//  * Enable dragging for all charts
//  */
// function draggable() {
//     document.querySelectorAll(".drag-bar").forEach(bar => {
//         let container = bar.parentNode; // Get the chart container
//         let offsetX, offsetY, isDragging = false;

//         // Mouse down: start dragging
//         bar.addEventListener("mousedown", (event) => {
//             isDragging = true;
//             offsetX = event.clientX - container.offsetLeft;
//             offsetY = event.clientY - container.offsetTop;
//             container.style.position = "absolute"; // Ensure absolute positioning
//             container.style.zIndex = 1000; // Bring to front

//             event.preventDefault(); // Prevent text selection
//         });

//         // Mouse move: update position
//         document.addEventListener("mousemove", (event) => {
//             if (!isDragging) return;

//             // Use requestAnimationFrame for smoother updates
//             requestAnimationFrame(() => {
//                 container.style.left = `${event.clientX - offsetX}px`;
//                 container.style.top = `${event.clientY - offsetY}px`;
//             });
//         });

//         // Mouse up: stop dragging
//         document.addEventListener("mouseup", () => {
//             isDragging = false;
//             container.style.zIndex = ""; // Reset stacking order
//         });
//     });
// }


// function filterVisualizations(category) {
//     d3.select("#pieChart").selectAll('path').style("opacity", 0.7);

//     loadData(function(filteredData) {
//         const filtered = filteredData.filter(d => d.reason_for_mba === category);
        
//         // Update other visualizations
//         d3.select("#scatter").selectAll("*").remove();
//         createScatterPlot(filtered);

//         d3.select("#stackedBar").selectAll("*").remove();
//         createStackedBarChart(filtered);

//         d3.select("#lineGraph").selectAll("*").remove();
//         createLineGraph(filtered);
//     });
// }



console.log("main.js")

document.addEventListener("DOMContentLoaded", function(){
    loadData(function(data){
        createScatterPlot(data);
        createStackedBarChart(data);
        createLineGraph(data);
        createPieChart(data);

        draggable();
    });
});

/**
 * Enable dragging for all charts
 */
function draggable() {
    document.querySelectorAll(".drag-bar").forEach(bar => {
        let container = bar.parentNode; 
        let offsetX, offsetY, isDragging = false;

        bar.addEventListener("mousedown", (event) => {
            isDragging = true;
            offsetX = event.clientX - container.offsetLeft;
            offsetY = event.clientY - container.offsetTop;
            container.style.position = "absolute"; 
            container.style.zIndex = 1000; 

            event.preventDefault(); 
        });

        document.addEventListener("mousemove", (event) => {
            if (!isDragging) return;

            requestAnimationFrame(() => {
                container.style.left = `${event.clientX - offsetX}px`;
                container.style.top = `${event.clientY - offsetY}px`;
            });
        });

        document.addEventListener("mouseup", () => {
            isDragging = false;
            container.style.zIndex = "";
        });
    });
}

/**
 * Function to reset all charts and remove any filtering
 */
function resetVisualizations() {
    loadData(function(data) {
        d3.select("#scatter").selectAll("*").remove();
        createScatterPlot(data);

        d3.select("#stackedBar").selectAll("*").remove();
        createStackedBarChart(data);

        d3.select("#lineGraph").selectAll("*").remove();
        createLineGraph(data);

        d3.select("#pieChart").selectAll("*").remove();
        createPieChart(data);
    });
}
