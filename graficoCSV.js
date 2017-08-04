// JavaScript source code

var dataset = d3.csv("data/countCountryPerDomain.csv",
    function (d, i, columns) { //row
        for (var i = 0, n = columns.length; i < n; ++i)
            d[columns[i]] = +d[columns[i]];
        return d;
    }, function (error, data) { //callback
        if (error) throw error;

        var keys = data.columns.slice(0); //["numdomains", "countrycount"]

        //console.log(keys);        
        //console.log(data);


        //Width and height
        var w = 800;
        var h = 200;
        var barPadding = 25;  // <-- Nueva!

        var maxValue = d3.max(data, function (d) { return d.numdomains; });
        console.log(maxValue);

        var yScale = d3.scaleLinear()
            .domain([0, maxValue])
            .range([h - barPadding, barPadding]);

        var color = d3.scaleSequential(d3.interpolateBlues)
            .domain([0, maxValue]);
        console.log(color(0));
        console.log(color(100));
        console.log(color(maxValue));

        //Crear un elemento SVG
        var svg = d3.select("#featured-wrapper")
            .append("svg")
            .attr("width", w)
            .attr("height", h)
            .attr("id", "graf2")
            .style("background-color", "indianred");

        svg.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", function (d, i) {
                return i * (w / data.length);
            })
            .attr("y", function (d) {
                return yScale(d.numdomains);  //Altura menos el dato
            })
            .attr("width", w / data.length - barPadding)
            .attr("height", function (d) {
                return h - yScale(d.numdomains);
            })
            .attr("fill", function (d) {
                return color(d.numdomains);//"rgb(0, 0, " + (d * 10) + ")";
            });

        svg.selectAll("text")
            .data(data)
            .enter()
            .append("text")
            .text(function (d) {
                return d.numdomains;
            })
            .attr("x", function (d, i) {
                return i * (w / data.length) + (w / data.length - barPadding) / 2;
            })
            .attr("y", function (d) {
                return yScale(d.numdomains) + 15;
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("fill", "black")
            .attr("text-anchor", "middle");             

        
    });