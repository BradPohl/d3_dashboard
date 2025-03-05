

function createScatterPlot(data) {
    const width = 500, height = 400, margin = {top:20, right:30, bottom:50, left:50};

    const svg = d3.select("#scatter")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.gpa) - 0.2, d3.max(data, d => d.gpa) + 0.2])
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.gre_gmat) - 5, d3.max(data, d => d.gre_gmat) + 5])
        .range([height, 0]);

    // X Axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .append("text")
        .attr("x", width / 2)
        .attr("y", 40)
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .text("Undergraduate GPA");

    // Y Axis
    svg.append("g")
        .call(d3.axisLeft(yScale))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -40)
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .text("GRE/GMAT Score");

    // Plot circles
    const circles = svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.gpa))
        .attr("cy", d => yScale(d.gre_gmat))
        .attr("r", 4)
        .attr("fill", "blue")
        .attr("opacity", 0.8)
        .on("contextmenu", function(event, d) {
            event.preventDefault(); // Prevent default right-click menu
            if (selectedData.length > 0) {
                showContextMenu(event.pageX, event.pageY);
            }
        });

    // Define brushing behavior
    const brush = d3.brush()
        .extent([[0, 0], [width, height]])
        .on("start brush", brushed)
        .on("end", brushEnded);

    svg.append("g")
        .attr("class", "brush")
        .call(brush);

    let selectedData = [];

    function brushed({ selection }) {
        if (!selection) return;

        const [[x0, y0], [x1, y1]] = selection;

        selectedData = data.filter(d =>
            xScale(d.gpa) >= x0 &&
            xScale(d.gpa) <= x1 &&
            yScale(d.gre_gmat) >= y0 &&
            yScale(d.gre_gmat) <= y1
        );

        circles.each(function(d) {
            const isSelected = selectedData.includes(d);

            d3.select(this)
                .attr("fill", isSelected ? "red" : "blue")
                .attr("opacity", isSelected ? 1 : 0.3);
        });
    }

    function brushEnded({ selection }) {
        if (!selection) {
            circles.attr("fill", "blue").attr("opacity", 0.8);
            selectedData = [];
        }
    }

    // Handle right-click event for linking
    svg.on("contextmenu", function(event) {
        event.preventDefault(); // Prevent default right-click behavior

        if (selectedData.length > 0) {
            showContextMenu(event.pageX, event.pageY);
        }
    });
 
        
    // This method handles showing a context menu with the options to add/remove linking
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
        // Invokes the buttons to show
        let menuHtml = `
            <button id="add-link">Apply Linking</button>
            <button id="remove-link">Remove Linking</button>
            <div id="chart-selection">
                <label><input type="checkbox" id="stackedBar-check" checked> Stacked Bar Chart</label><br>
                <label><input type="checkbox" id="lineGraph-check" checked> Line Graph</label><br>
                <label><input type="checkbox" id="pieChart-check" checked> Pie Chart</label>
            </div>
        `;
    
        menu.html(menuHtml)
            .style("left", `${x}px`)
            .style("top", `${y}px`)
            .style("display", "block")
            .style("z-index", "1010");
    
        let linkedCharts = { stackedBar: true, lineGraph: true, pieChart: true };
    
        d3.select("#stackedBar-check").on("change", function() { linkedCharts.stackedBar = this.checked; });
        d3.select("#lineGraph-check").on("change", function() { linkedCharts.lineGraph = this.checked; });
        d3.select("#pieChart-check").on("change", function() { linkedCharts.pieChart = this.checked; });
    
        d3.select("#add-link").on("click", function() { // Adds links  via the selected plot points
            menu.style("display", "none");
            if (selectedData.length > 0) {
                filterVisualizationsFromScatter(selectedData, linkedCharts);
                setTimeout(() => drawLinks(selectedData, linkedCharts), 500);    // Ensures the charts update first
            }
        });
    
        d3.select("#remove-link").on("click", function() {  // if needed remove any current links
            menu.style("display", "none");
            resetVisualizations(linkedCharts); // Only reset selected charts
            d3.selectAll(".link-line").remove(); // Remove only visual links
        });
        
    
        d3.select("body").on("click", function(event) {
            if (!menu.node().contains(event.target)) {
                menu.style("display", "none");
            }
        });
    }
    
}
