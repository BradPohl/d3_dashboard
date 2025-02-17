console.log("main.js")

//Wait for all DOM elements to load then load the data and create the visualizations
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
        let container = bar.parentNode; // Get the chart container
        let offsetX, offsetY, isDragging = false;

        // Mouse down: start dragging
        bar.addEventListener("mousedown", (event) => {
            isDragging = true;
            offsetX = event.clientX - container.offsetLeft;
            offsetY = event.clientY - container.offsetTop;
            container.style.position = "absolute"; // Ensure absolute positioning
            container.style.zIndex = 1000; // Bring to front

            event.preventDefault(); // Prevent text selection
        });

        // Mouse move: update position
        document.addEventListener("mousemove", (event) => {
            if (!isDragging) return;

            // Use requestAnimationFrame for smoother updates
            requestAnimationFrame(() => {
                container.style.left = `${event.clientX - offsetX}px`;
                container.style.top = `${event.clientY - offsetY}px`;
            });
        });

        // Mouse up: stop dragging
        document.addEventListener("mouseup", () => {
            isDragging = false;
            container.style.zIndex = ""; // Reset stacking order
        });
    });
}
