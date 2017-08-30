
var margin = {top: 80, right: 200, bottom: 80, left: 100},
    w = 850,
    h = 500; 
var data1 = [{"letter":"A","presses":3},{"letter":"B","presses":1},{"letter":"C","presses":1}];
var data2 = [{"letter":"A","presses":1},{"letter":"B","presses":3},{"letter":"C","presses":1}];
var data3 = [{"letter":"A","presses":1},{"letter":"B","presses":1},{"letter":"C","presses":3}];

var arc, labelArc, radius;

function init_pie_chart(){

  var svg = d3.select("#grafico9")
    .append("svg")
    .attr("width", w)
    .attr("height", h);
    
  var width = +svg.attr("width") - margin.right - margin.left,
        height = +svg.attr("height") - margin.top - margin.bottom,
  // Think back to 5th grade. Radius is 1/2 of the diameter. What is the limiting factor on the diameter? Width or height, whichever is smaller 
  radius = Math.min(width, height) / 2;

  var g = svg.append("g")
      .attr("transform", "translate(" + width/2 + "," + height/2 +")"); // Moving the center point. 1/2 the width and 1/2 the height

  arc = d3.arc()
    .outerRadius(radius - 10)
    .innerRadius(0);

  labelArc = d3.arc()
    .outerRadius(radius - 40)
    .innerRadius(radius - 40);

  var color = d3.scaleOrdinal()
  .range(["#2C93E8","#838690","#F56C4E"]);

  var pie = d3.pie()
  .value(function(d) { return d.presses; })(data1);

  

  var pie_chart = g.selectAll("arc")
    .data(pie)
    .enter().append("g")
    .attr("class", "arc");

  pie_chart.append("path")
    .attr("d", arc)
    .style("fill", function(d) { return color(d.data.letter);})
    .each(function(d) { this._current = d; }); // store the initial angles;

  pie_chart.append("text")
    .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
    .text(function(d) { 
      if(d.data.presses == 0)
        return "";
      return d.data.letter;}) 
    .style("fill", "#fff")
    .each(function(d) { this._current = d; }); // store the initial angles;

    d3.select("button#a")
      .on("click", function() {
        //data[0].presses++;
        change(data1);
      })
    d3.select("button#b")
      .on("click", function() {
        //data[1].presses++;
        change(data2);
      })
    d3.select("button#c")
      .on("click", function() {
        //data[2].presses++;
        change(data3);
      })    

}

function change(data) {
  var pie = d3.pie()
    .value(function(d) { return d.presses; })(data);
  path = d3.select("#grafico9").selectAll("path").data(pie); // Compute the new angles
  //path.attr("d", arc); // redrawing the path      
  path.transition().duration(500).attrTween("d", arcTween); // Smooth transition with arcTween
  //d3.select("#grafico9").selectAll("text").data(pie).attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; }); // recomputing the centroid and translating the text accordingly.      
  d3.select("#grafico9").selectAll("text").data(pie).transition().duration(500).text(function(d) { 
      if(d.data.presses == 0)
        return "";
      return d.data.letter;}).attrTween("transform", labelarcTween); // Smooth transition with labelarcTween
}


function arcTween(a) {
  var i = d3.interpolate(this._current, a);
  this._current = i(0);
  return function(t) {
    return arc(i(t));
  };
} 

function labelarcTween(a) {
  var i = d3.interpolate(this._current, a);
  this._current = i(0);
  return function(t) {
    return "translate(" + labelArc.centroid(i(t)) + ")";
  };
} 


init_pie_chart();