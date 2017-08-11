// JavaScript source code
//Width and height

var margin = {top: 80, right: 50, bottom: 80, left: 150},
    w = 850,
    h = 500;
var barPadding = 5,
    padding = 25;  // <-- Nueva!

var dataset = [5, 10, 13, 19, 21, 25, 22, 18, 15, 13,
    11, 12, 15, 20, 18, 17, 16, 18, 23, 25];

var maxValue = 30;//d3.max(dataset, function (d) { return d; });
width = w - margin.left - margin.right,
height = h - margin.top - margin.bottom;

var yScale = d3.scaleLinear()
    .domain(d3.extent(dataset, function(d) { return d; }))
    .rangeRound([height, 0]);

var xScale = d3.scaleTime()
    .domain([0, dataset.length])
    .rangeRound([0, width]);

var line = d3.line()
    .x(function(d, i) { return xScale(i); })
    .y(function(d) { return yScale(d); });


var svg = d3.select("#featured-wrapper")
    .append("svg")
    .attr("width", w)
    .attr("height", h)
    .attr("id", "graf3");    

g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale))

g.append("g")
      .call(d3.axisLeft(yScale))
    .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Price ($)");

p = g.append("path")
	  .datum(dataset)
	  .attr("fill", "none")
	  .attr("stroke", "steelblue")
	  .attr("stroke-linejoin", "round")
	  .attr("stroke-linecap", "round")
	  .attr("stroke-width", 1.5)
	  .attr("d", line);
