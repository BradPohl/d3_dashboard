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

    groups.forEach((group, index) => {
        const row = table.insertRow();
        row.dataset.groupIndex = index;
        row.style.cursor = "pointer";
        
        row.insertCell(0).textContent = group.name;
        const membersCell = row.insertCell(1);
        membersCell.innerHTML = `${group.members.length} members <button class="view-insight-btn">View Insight</button>`;

        // Add click handler for row selection (excluding the view insight button)
        row.addEventListener("click", function(e) {
            // Don't trigger selection if clicking on buttons
            if (e.target.tagName === "BUTTON") return;
            
            // Toggle selection
            const wasSelected = this.classList.contains("selected");
            
            // Remove selection from all rows
            table.querySelectorAll("tr").forEach(r => r.classList.remove("selected"));
            
            if (!wasSelected) {
                this.classList.add("selected");
                showGroupActions(group, index);
            } else {
                hideGroupActions();
            }
        });

        // Add click handler for the View Insight button
        membersCell.querySelector(".view-insight-btn").addEventListener("click", function(e) {
            e.stopPropagation(); // Prevent row selection
            showInsightCard(group);
        });
    });

    if (groups.length > 0) {
        let clearRow = table.insertRow();
        let cell = clearRow.insertCell(0);
        cell.colSpan = 2;
        cell.innerHTML = `<button id="clear-groups-btn">Reset Groups</button>`;
        cell.style.textAlign = "center";

        document.getElementById("clear-groups-btn").addEventListener("click", clearGroups);
    }

    // Add group actions container
    let actionsContainer = document.querySelector(".group-actions");
    if (!actionsContainer) {
        actionsContainer = document.createElement("div");
        actionsContainer.className = "group-actions";
        table.parentNode.appendChild(actionsContainer);
    }
}

function showGroupActions(group, index) {
    const actionsContainer = document.querySelector(".group-actions");
    actionsContainer.innerHTML = `
        <button class="visualize-btn">Visualize Partite</button>
        <button class="delete-btn delete">Delete Group</button>
    `;
    actionsContainer.style.display = "block";

    // Add event listeners for action buttons
    actionsContainer.querySelector(".visualize-btn").addEventListener("click", () => {
        showPartiteWindow(group);
    });

    actionsContainer.querySelector(".delete-btn").addEventListener("click", () => {
        deleteGroup(index);
    });
}

function showPartiteWindow(group) {
    const partiteContainer = document.getElementById("partite-container");
    partiteContainer.style.display = "block";
    
    // Position the window in the center of the screen
    partiteContainer.style.left = `${(window.innerWidth - 500) / 2}px`;
    partiteContainer.style.top = `${(window.innerHeight - 750) / 2}px`;
    
    // Add close button functionality
    const closeBtn = document.getElementById("closePartiteBtn");
    closeBtn.onclick = () => {
        partiteContainer.style.display = "none";
    };
    
    // Make the window draggable
    draggable();

    // Load the data for the selected group members
    loadData(function(data) {
        const groupData = data.filter(d => group.members.includes(d.id));
        if (groupData.length === 0) {
            console.error("No data found for group members:", group.members);
            return;
        }
        createPartiteVisualization(groupData, "partiteVisualization");
    });
}

function hideGroupActions() {
    const actionsContainer = document.querySelector(".group-actions");
    if (actionsContainer) {
        actionsContainer.style.display = "none";
    }
}

function deleteGroup(index) {
    if (!confirm("Are you sure you want to delete this group?")) return;
    
    groups.splice(index, 1);
    localStorage.setItem("groups", JSON.stringify(groups));
    updateGroupsTable();
    hideGroupActions();
}

// Update table when a new group is created
function createGroup(selectedData) {
    if (selectedData.length === 0) {
        alert("No points selected to create a group.");
        return;
    }

    let groupName = prompt("Enter a name for this group:");

    if (!groupName) return;

    // Handle both data objects and IDs
    const memberIds = selectedData.map(d => typeof d === 'object' ? d.id : d);

    let group = {
        name: groupName,
        members: memberIds
    };

    groups.push(group);
    localStorage.setItem("groups", JSON.stringify(groups));

    alert(`Group "${groupName}" created with ${memberIds.length} members.`);
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


function clearGroups() {
    if (!confirm("Are you sure you want to clear all saved groups?")) return;

    groups = []; // ✅ Reset the groups array
    localStorage.removeItem("groups"); // ✅ Remove saved groups from local storage

    updateGroupsTable(); // ✅ Refresh the table
}

function showInsightCard(group) {
    const container = document.getElementById("insightCard-container");
    container.style.display = "block";
    
    // Position the window in the center of the screen
    container.style.left = `${(window.innerWidth - 400) / 2}px`;
    container.style.top = `${(window.innerHeight - 300) / 2}px`;
    
    // Add close button functionality
    const closeBtn = document.getElementById("closeInsightBtn");
    closeBtn.onclick = () => {
        container.style.display = "none";
    };
    
    // Make the window draggable
    draggable();

    loadData(function(fullData) {
        const groupData = fullData.filter(d => group.members.includes(d.id));

        const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

        const gpaAvg = avg(groupData.map(d => +d.gpa)).toFixed(2);
        const greAvg = avg(groupData.map(d => +d.gre_gmat)).toFixed(0);

        const topMajors = d3.rollups(groupData, v => v.length, d => d.major)
            .sort((a, b) => d3.descending(a[1], b[1]))
            .slice(0, 3)
            .map(([major, count]) => `${major} (${count})`);

        const commonLocation = d3.rollups(groupData, v => v.length, d => d.location)
            .sort((a, b) => d3.descending(a[1], b[1]))[0][0];

        const commonReason = d3.rollups(groupData, v => v.length, d => d.reason_for_mba)
            .sort((a, b) => d3.descending(a[1], b[1]))[0][0];

        const total = groupData.length;
        const onlineCount = groupData.filter(d => d.location === "Online").length;
        const onCampusCount = groupData.filter(d => d.location === "On-Campus").length;

        const onlinePercent = ((onlineCount / total) * 100).toFixed(1);
        const onCampusPercent = ((onCampusCount / total) * 100).toFixed(1);

        const html = `
            <h3>${group.name}</h3>
            <p><strong>Average GPA:</strong> ${gpaAvg}</p>
            <p><strong>Average GRE/GMAT:</strong> ${greAvg}</p>
            <p><strong>Top Majors:</strong><br> ${topMajors.join("<br>")}</p>
            <p><strong>Most Common Location:</strong> ${commonLocation}</p>
            <p><strong>Most Common Reason:</strong> ${commonReason}</p>
            <p><strong>Online:</strong> ${onlinePercent}% | <strong>On-Campus:</strong> ${onCampusPercent}%</p>
        `;

        document.getElementById("insightCard").innerHTML = html;

        // Now add recommendations based on fullData
        const fullGPAAvg = avg(fullData.map(d => +d.gpa));
        const fullGREAvg = avg(fullData.map(d => +d.gre_gmat));

        const gpaDiff = (gpaAvg - fullGPAAvg).toFixed(2);
        const greDiff = (greAvg - fullGREAvg).toFixed(0);

        let recs = [];

        if (gpaDiff > 0.3) recs.push("This group has a notably higher GPA than average.");
        if (gpaDiff < -0.3) recs.push("This group has a lower-than-average GPA. Explore how their decisions differ.");

        if (greDiff > 15) recs.push("GRE scores are above average. Consider filtering by Reason for MBA.");
        if (greDiff < -15) recs.push("Low GRE scores. Explore whether online vs on-campus preferences differ.");

        if (new Set(groupData.map(d => d.major)).size > 3)
            recs.push("This group includes a wide variety of majors. You could subgroup them by major.");

        if (new Set(groupData.map(d => d.age)).size > 5)
            recs.push("Age variation is high. Consider exploring trends by age bracket.");

        const topReason = commonReason;
        const similarProfiles = fullData.filter(d =>
            !group.members.includes(d.id) &&
            d.reason_for_mba === topReason
        ).slice(0, 3).map(d => `ID: ${d.id}, Major: ${d.major}, GPA: ${d.gpa}`);

        const recHtml = `
            <h4>Recommendations</h4>
            <ul>${recs.map(r => `<li>${r}</li>`).join("")}</ul>
            <h5>Similar Profiles</h5>
            <ul>${similarProfiles.map(p => `<li>${p}</li>`).join("")}</ul>
        `;

        document.getElementById("insightCard").innerHTML += recHtml;
    });
}
