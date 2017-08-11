// JavaScript source code
//Width and height
var w = 800;
var h = 200;
var barPadding = 5,
    padding = 25;  // <-- Nueva!

var dataset = [5, 10, 13, 19, 21, 25, 22, 18, 15, 13,
    11, 12, 15, 20, 18, 17, 16, 18, 23, 25];

var maxValue = 30;//d3.max(dataset, function (d) { return d; });

var yScale = d3.scaleLinear()
    .domain([0, maxValue])
    .range([h - barPadding, barPadding]);

var xScale = d3.scaleLinear()
    .domain([0, dataset.length])
    .range([padding, w]);

//console.log(maxValue);

/*
var color = d3.scaleQuantize()
    .domain([0, maxValue])
    .range(d3.schemeCategory20b);
console.log(d3.schemeCategory20b);
*/
var color = d3.scaleSequential(d3.interpolateBlues)
    .domain([0, maxValue]);
console.log(color(0));
console.log(color(10));
console.log(color(25));

//Creará un elemento SVG
var svg = d3.select("#featured-wrapper").datum("0")
    .append("svg")
    .attr("width", w)
    .attr("height", h)
    .attr("id", "graf1");

svg.selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("x", function (d, i) {
        return xScale(i);//i * (w / dataset.length);
    })
    .attr("y", function (d) {
        return yScale(d);  //Altura menos el dato
    })
    .attr("width", w / dataset.length - barPadding)
    .attr("height", function (d) {
        return h - yScale(d);
    })
    .attr("fill", function (d) {
        return color(d);//"rgb(0, 0, " + (d * 10) + ")";
    });

svg.selectAll("text")
    .data(dataset)
    .enter()
    .append("text")
    .text(function (d) {
        return d;
    })
    .attr("x", function (d, i) {
        return xScale(i) /*i * (w / dataset.length)*/ + (w / dataset.length - barPadding) / 2;
    })
    .attr("y", function (d) {
        return yScale(d) + 15;
    })
    .attr("font-family", "sans-serif")
    .attr("font-size", "11px")
    .attr("fill", "white")
    .attr("text-anchor", "middle");

    /*var xAxis = d3.axisBottom()
        .scale(xScale)*/
        

    var yAxis = d3.axisLeft()
        .scale(yScale)
        .ticks(5);  //Número aproximado de marcadores

    /*svg.append("g")
        .attr("class", "axis")  //Assign "axis" class
        .attr("transform", "translate(0," + (h - padding) + ")")
        .call(xAxis);*/

    //Create Y axis
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + padding + ",0)")
        .call(yAxis);


function modifyGraph(id) {
    var svg = d3.selectAll(id);
    
    var dataset = [];
    for (var i = 0, t = 20; i < t; i++) {
        dataset.push(Math.round(Math.random() * t) + 5);
    }
    //var maxValue = d3.max(dataset, function (d) { return d; });
    var h = svg.attr("height");
    var barPadding = 5;  // <-- Nueva!

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
