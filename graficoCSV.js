// JavaScript source code

//Width and height
var w = 600,
    h = 400,
    barPadding = 10,
    padding = 50
    y_padding = 25;

var url_name = "data/countCountryPerDomain";
var xScale = d3.scaleLinear()
    .range([padding, w]);
var yScale = d3.scaleLinear()
    .range([h - y_padding, 2*y_padding]);
var color = d3.scaleSequential(d3.interpolateBlues);

//Crear un elemento SVG
d3.select("#featured-wrapper")
            .append("svg")
            .attr("width", w)
            .attr("height", h)
            .attr("id", "graf2")
            .style("background-color", "navajowhite");

function updateCSVBarChart(id, n, duration) {

    var dataset = d3.csv(url_name + n + ".csv",
        function (d, i, columns) { //row
            for (var i = 0, n = columns.length; i < n; ++i)
                d[columns[i]] = +d[columns[i]];
            return d;
        }, function (error, data) { //callback
            if (error) throw error;

            var svg = d3.selectAll(id);
            
            var maxValue = d3.max(data, function (d) { return d.numdomains; });

            xScale.domain([0, data.length]);

            yScale.domain([0, maxValue]);

            color.domain([-maxValue, maxValue]);
            
            svg.selectAll("rect")
                .data(data)
                .enter()
                .append("rect")
                .transition()
                .duration(duration)
                .attr("x", function (d, i) {
                    return xScale(i);
                })
                .attr("y", function (d) {
                    return yScale(d.numdomains) - y_padding;  //Altura menos el dato
                })
                .attr("width", w / data.length - barPadding)
                .attr("height", function (d) {
                    return h - yScale(d.numdomains);
                })
                .attr("fill", function (d) {
                    return color(0);//color(d.numdomains);
                })
                .attr("stroke-width", "1px")
                .attr("stroke", "black");

            svg.selectAll("text")
                .data(data)
                .enter()
                .append("text")
                .transition()
                .duration(duration)
                .text(function (d) {
                    return d.numdomains;
                })
                .attr("x", function (d, i) {
                    return xScale(i) + (w / data.length - barPadding) / 2;
                })
                .attr("y", function (d) {
                    return yScale(d.numdomains) - 10;
                })
                .attr("font-family", "sans-serif")
                .attr("font-size", "11px")
                .attr("fill", "black")
                .attr("text-anchor", "middle");  
                
            var yAxis = d3.axisLeft()
            .scale(yScale)
            .ticks(5);  //Número aproximado de marcadores

            svg.selectAll(".axis").remove();
            svg.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(" + padding + ",0)")
                .call(yAxis);

        });
}

updateCSVBarChart("#graf2", "", 0);