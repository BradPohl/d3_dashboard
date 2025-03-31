function createPartiteVisualization(data, containerId) {
    const width = 450;
    const height = 700;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear any existing visualization
    d3.select(`#${containerId}`).selectAll("*").remove();

    // Create SVG
    const svg = d3.select(`#${containerId}`)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define partitions based on data attributes
    const partitions = [
        { name: "GPA", key: "gpa", color: "#1f77b4" },
        { name: "GRE/GMAT", key: "gre_gmat", color: "#ff7f0e" },
        { name: "Age", key: "age", color: "#2ca02c" },
        { name: "Major", key: "major", color: "#d62728" },
        { name: "Location", key: "location", color: "#9467bd" }
    ];

    // Calculate scales for each partition
    const partitionScales = partitions.map(partition => {
        const values = data.map(d => d[partition.key]);
        if (typeof values[0] === 'number') {
            return d3.scaleLinear()
                .domain(d3.extent(values))
                .range([0, innerHeight]);
        } else {
            // For categorical data, create a scale band
            const uniqueValues = [...new Set(values)];
            return d3.scaleBand()
                .domain(uniqueValues)
                .range([0, innerHeight])
                .padding(0.2);
        }
    });

    // Create partition containers
    const partitionWidth = innerWidth / partitions.length;
    const partitionContainers = svg.selectAll(".partition")
        .data(partitions)
        .enter()
        .append("g")
        .attr("class", "partition")
        .attr("transform", (d, i) => `translate(${i * partitionWidth}, 0)`);

    // Add partition labels
    partitionContainers.append("text")
        .attr("x", partitionWidth / 2)
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .text(d => d.name)
        .style("font-size", "12px")
        .style("fill", "black");

    // Create nodes for each data point
    const nodes = data.map(d => ({
        id: d.id,
        values: partitions.map(p => d[p.key])
    }));

    // Draw nodes in each partition
    partitionContainers.each(function(partition, partitionIndex) {
        const container = d3.select(this);
        const scale = partitionScales[partitionIndex];

        container.selectAll(".node")
            .data(nodes)
            .enter()
            .append("circle")
            .attr("class", "node")
            .attr("cx", partitionWidth / 2)
            .attr("cy", d => scale(d.values[partitionIndex]))
            .attr("r", 4)
            .attr("fill", partition.color)
            .attr("opacity", 0.8)
            .on("mouseover", function() {
                d3.select(this)
                    .attr("r", 6)
                    .attr("opacity", 1);
            })
            .on("mouseout", function() {
                d3.select(this)
                    .attr("r", 4)
                    .attr("opacity", 0.8);
            });
    });

    // Add connecting lines between nodes
    const lines = svg.append("g")
        .attr("class", "lines")
        .selectAll("path")
        .data(nodes)
        .enter()
        .append("path")
        .attr("d", d => {
            const points = d.values.map((v, i) => {
                const x = i * partitionWidth + partitionWidth / 2;
                const y = partitionScales[i](v);
                return [x, y];
            });
            return d3.line()(points);
        })
        .attr("fill", "none")
        .attr("stroke", "#999")
        .attr("stroke-width", 1)
        .attr("opacity", 0.3);
} 