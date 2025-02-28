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


function filterVisualizationsFromScatter(selectedData) {
    d3.select("#pieChart").selectAll('path').style("opacity", 0.7);

    loadData(function(filteredData) {
        // Create a Set of selected IDs for fast lookup
        const selectedIds = new Set(selectedData.map(d => d.id));
        
        // Filter the data based on the selected points
        const filtered = filteredData.filter(d => selectedIds.has(d.id));

        if (filtered.length === 0) return; // Avoid unnecessary updates if nothing is selected

        // Clear and update each visualization
        d3.select("#stackedBar").selectAll("*").remove();
        createStackedBarChart(filtered);

        d3.select("#lineGraph").selectAll("*").remove();
        createLineGraph(filtered);

        d3.select("#pieChart").selectAll("*").remove();
        createPieChart(filtered);
    });
}



function drawLinks(selectedData) {
    d3.selectAll(".link-line").remove(); // Remove previous lines

    selectedData.forEach(d => {
        // Find corresponding elements in other visualizations
        const scatterPoint = d3.select("#scatter svg")
            .selectAll("circle")
            .filter(dd => dd.id === d.id)
            .node();

        const barElement = d3.select("#stackedBar svg")
            .selectAll("rect")
            .filter(dd => dd.major === d.major)
            .node();

        const pieElement = d3.select("#pieChart svg")
            .selectAll("path")
            .filter(dd => dd.data[0] === d.reason_for_mba)
            .node();

        const lineElement = d3.select("#lineGraph svg")
            .selectAll("circle")  // Assuming the line graph has circles representing points
            .filter(dd => dd.age === d.age)
            .node();

        if (scatterPoint && barElement) {
            createLinkLine(scatterPoint, barElement);
        }

        if (scatterPoint && pieElement) {
            createLinkLine(scatterPoint, pieElement);
        }

        if (scatterPoint && lineElement) {
            createLinkLine(scatterPoint, lineElement);
        }
    });
}



function createLinkLine(element1, element2) {
    const body = d3.select("body");

    // Ensure only one SVG is used for all lines
    let svg = d3.select("#link-layer");

    if (svg.empty()) {
        svg = body.append("svg")
            .attr("id", "link-layer")
            .style("position", "absolute")
            .style("top", "0px")
            .style("left", "0px")
            .attr("width", window.innerWidth)
            .attr("height", window.innerHeight)
            .style("pointer-events", "none");
    }

    const pos1 = element1.getBoundingClientRect();
    const pos2 = element2.getBoundingClientRect();

    const lineX1 = pos1.left + pos1.width / 2 + window.scrollX;
    const lineY1 = pos1.top + pos1.height / 2 + window.scrollY;
    const lineX2 = pos2.left + pos2.width / 2 + window.scrollX;
    const lineY2 = pos2.top + pos2.height / 2 + window.scrollY;

    svg.append("line")
        .attr("class", "link-line")
        .attr("x1", lineX1)
        .attr("y1", lineY1)
        .attr("x2", lineX2)
        .attr("y2", lineY2)
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("opacity", 0.8);
}


