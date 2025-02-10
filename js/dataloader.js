function loadData(callback){
    d3.csv("data/mba_decision_dataset.csv").then(data =>{
        //convert numeric values
        let scatterData = data.map(d => ({
            gpa: +d["Undergraduate GPA"],
            gre_gmat: +d["GRE/GMAT Score"]
        }));
        console.log("CSV Data loaded:", scatterData);
        callback(scatterData);
    }).catch(error =>{
        console.error("Could not load CSV:", error);
    });
}