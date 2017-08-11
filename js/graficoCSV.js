// JavaScript source code

var margin = {top: 80, right: 50, bottom: 80, left: 150},
    w = 850,
    h = 500,
    url_name = "data/countCountryPerDomain/countCountryPerDomain"
    graf_id = "graf1";

//Crear un elemento SVG
var svg = d3.select(".grafico1") //("#featured-wrapper")
            .append("svg")
            .attr("width", w)
            .attr("height", h)
            .attr("id", graf_id)
            .style("background-color", "white");

//Width and height
var width = +svg.attr("width") - margin.right - margin.left,
    height = +svg.attr("height") - margin.top - margin.bottom,
    barPadding = height/100,  
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");   

var x = d3.scaleBand()
        .rangeRound([0, width])
        .padding(0.1),
    xScale = d3.scaleLinear()
        .range([0, width]),
    yScale = d3.scaleLog()
        .range([height, 0])
        .base(10),
    color = d3.scaleSequential(d3.interpolateBlues);

var xAxis = d3.axisBottom()
        .scale(x),
    yAxis = d3.axisLeft()
        .scale(yScale)
        .ticks(5);  //Número aproximado de marcadores

var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            return "<strong>Dominios:</strong> <span style='color:white'>" + d.numdomains + "</span>";
        });


function updateCSVBarChart(id, n, duration) {

    var dataset = d3.csv(url_name + n + ".csv",
        function (d, i, columns) { //row
            for (var i = 0, n = columns.length; i < n; ++i)
                d[columns[i]] = +d[columns[i]];
            return d;
        }, function (error, data) { //callback
            if (error) throw error;

            var g = d3.selectAll(id).select("g");

            g.call(tip);
            
            var maxValue = d3.max(data, function (d) { return d.numdomains; });

            xScale.domain([0, data.length]);

            yScale.domain([1, maxValue]);

            color.domain([-maxValue, maxValue]);

            x.domain(data.map(function(d) { return d.countrycount; }));
            
            var rects= g.selectAll("rect");

            rects.data(data)
                .enter()
                .append("rect");

            rects.transition()
                .duration(duration)
                .attr("x", function (d, i) {
                    return x(d.countrycount);
                })
                .attr("y", function (d) {
                    return yScale(d.numdomains) - barPadding;  //Altura menos el dato
                })
                .attr("width", x.bandwidth())
                .attr("height", function (d) {
                    return height - yScale(d.numdomains) + barPadding;
                })
                .attr("fill", function (d) {
                    return color(0);//color(d.numdomains);
                })
                .attr("stroke-width", "1px")
                .attr("stroke", "black");

            rects.on('mouseover', tip.show)
                .on('mouseout',tip.hide);        
                
            yAxis.scale(yScale);

            xAxis.scale(x);

            g.selectAll(".axisX").remove();
            g.append("g")
              .attr("class", "axisX")
              .attr("transform", "translate(0," + height + ")")
              .call(xAxis)

              g.append("text")
                   .attr("y", height + margin.bottom/2)
                   .attr("dx","25em")
                   //.attr("dy","10em")
                   .style("text-anchor","end")
                   .text("Cantidad de países");

            g.selectAll(".axisY").remove();
            g.append("g")
                .attr("class", "axisY")
                .attr("transform", "translate(0,0)")
                .call(yAxis)

                g.append("text")
                    .attr("y", margin.left/4)
                    .attr("dy","-6em")
                    .attr("transform","rotate(-90)")
                    .style("text-anchor","end")
                    .text("Numero de dominios, logaritmica");

        });
}

updateCSVBarChart("#" + graf_id, "1", 0);
updateCSVBarChart("#" + graf_id, "1", 0);

/* Esto permite identificar cuando ocurre un cambio del set de datos del gráfico. */ 
d3.select("#opts1").on("change", function() {
    //console.log(d3.select(this).property("value"));
    var value = eval(d3.select(this).property("value"));
    //alert("Cambia a " + value);
    updateCSVBarChart("#" + graf_id, value, 2000);
});