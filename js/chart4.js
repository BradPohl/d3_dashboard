// function createPieChart(data) {
//     const width = 650, height = 500, margin = 50; 
//     const radius = Math.min(width, height) / 2 - margin;

//     const svg = d3.select("#pieChart")
//         .append("svg")
//         .attr("width", width)
//         .attr("height", height)
//         .append("g")
//         .attr("transform", `translate(${width / 2}, ${height / 2})`);

//     // Setting colors for slices
//     const color = d3.scaleOrdinal()
//         .domain(["Networking", "Career Growth", "Skill Enhancement", "Entrepreneurship"])
//         .range(d3.schemeCategory10);

//     // Compute slice positions
//     const pie = d3.pie()
//         .value(d => d[1])
//         .sort(null);

//     // Map the data to count occurrences
//     const counts = d3.rollups(data, v => v.length, d => d.reason_for_mba);
//     const data_ready = pie(Object.entries(Object.fromEntries(counts)));

//     // Build the pie chart
//     const arc = d3.arc()
//         .innerRadius(0)
//         .outerRadius(radius);

//     // Helps position labels
//     const arcLabel = d3.arc()
//         .innerRadius(radius * 0.25) 
//         .outerRadius(radius);

//     const slices = svg.selectAll('path')
//         .data(data_ready)
//         .enter()
//         .append('path')
//         .attr('d', arc)
//         .attr('fill', d => color(d.data[0]))
//         .attr("stroke", "white")
//         .style("stroke-width", "2px")
//         .style("opacity", 0.7)
//         .on("click", function(event, d) {
//             // Get current opacity
//             const currentOpacity = d3.select(this).style("opacity");
    
//             // Reset all slices to default opacity
//             svg.selectAll('path').style("opacity", 0.7);
    
//             // If the clicked slice was not already highlighted, highlight it
//             if (currentOpacity !== "1") {
//                 d3.select(this).style("opacity", 1);
//             }
//         })
//         .on("contextmenu", function(event, d) {
//             event.preventDefault(); // Prevent default right-click menu
//             if (selectedCategory) {
//                 showContextMenu(event.pageX, event.pageY);
//             }
//         });
    
//     d3.select("body").on("click", function() { menu.style("display", "none"); });
    

//     // labels
//     svg.selectAll('text')
//         .data(data_ready)
//         .enter()
//         .append('text')
//         .text(d => `${d.data[0]} (${((d.data[1] / data.length) * 100).toFixed(1)}%)`)
//         .attr("transform", d => `translate(${arcLabel.centroid(d)})`)
//         .style("text-anchor", "middle")
//         .style("font-size", 14);
// }


// // Create a simple custom context menu
// function showContextMenu(x, y) {
//     let menu = d3.select("#context-menu");
//     if (menu.empty()) {
//         menu = d3.select("body").append("div")
//             .attr("id", "context-menu")
//             .style("position", "absolute")
//             .style("background", "white")
//             .style("border", "1px solid black")
//             .style("padding", "5px")
//             .style("display", "none");
//     }

//     menu.html('<button id="add-link">Add Linking</button>')
//         .style("left", `${x}px`)
//         .style("top", `${y}px`)
//         .style("display", "block");

//     d3.select("#add-link").on("click", function() {
//         menu.style("display", "none");
//         filterVisualizations(selectedCategory);
//     });

//     // d3.select("body").on("click", function() { menu.style("display", "none"); });
// }

function createPieChart(data) {
    const width = 650, height = 500, margin = 50; 
    const radius = Math.min(width, height) / 2 - margin;

    const svg = d3.select("#pieChart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const color = d3.scaleOrdinal()
        .domain(["Networking", "Career Growth", "Skill Enhancement", "Entrepreneurship"])
        .range(d3.schemeCategory10);

    const pie = d3.pie()
        .value(d => d[1])
        .sort(null);

    const counts = d3.rollups(data, v => v.length, d => d.reason_for_mba);
    const data_ready = pie(Object.entries(Object.fromEntries(counts)));

    const arc = d3.arc().innerRadius(0).outerRadius(radius);
    const arcLabel = d3.arc().innerRadius(radius * 0.25).outerRadius(radius);

    let selectedCategory = null; 
    let isLinked = false; 
    let linkedCharts = { scatter: true, stackedBar: true, lineGraph: true }; // Track selected visualizations

    const slices = svg.selectAll('path')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', d => color(d.data[0]))
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 0.7)
        .on("click", function(event, d) {
            const currentOpacity = d3.select(this).style("opacity");

            svg.selectAll('path').style("opacity", 0.7);

            if (currentOpacity !== "1") {
                d3.select(this).style("opacity", 1);
                selectedCategory = d.data[0]; 
            } else {
                selectedCategory = null;
            }
        })
        .on("contextmenu", function(event, d) {
            event.preventDefault(); 
            if (selectedCategory) {
                showContextMenu(event.pageX, event.pageY);
            }
        });

    function showContextMenu(x, y) {
        let menu = d3.select("#context-menu");
        if (menu.empty()) {
            menu = d3.select("body").append("div")
                .attr("id", "context-menu")
                .style("position", "absolute")
                .style("background", "white")
                .style("border", "1px solid black")
                .style("padding", "5px")
                .style("display", "none");
        }

        let menuHtml = `
            <button id="add-link">Apply Linking</button>
            ${isLinked ? '<button id="remove-link">Remove Linking</button>' : ''}
            <div id="chart-selection">
                <label><input type="checkbox" id="scatter-check" ${linkedCharts.scatter ? "checked" : ""}> Scatter Plot</label><br>
                <label><input type="checkbox" id="stackedBar-check" ${linkedCharts.stackedBar ? "checked" : ""}> Stacked Bar Chart</label><br>
                <label><input type="checkbox" id="lineGraph-check" ${linkedCharts.lineGraph ? "checked" : ""}> Line Graph</label>
            </div>
        `;

        menu.html(menuHtml)
            .style("left", `${x}px`)
            .style("top", `${y}px`)
            .style("display", "block");

        d3.select("#chart-selection").on("click", function(event) {
            event.stopPropagation(); // Prevent closing menu when clicking checkboxes
        });

        d3.select("#scatter-check").on("change", function() { linkedCharts.scatter = this.checked; });
        d3.select("#stackedBar-check").on("change", function() { linkedCharts.stackedBar = this.checked; });
        d3.select("#lineGraph-check").on("change", function() { linkedCharts.lineGraph = this.checked; });

        d3.select("#add-link").on("click", function() {
            menu.style("display", "none");
            isLinked = true;
            filterVisualizations(selectedCategory, linkedCharts);
        });

        d3.select("#remove-link")?.on("click", function() {
            menu.style("display", "none");
            isLinked = false;
            resetVisualizations();
        });

        // Close menu when clicking outside (except checkboxes)
        d3.select("body").on("click", function(event) {
            if (!menu.node().contains(event.target)) {
                menu.style("display", "none");
            }
        });
    }

        // labels
    svg.selectAll('text')
        .data(data_ready)
        .enter()
        .append('text')
        .text(d => `${d.data[0]} (${((d.data[1] / data.length) * 100).toFixed(1)}%)`)
        .attr("transform", d => `translate(${arcLabel.centroid(d)})`)
        .style("text-anchor", "middle")
        .style("font-size", 14);
}

function filterVisualizations(category, linkedCharts) {
    d3.select("#pieChart").selectAll('path').style("opacity", 0.7);

    loadData(function(filteredData) {
        const filtered = filteredData.filter(d => d.reason_for_mba === category);
        
        if (linkedCharts.scatter) {
            d3.select("#scatter").selectAll("*").remove();
            createScatterPlot(filtered);
        }
        
        if (linkedCharts.stackedBar) {
            d3.select("#stackedBar").selectAll("*").remove();
            createStackedBarChart(filtered);
        }

        if (linkedCharts.lineGraph) {
            d3.select("#lineGraph").selectAll("*").remove();
            createLineGraph(filtered);
        }
    });
}
