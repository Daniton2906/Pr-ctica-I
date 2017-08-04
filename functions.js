// JavaScript source code
function sayHello(tag) {
    var svg = d3.selectAll("svg");
    
    if (svg.datum() == tag) { 
        alert("Hello World");
        svg.transition().duration(2000).style("background-color", "white")
            .transition().duration(2000).attr("transform", "translate(100,0)");
        /*
        var dataset = [5, 10, 13, 19, 21, 25, 22, 18, 15, 13,
            11, 12, 15, 20, 18, 17, 16, 18, 23, 25];

        var rects = svg.selectAll("rect");//.transition().duration(2000).attr("transform", "translate(100,0)");
        console.log(rects.data());

         /*.attr("height", function (d) {
            return d * 4;
        })*/
    }    
}

function modifyGraph(id) {
    var svg = d3.selectAll(id);
    //alert("Hello World");
    //svg.transition().duration(2000).style("background-color", "white")
    //    .transition().duration(2000).attr("transform", "translate(100,0)");
    
    var dataset = [];
    for (var i = 0, t = 20; i < t; i++) {
        dataset.push(Math.round(Math.random() * t) + 5);
    }
    //var maxValue = d3.max(dataset, function (d) { return d; });
    var h = svg.attr("height");
    var barPadding = 5;  // <-- Nueva!

    /*var yScale = d3.scaleLinear()
        .domain([0, maxValue])
        .range([h - barPadding, barPadding]);*/

    var color = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, maxValue]);

    //console.log(dataset);
    var rects = svg.selectAll("rect");
    //var oldSet = rects.data();
    rects.data(dataset).enter().append("rect");
    //console.log(rects.data());
    
    rects.transition().duration(2000)
        .attr("y", function (d) {
            return yScale(d);  //Altura menos el dato
            })
        .attr("height", function (d) {
            return h - yScale(d);
        })
        .attr("fill", function (d) {
            return color(d); //"rgb(0, 0, " + (d * 10) + ")";
        });

    var texts = svg.selectAll("text");
    //var oldSet = rects.data();
    texts.data(dataset).enter().append("text");
    //console.log(rects.data());
    var h = svg.attr("height");
    texts.transition().duration(2000)
        .text(function (d) {
            return d;
        })
        .attr("y", function (d) {
            return yScale(d) + 15; 
        })
    svg.selectAll(".axis").remove();
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + padding + ",0)")
        .call(yAxis);

}

function updateGraph(id) {

    var dataset = d3.csv("data/countCountryPerDomain2.csv",
        function (d, i, columns) { //row
            for (var i = 0, n = columns.length; i < n; ++i)
                d[columns[i]] = +d[columns[i]];
            return d;
        }, function (error, data) { //callback
            if (error) throw error;

            var svg = d3.selectAll(id);
            //alert("Hello World");
            console.log(data);
            
            var maxValue = d3.max(data, function (d) { return d.numdomains; });
            var h = svg.attr("height");
            var barPadding = 25;  // <-- Nueva!

            var yScale = d3.scaleLinear()
                .domain([0, maxValue])
                .range([h - barPadding, barPadding]);

            var color = d3.scaleSequential(d3.interpolateBlues)
                .domain([0, maxValue]);

            //console.log(dataset);
            var rects = svg.selectAll("rect");
            //var oldSet = rects.data();
            rects.data(data).enter().append("rect");
            //console.log(rects.data());

            rects.transition().duration(2000)
                .attr("y", function (d) {
                    return yScale(d.numdomains);  //Altura menos el dato
                })
                .attr("height", function (d) {
                    return h - yScale(d.numdomains);
                })
                .attr("fill", function (d) {
                    return color(d.numdomains); //"rgb(0, 0, " + (d * 10) + ")";
                });

            var texts = svg.selectAll("text");
            //var oldSet = rects.data();
            texts.data(data).enter().append("text");
            //console.log(rects.data());
            var h = svg.attr("height");
            texts.transition().duration(2000)
                .text(function (d) {
                    return d.numdomains;
                })
                .attr("y", function (d) {
                    return yScale(d.numdomains) + 15;
                })

        });
}