console.log("main.js")
let groups = []; // Store created groups

/*
    This is an eventListener method, it handles call's all the view methods to get created and invokes dragging
*/
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
function resetVisualizations(linkedCharts) {
    loadData(function(data) {
        if (linkedCharts.stackedBar) {
            d3.select("#stackedBar").selectAll("*").remove();
            createStackedBarChart(data);
        }

        if (linkedCharts.lineGraph) {
            d3.select("#lineGraph").selectAll("*").remove();
            createLineGraph(data);
        }

        if (linkedCharts.pieChart) {
            d3.select("#pieChart").selectAll("*").remove();
            createPieChart(data);
        }
    });
}

/**
 * Function to filter the views when we select from scatter plot
 */

function filterVisualizationsFromScatter(selectedData, linkedCharts) {
    loadData(function(filteredData) {
        const selectedIds = new Set(selectedData.map(d => d.id));
        const filtered = filteredData.filter(d => selectedIds.has(d.id));

        if (filtered.length === 0) return; // Avoid unnecessary updates if nothing is selected

        if (linkedCharts.stackedBar) {
            d3.select("#stackedBar").selectAll("*").remove();
            createStackedBarChart(filtered);
        }

        if (linkedCharts.lineGraph) {
            d3.select("#lineGraph").selectAll("*").remove();
            createLineGraph(filtered);
        }

        if (linkedCharts.pieChart) {
            d3.select("#pieChart").selectAll("*").remove();
            createPieChart(filtered);
        }
    });
}


let activeLinks = []; // Stores the connections

/*
    This method handles the ploting of links via filters
    It will get the get the filters and call createLinkLine() to show lines based on the filters set
*/
function drawLinks(selectedData, linkedCharts) {
    d3.selectAll(".link-line").remove(); // Remove old links

    selectedData.forEach(d => {
        const scatterPoint = d3.select("#scatter svg")
            .selectAll("circle")
            .filter(dd => dd.id === d.id)
            .node();

            //Checks for link to bar chart then implements lines if yes
        if (linkedCharts.stackedBar) {
            const barElement = d3.select("#stackedBar svg")
                .selectAll("rect")
                .filter(dd => dd?.data?.major === d.major)
                .node();
            if (scatterPoint && barElement) {
                createLinkLine(scatterPoint, barElement, "red");
                activeLinks.push({ from: scatterPoint, to: barElement });
            }
        }
            //Checks for link to pie chart then implements lines if yes
        if (linkedCharts.pieChart) {
            const pieElement = d3.select("#pieChart svg")
                .selectAll("path")
                .filter(dd => dd.data[0] === d.reason_for_mba)
                .node();
            if (scatterPoint && pieElement) {
                createLinkLine(scatterPoint, pieElement, "red");
                activeLinks.push({ from: scatterPoint, to: pieElement });
            }
        }
            //Checks for link to line graph then implements filtering if yes
        if (linkedCharts.lineGraph) {
            const lineElement = d3.select("#lineGraph svg")
                .selectAll("circle")
                .filter(dd => dd.age === d.age)
                .node();
            if (scatterPoint && lineElement) {
                createLinkLine(scatterPoint, lineElement, "red");
                activeLinks.push({ from: scatterPoint, to: lineElement });
            }
        }
    });
}


/*
    This method handles the drawing of links
    It takes in three aruguments and implements lines between the the views as needed. 
*/
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

    const line = svg.append("line")
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
        .on("click", function() {
            d3.select(this)
            .attr("stroke", "grey")
            .attr("stroke-width", 7)
            .classed("inactive-link", true);
        })
        .on("mouseover", function () {
            if (d3.select(this).classed("inactive-link")) {
                const circleData = d3.select(element1).data()[0]; 
                const element2Data = d3.select(element2).data()[0]; 
        
                let tooltipHtml = `Link Information:<br>GPA: ${circleData.gpa}<br>GRE/GMAT: ${circleData.gre_gmat}<br>Major: ${circleData.major}`;
        
                // Check if element2 is a rectangle with major data or a path with pie chart data
                if (element2Data.data && element2Data.data.major) {
                    // This is rect data
                    if (element2Data.data.online === 1) {
                        tooltipHtml += `<br>Online`;
                    }
                    if (element2Data.data.onCampus === 1) {
                        tooltipHtml += `<br>On-Campus`;
                    }
                } else if (element2Data.data && Array.isArray(element2Data.data)) {
                    // This is path data from a pie chart
                    const category = element2Data.data[0];  
                    const count = element2Data.data[1];     
                    tooltipHtml += `<br>${category}`;
                }
        
                const tooltip = d3.select("body").append("div")
                    .attr("class", "tooltip")
                    .style("position", "absolute")
                    .style("background", "white")
                    .style("border", "1px solid black")
                    .style("padding", "10px")
                    .style("font-size", "16px")
                    .html(tooltipHtml)
                    .style("left", `${d3.event.pageX + 10}px`)
                    .style("top", `${d3.event.pageY - 10}px`);
            }
        })
        .on("mouseout", function () {
            d3.select(".tooltip").remove(); // Ensure tooltip is removed when mouse leaves
        });        
    return line;
}




function updateGroupsTable() {
    const table = document.getElementById("groupsTable");
    table.innerHTML = "<tr><th>Group Name</th><th>Members</th></tr>";

    groups.forEach(group => {
        const row = table.insertRow();
        row.insertCell(0).textContent = group.name;
        row.insertCell(1).textContent = group.members.length + " members";
    });
}

// Update table when a new group is created
function createGroup(selectedData) {
    if (selectedData.length === 0) {
        alert("No points selected to create a group.");
        return;
    }

    let groupName = prompt("Enter a name for this group:");

    if (!groupName) return;

    let group = {
        name: groupName,
        members: selectedData.map(d => d.id)
    };

    groups.push(group);
    localStorage.setItem("groups", JSON.stringify(groups));

    alert(`Group "${groupName}" created with ${selectedData.length} members.`);
    updateGroupsTable(); // Refresh table
}

// Load groups on page load
document.addEventListener("DOMContentLoaded", function() {
    let savedGroups = localStorage.getItem("groups");
    if (savedGroups) {
        groups = JSON.parse(savedGroups);
        updateGroupsTable();
    }
});
