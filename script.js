document.addEventListener("DOMContentLoaded", function() {
    const width = 400, height = 300;

    // Bar Chart (Chart 1)
    const svg1 = d3.select("#chart1")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const data1 = [30, 80, 45, 60, 20, 90, 55];

    svg1.selectAll("rect")
        .data(data1)
        .enter()
        .append("rect")
        .attr("x", (d, i) => i * 50)
        .attr("y", d => height - d * 3)
        .attr("width", 40)
        .attr("height", d => d * 3)
        .attr("fill", "steelblue");

    // Pie Chart (Chart 2)
    const svg2 = d3.select("#chart2")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const data2 = [10, 20, 30, 40];
    const pie = d3.pie();
    const arc = d3.arc().innerRadius(0).outerRadius(100);
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    svg2.selectAll("path")
        .data(pie(data2))
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", (d, i) => color(i));

    // Line Chart (Chart 3)
    const svg3 = d3.select("#chart3")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const data3 = [10, 30, 50, 40, 60, 80, 90];
    const line = d3.line()
        .x((d, i) => i * 50)
        .y(d => height - d * 3);

    svg3.append("path")
        .datum(data3)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("d", line);

    // Scatter Plot (Chart 4)
    const svg4 = d3.select("#chart4")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const data4 = [[30, 20], [50, 60], [70, 80], [90, 100]];

    svg4.selectAll("circle")
        .data(data4)
        .enter()
        .append("circle")
        .attr("cx", d => d[0] * 3)
        .attr("cy", d => height - d[1] * 3)
        .attr("r", 5)
        .attr("fill", "green");
});
