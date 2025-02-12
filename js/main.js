console.log("main.js")

//Wait for all DOM elements to load then load the data and create the visualizations
document.addEventListener("DOMContentLoaded", function(){
    loadData(function(data){
        createScatterPlot(data);
        createStackedBarChart(data);
        createLineGraph(data);
        createPieChart(data);

        // allow dragging
        makeDraggable();
    });
});

/**
 * Make the views draggable. Must select the drag bar to drag the view.
 */
function makeDraggable(){

    d3.selectAll(".drag-bar")
        .each(function() {
            const parent = d3.select(this.parentNode);

            let offsetX, offsetY;

            d3.select(this)
                .call(d3.drag()
                    .on("start", function(event){
                        // Get current position of the draggable container
                        const rect = parent.node().getBoundingClientRect();

                        // Store the mouse offset within the container
                        offsetX = event.x - rect.left;
                        offsetY = event.y - rect.top;

                        parent.raise().classed("active", true);
                    })
                    .on("drag", function(event){
                        parent.style("left", `${event.x - offsetX}px`)
                            .style("top", `${event.y - offsetY}px`);
                    })
                    .on("end", function(event){
                        parent.classed("active", false);
                    })
                );
        })
    
}