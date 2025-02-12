function createPieChart(data) {
    const width = 650, height = 500, margin = 50; 
    const radius = Math.min(width, height) / 2 - margin;

    const svg = d3.select("#pieChart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Setting colors for slices
    const color = d3.scaleOrdinal()
        .domain(["Networking", "Career Growth", "Skill Enhancement", "Entrepreneurship"])
        .range(d3.schemeCategory10);

    // Compute slice positions
    const pie = d3.pie()
        .value(d => d[1])
        .sort(null);

    // Map the data to count occurrences
    const counts = d3.rollups(data, v => v.length, d => d.reason_for_mba);
    const data_ready = pie(Object.entries(Object.fromEntries(counts)));

    // Build the pie chart
    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    // Helps position labels
    const arcLabel = d3.arc()
        .innerRadius(radius * 0.3) 
        .outerRadius(radius);

    svg.selectAll('path')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', d => color(d.data[0]))
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 0.7);

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


