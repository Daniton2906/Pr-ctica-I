// JavaScript source code
//Width and height

dates = ["2017-01-24", "2017-01-31", "2017-06-27"];

months = {1:"Jan", 2:"Feb", 3:"Mar", 4:"Apr", 5:"May", 6:"Jun", 7:"Jul", 8:"Aug", 9:"Sep", 10:"Oct", 11:"Nov", 12:"Dec"};

/*
  init_dataset:
    var dataset: arreglo vacio (se le agregará la información)
    var url_name: ubicacion de los csvs

  Convierte archivo cvs en tabla cantidad de fallas vs tiempo
  para cada tipo de falla
*/
function init_dataset(new_csv, url_name, i) {
    if(i < dates.length){
      d3.csv(url_name + dates[i] + ".csv", function(data) {
        var keys = data.columns;
        //console.log(data);    
        if(i == 0) {
          new_csv += "date,"+keys[0]+","+keys[1]+"\r\n";
        } 
        for(var j = 0; j < data.length; j++)
          new_csv += dates[i]+","+data[j][keys[0]]+","+data[j][keys[1]]+"\r\n";
        
        init_dataset(new_csv, url_name, i + 1);
      });
    }
    else{
        //console.log(new_csv);
        init_linechart(new_csv);
    }    
}


function init_linechart(csv_string){

  var dataset = d3.csvParse(csv_string);
  //console.log(dataset);

  var keys = dataset.columns;

  console.log(keys);

  var failiures = d3.nest()
      .key(function(d) { return d[keys[1]]; }) //segunda llave: Failiure
      .entries(dataset);

  console.log(failiures);
  var margin = {top: 80, right: 50, bottom: 80, left: 100},
      w = 850,
      h = 500;

  //console.log(failiures[0].values);

  var maxValue = d3.max(failiures, function(failiure) { 
                return d3.max(failiure.values, function(f){
                  return +f[keys[2]]; //tercera llave: Domains
                }); 
              });
  //console.log(maxValue);

  width = w - margin.left - margin.right,
  height = h - margin.top - margin.bottom;

  var yScale = d3.scaleLinear()
      .domain([0, maxValue])
      .rangeRound([height, 0]);

  var xScale = d3.scaleLinear()
      .domain([0, dates.length])
      .rangeRound([0, width]);

  var color = d3.scaleOrdinal(d3.schemeCategory10).domain([0, dates.length]); 

  var line = d3.local();


  /*var line = d3.line()
      .x(function(d, i) { return xScale(i); })
      .y(function(d) { return yScale(d); });*/


  var svg = d3.select("#grafico7")
      .append("svg")
      .attr("width", w)
      .attr("height", h)      

  svg.append("g")
        .attr("transform", "translate("+ margin.left +"," + (height + margin.top) + ")")
        .call(d3.axisBottom(xScale))

  svg.append("g")
      .attr("transform", "translate("+ margin.left +"," + margin.top + ")")
        .call(d3.axisLeft(yScale))
      .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Price ($)");

  //console.log(lines_data);



  g = svg.selectAll(".line")
    .data(failiures)
    .enter().append("g")
    .attr("class", "line")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .each(function(d) {
        line.set(this, d3.line()
            .x(function(d, i) { return xScale(i); }) //primera llave: date
            .y(function(d) { return yScale(+d[keys[2]]); }) //tercera llave: Domains
            );
    });

  //console.log(failiures);
  //console.log(g);

   g.append("path")
      .attr("fill", "none")     
      .attr("stroke", function (d, i) {
        return color(i);})
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 1.5)
      .attr("d", function(d) { return line.get(this)(d.values); });

/*  p = g.append("path")
  	  .datum(dataset)
  	  .attr("fill", "none")
  	  .attr("stroke", "steelblue")
  	  .attr("stroke-linejoin", "round")
  	  .attr("stroke-linecap", "round")
  	  .attr("stroke-width", 1.5);
  	  //.attr("d", line);*/

      /*.each( function (d) {
        console.log(d);
      });*/

}

init_dataset("", "data/countDomainsWithDNSSECErrors/countDomainsWithDNSSECErrors", 0);
