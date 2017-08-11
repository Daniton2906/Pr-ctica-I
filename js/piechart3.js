// JavaScript source code
var width = 600;
var height = 400;

var svg = d3.select("#featured-wrapper")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("id", "pie1");

var radius = Math.min(width, height) / 2,
    g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var color = d3.scaleOrdinal(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

var pie = d3.pie()
    .sort(null)
    .value(function (d) { return d.population; });

var path = d3.arc()
    .outerRadius(radius - 10)
    .innerRadius(0);

var label = d3.arc()
    .outerRadius(radius - 40)
    .innerRadius(radius - 40);

d3.csv("http://localhost:8000/Documents/Visual%20Studio%202017/Projects/data/data.csv", function (d) {
        d.population = +d.population;
        return d;
    }, function (error, data) {
        if (error) throw error;

        var arc = g.selectAll(".arc")
            .data(pie(data))
            .enter().append("g")
            .attr("class", "arc");

        arc.append("path")
            .attr("d", path)
            .attr("fill", function (d) { return color(d.data.age); })
            .each(function (d) {
                this._current = d;
            });
        
        arc.append("text")
            .attr("transform", function (d) { return "translate(" + label.centroid(d) + ")"; })
            .attr("dy", "0.35em")
            .text(function (d) { return d.data.age; });
    });

function updatePie(id) {

    d3.csv("http://localhost:8000/Documents/Visual%20Studio%202017/Projects/data/data2.csv", function (d) {
        d.population = +d.population;
        return d;
    }, function (error, data) {
        if (error) throw error;

        var svg = d3.selectAll(id),
            g = svg.select("g");
        var arc = g.selectAll(".arc").data(pie(data));
        //console.log(arc);        
        //console.log(arc.data());

        //arc.selectAll("path").remove();
        /*arc.each(function (d, i) {
            var pf = d3.selectAll("path");
            var mp = pf._groups[0][i]; 
            pf._groups[0][i] = d;
            //  console.log(mp);
            console.log(pf);
            //console.log(pf.datum());
        })*/
        var p = arc.selectAll("path");
        //console.log(p.data());
        //arc.enter().append("path");
            
        //p = arc.selectAll("path");
        var array = arc.data();
             
        //console.log(array);
        p.transition().duration(750).attrTween("d", function () { arcTween.call(this, array) });


        // Store the displayed angles in _current.
        // Then, interpolate from _current to the new angles.
        // During the transition, _current is updated in-place by d3.interpolate.
        function arcTween(b) {
            var j = this._current.index;
            console.log(b[j]);
            console.log(this._current);
            var i = d3.interpolate(this._current, b[j]);
            console.log(i(0));
            console.log(i(0.5));
            console.log(i(1));
            this._current = i(1);            
            return function (t) {
                return path(i(t));
            };
        }
    });
}
