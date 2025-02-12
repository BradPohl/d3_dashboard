function createLineGraph(data) {
    const width = 450, height = 400, margin = {top:20, right:60, bottom:100, left:60};
    
    const svg = d3.select("#lineGraph")
    	.append("svg")
    	.attr("width", width + margin.left + margin.right)
    	.attr("height", height + margin.top + margin.bottom)
    	.append("g")
    	.attr("transform", `translate(${margin.left}, ${margin.top})`);

	// 'decided_to_pursue_mba' is a binary (Yes/No or 1/0)
	const ageExtent = d3.extent(data, d => d.age);
	const xScale = d3.scaleLinear()
    	.domain([ageExtent[0], ageExtent[1]])
    	.range([0, width]);

	// Calculate the decision rate by age
	const decisionData = d3.rollups(data, v => d3.sum(v, d => d.decided_to_pursue === 'Yes' ? 1 : 0) / v.length, d => d.age)
        .sort((a, b) => d3.ascending(a[0], b[0])); // Ensure the data is sorted by age

	const yScale = d3.scaleLinear()
    	.domain([0, 1])
    	.range([height, 0]);

	// x axis
	svg.append("g")
   		.attr("transform", `translate(0,${height})`)
    	.call(d3.axisBottom(xScale).ticks(ageExtent[1] - ageExtent[0]))
   		.append("text")
   		.attr("x", width / 2)
    	.attr("y", 40)
    	.attr("fill", "black")
    	.attr("text-anchor", "middle")
    	.text("Age");

	// y axis
	svg.append("g")
    	.call(d3.axisLeft(yScale).tickFormat(d3.format(".0%"))) // Format as percentage
    	.append("text")
    	.attr("transform", "rotate(-90)")
		.attr("x", -height / 2)
		.attr("y", -40)
		.attr("fill", "black")
		.attr("text-anchor", "middle")
		.text("Decision to Pursue MBA Rate");

	// Adding line
	svg.append("path")
		.datum(decisionData)
		.attr("fill", "none")
		.attr("stroke", "steelblue")
		.attr("stroke-width", 1.5)
		.attr("d", d3.line()
			.x(d => xScale(d[0]))
			.y(d => yScale(d[1]))
		);
}