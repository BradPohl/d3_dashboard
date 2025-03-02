

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
// function draggable() {
//     document.querySelectorAll(".drag-bar").forEach(bar => {
//         let container = bar.parentNode; 
//         let offsetX, offsetY, isDragging = false;

//         bar.addEventListener("mousedown", (event) => {
//             isDragging = true;
//             offsetX = event.clientX - container.offsetLeft;
//             offsetY = event.clientY - container.offsetTop;
//             container.style.position = "absolute"; 
//             container.style.zIndex = 1000; 

//             event.preventDefault(); 
//         });

//         document.addEventListener("mousemove", (event) => {
//             if (!isDragging) return;

//             requestAnimationFrame(() => {
//                 container.style.left = `${event.clientX - offsetX}px`;
//                 container.style.top = `${event.clientY - offsetY}px`;
//             });
//         });

//         document.addEventListener("mouseup", () => {
//             isDragging = false;
//             container.style.zIndex = "";
//         });
//     });
// }


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
            if (isDragging) {
                isDragging = false;
                container.style.zIndex = "";

                // **Regenerate Links on Move**
                setTimeout(() => {
                    d3.selectAll(".link-line").remove(); // Clear old lines
                    activeLinks.forEach(link => createLinkLine(link.from, link.to, "red"));
                }, 100);
            }
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




// // Finally working version of drawLinks function
// function drawLinks(selectedData) {
//     d3.selectAll(".link-line").remove(); // Remove previous lines

//     selectedData.forEach(d => {
//         const scatterPoint = d3.select("#scatter svg")
//             .selectAll("circle")
//             .filter(dd => dd.id === d.id)
//             .node();

//         const barElement = d3.select("#stackedBar svg")
//             .selectAll("rect")
//             .filter(dd => dd?.data?.major === d.major)
//             .node();

//         const pieElement = d3.select("#pieChart svg")
//             .selectAll("path")
//             .filter(dd => dd.data[0] === d.reason_for_mba)
//             .node();

//         const lineElement = d3.select("#lineGraph svg")
//             .selectAll("circle")  // If circles exist in line graph
//             .filter(dd => dd.age === d.age)
//             .node();

//         // Debugging
//         console.log(`Checking connections for ID: ${d.id}`);
//         console.log("ScatterPoint:", scatterPoint);
//         console.log("BarElement:", barElement);
//         console.log("PieElement:", pieElement);
//         console.log("LineElement:", lineElement);

//         if (scatterPoint && barElement) {
//             console.log("Drawing line to bar chart...");
//             createLinkLine(scatterPoint, barElement, "red");
//         }

//         if (scatterPoint && pieElement) {
//             console.log("Drawing line to pie chart...");
//             createLinkLine(scatterPoint, pieElement, "red");
//         }

//         if (scatterPoint && lineElement) {
//             console.log("Drawing line to line graph...");
//             createLinkLine(scatterPoint, lineElement, "red");
//         }
//     });
// }

let activeLinks = []; // Stores the connections

function drawLinks(selectedData) {
    d3.selectAll(".link-line").remove(); // Remove old links

    selectedData.forEach(d => {
        const scatterPoint = d3.select("#scatter svg")
            .selectAll("circle")
            .filter(dd => dd.id === d.id)
            .node();

        const barElement = d3.select("#stackedBar svg")
            .selectAll("rect")
            .filter(dd => dd?.data?.major === d.major)
            .node();

        const pieElement = d3.select("#pieChart svg")
            .selectAll("path")
            .filter(dd => dd.data[0] === d.reason_for_mba)
            .node();

        const lineElement = d3.select("#lineGraph svg")
            .selectAll("circle")  // If circles exist in line graph
            .filter(dd => dd.age === d.age)
            .node();

        if (scatterPoint && barElement) {
            createLinkLine(scatterPoint, barElement, "red");
            activeLinks.push({ from: scatterPoint, to: barElement });
        }
        if (scatterPoint && pieElement) {
            createLinkLine(scatterPoint, pieElement, "red");
            activeLinks.push({ from: scatterPoint, to: pieElement });
        }
        if (scatterPoint && lineElement) {
            createLinkLine(scatterPoint, lineElement, "red");
            activeLinks.push({ from: scatterPoint, to: lineElement });
        }
    });
}





function createLinkLine(element1, element2, color) {
    const body = d3.select("body");

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
        .attr("stroke-dasharray", "5,5")
        .attr("stroke-linecap", "round")
        .attr("stroke", color)
        .attr("stroke-width", 2)
        .attr("opacity", 0.8)
        .style("pointer-events", "stroke")
        .on("mouseover", function () {
            d3.select(this)
                .attr("stroke-width", 6) // Thicker line on hover
                .attr("opacity", 1)
                .raise(); // Bring to front

            // Find connected points and highlight them
            d3.selectAll("circle")
                .filter(d => d3.select(element1).data()[0] === d || d3.select(element2).data()[0] === d)
                .raise()
                .attr("stroke", "black")
                .attr("stroke-width", 3)
                .attr("r", 8); // Make larger

                
        })
        .on("mouseout", function () {
            d3.select(this)
                .attr("stroke-width", 3) // Reset width
                .attr("opacity", 0.8);

            // Reset connected points
            d3.selectAll("circle")
                .filter(d => d3.select(element1).data()[0] === d || d3.select(element2).data()[0] === d)
                .attr("stroke", "none")
                .attr("r", 5); // Reset size
        });

        
}






