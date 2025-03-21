
//track selections
let selectedSegments = [];

function createStackedBarChart(data) {
    const width = 500, height = 350, margin = {top:60, right:30, bottom:100, left:60};

    console.log("Creating stacked bar chart with data:", data);

    

    //group data by major and get counts
    const majorData = d3.rollups(
        data.filter(d => d.decision.toLowerCase().trim() === "yes"), //filter so only yes decisions
        v => ({
            online: v.filter(d=>d.location.toLowerCase() === "online").length,
            onCampus: v.filter(d=>d.location.toLowerCase() === "on-campus").length,
            people: v //all person records
        }),
        d => d.major
    );

    //convert to array
    let countData = majorData.map(([major, counts])=> ({
        major,
        online: counts.online || 0, //if no online, set to 0
        onCampus: counts.onCampus || 0, //if no onCampus, set to 0
        people: counts.people || [] //if no people, make it empty
    }));

    console.log("Count Data:", countData);

    const svg = d3.select("#stackedBar")
        .append("svg")
        .attr("width", width+margin.left+margin.right)
        .attr("height", height+margin.top+margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);


    const xScale = d3.scaleBand()
        .domain(countData.map(d=>d.major))
        .range([0, width])
        .padding(0.2);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(countData, d=>d.online + d.onCampus)]) //max height
        .range([height, 0]);

    const color = d3.scaleOrdinal()
        .domain(["online", "onCampus"])
        .range(["#98abc5", "#8a89a6"]);


    const stack = d3.stack()
        .keys(["online", "onCampus"])(countData);

    //create bars
    svg.selectAll("g")
        .data(stack)
        .enter()
        .append("g")
        .attr("fill", d=>color(d.key))
        .selectAll("rect")
        .data(d=>d)
        .enter()
        .append("rect")
        .attr("x", d=>xScale(d.data.major))
        .attr("y", d=>yScale(d[1])) //top of bar
        .attr("height", d=>yScale(d[0]) - yScale(d[1])) //height of bar
        .attr("width", xScale.bandwidth())
        .attr("class", "bar-segment")
        .style("cursor", "pointer")
        .on("click", function(event, d) {
            const isSelected = selectedSegments.includes(d);
            if (isSelected) {
                selectedSegments = selectedSegments.filter(seg => seg !== d);
                d3.select(this).attr("stroke", null);
            } else {
                selectedSegments.push(d);
                d3.select(this).attr("stroke", "black").attr("stroke-width", 2);
            }
        })
        .on("contextmenu", function(event, d) {
            event.preventDefault();
            if (selectedSegments.length > 0) {
                showContextMenu(event.pageX, event.pageY);
            }
        });

    //x axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .attr("text-anchor", "end")
        .attr("fill", "black");

    //y axis
    svg.append("g")
        .call(d3.axisLeft(yScale));
    
    //legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width-100}, -50)`);

    legend.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 20)
        .attr("height",20)
        .attr("fill", color("onCampus"));

    legend.append("text")
        .attr("x", 30)
        .attr("y", 15)
        .text("On-Campus")
        .attr("font-size", "12px")
        .attr("fill", "black");

    legend.append("rect")
        .attr("x", 0)
        .attr("y", 22)
        .attr("width", 20)
        .attr("height",20)
        .attr("fill", color("online"));

    legend.append("text")
        .attr("x", 30)
        .attr("y", 37)
        .text("Online")
        .attr("font-size", "12px")
        .attr("fill", "black");
}


function showContextMenu(x, y) {
    let menu = d3.select("#context-menu");

    if (menu.empty()) {
        menu = d3.select("body").append("div")
            .attr("id", "context-menu")
            .style("position", "absolute")
            .style("background", "white")
            .style("border", "1px solid black")
            .style("padding", "5px")
            .style("display", "none")
            .style("z-index", "1000");
    }

    menu.html(`
        <button id="create-group">Create Group</button>
    `)
    .style("left", `${x}px`)
    .style("top", `${y}px`)
    .style("display", "block");

    // ✅ Correctly extract the IDs from selected bars
    d3.select("#create-group").on("click", function() {
        menu.style("display", "none");

        if (selectedSegments.length === 0) {
            alert("No bars selected to create a group.");
            return;
        }

        // ✅ Extract IDs from selected segments
        const selectedPeople = selectedSegments.flatMap(d => d.data.people.map(p => p.id));

        // ✅ Reuse the `createGroup` function from main.js
        createGroup(selectedPeople);
    });

    // Close menu when clicking outside
    d3.select("body").on("click", function(event) {
        if (!menu.node().contains(event.target)) {
            menu.style("display", "none");
        }
    });
}
