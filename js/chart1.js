function createScatterPlot(data) {
    const width = 500, height = 400, margin = {top:20, right:30, bottom:50, left:50};


    const svg = d3.select("#scatter")
        .append("svg")
        .attr("width", width+margin.left+margin.right)
        .attr("height", height+margin.top+margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleLinear()
        .domain([d3.min(data, d=>d.gpa)-.2, d3.max(data, d=> d.gpa)+.2])
        .range([0,width]);

    const yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.gre_gmat)-5, d3.max(data, d=>d.gre_gmat)+5])
        .range([height, 0]);

    //x axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .append("text")
        .attr("x", width/2)
        .attr("y", 40)
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .text("Undergraduate GPA");

    //y axis
    svg.append("g")
        .call(d3.axisLeft(yScale))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height/2)
        .attr("y", -40)
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .text("GRE/GMAT Score");

    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d=>xScale(d.gpa))
        .attr("cy", d=>yScale(d.gre_gmat))
        .attr("r", 4)
        .attr("fill", "blue")
        .attr("opacity", 0.6);
}