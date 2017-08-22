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

  //console.log(keys);

  var failiures = d3.nest()
      .key(function(d) { return d[keys[1]]; }) //segunda llave: Failiure
      .entries(dataset);

  //console.log(failiures);
  var margin = {top: 100, right: 250, bottom: 80, left: 100},
      w = 850,
      h = 500;

  //console.log(failiures[0].values);

  var formatTime = d3.timeFormat("%Y-%m-%d");
  var parseTime = d3.timeParse("%Y-%m-%d");
  /*for (var i = 0; i < dates.length; i++) {
    console.log(formatTime(parseTime(dates[i]))); 
  }
  console.log(formatTime(new Date));*/

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

  var xScale = d3.scaleBand()
      .domain(dates)
      .rangeRound([0, width])
      .paddingOuter(0.1);

  var xScale_2 = d3.scaleBand()
      .domain(d3.map(dates, function (d) {
        return formatTime(parseTime(d));
      }))
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
      .style("background-color", "white");   

  //console.log(d3.map(dates, parseTime));
  svg.append("g")
        .attr("transform", "translate("+ margin.left +"," + (height + margin.top) + ")")
        .call(d3.axisBottom(xScale));

  svg.append("g")
      .attr("transform", "translate("+ margin.left +"," + margin.top + ")")
        .call(d3.axisLeft(yScale))
      .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text(" Número de " + keys[2]);

  //console.log(lines_data);

  g = svg.selectAll(".line")
    .data(failiures)
    .enter().append("g")
    .attr("class", "line")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .each(function(d) {
        line.set(this, d3.line()
            .x(function(d, i) { return xScale(d[keys[0]]); }) //primera llave: date
            .y(function(d) { return yScale(+d[keys[2]]); }) //tercera llave: Domains
            );
    });

  //console.log(failiures);
  //console.log(g);

  //console.log(dataset)

   g.append("path")
      .attr("fill", "none")     
      .attr("stroke", function (d, i) {
        return color(i);})
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 1.5)
      .attr("d", function(d) { return line.get(this)(d.values); });      

  var circles = g.selectAll("circle")
    .data(dataset)
    .enter()
    .append("circle")
      .attr("cx", function(d) {
          return xScale(d[keys[0]]);
      })
      .attr("cy", function(d) {
          return yScale(+d[keys[2]]); 
      })
      .attr("r", 10)
      .attr("opacity", 0);

  var tp = d3.tip().attr('class', 'd3-tip').offset([-10, 0])
              .html(function(d) {
                return "<strong> "+ keys[2] + ":</strong> <span style='color:white'>" + d[keys[2]] + "</span>";
              });

  circles.call(tp);

  circles.on('mouseover', tp.show)
    .on('mouseout', tp.hide);   

    
  var rect_size = 25, 
      rect_padding = 2;

/* Permite posicionar cada recuadro de la leyenda. */
  var legend = svg.selectAll(".legend")
          .data(failiures)
          .enter()
      .append("g")
          .attr("class", "legend")
          .attr("transform", function(d, i) { return "translate(" + 50 +"," + i * rect_size + ")"; });


  /* Se le asigna el color respectivo a cada recuadro de leyenda creado. */
  legend.append("rect")
    .attr("x", width - rect_padding - rect_padding)
    .attr("width", rect_size - rect_padding)
    .attr("height", rect_size - rect_padding)
    .style("fill", function (d, i) {
        return color(i);
      }
      );

  /* Le asigna el nombre de la sección correspondiente al recuadro de la leyenda. */
  legend.append("text")
    .attr("x", width - 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(function(d) { return d.values[0][keys[1]]; });
}

init_dataset("", "data/countDomainsWithDNSSECErrors/countDomainsWithDNSSECErrors", 0);
