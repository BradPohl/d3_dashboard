function loadData(callback){
    d3.csv("data/mba_decision_dataset.csv").then(data =>{
        //convert numeric values
        let filteredData = data.map(d => ({
            gpa: +d["Undergraduate GPA"],
            gre_gmat: +d["GRE/GMAT Score"],
            major: d["Undergraduate Major"],
            decision: d["Decided to Pursue MBA?"],
            location: d["Online vs. On-Campus MBA"],
        }));
        console.log("CSV Data loaded:", filteredData);
        callback(filteredData);
    }).catch(error =>{
        console.error("Could not load CSV:", error);
    });
}