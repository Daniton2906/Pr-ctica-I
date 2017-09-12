

var data1 = [{"letter":"A","presses":3},{"letter":"B","presses":1},{"letter":"C","presses":1}];
var data2 = [{"letter":"A","presses":1},{"letter":"B","presses":3},{"letter":"C","presses":1}];
var data3 = [{"letter":"A","presses":1},{"letter":"B","presses":1},{"letter":"C","presses":3}];

//var arc;
var arc_local = d3.local();

function init_pie_chart(info, sizes, multiple){  

  var svg = d3.select(info.graf_id)
    .append("svg")
    .attr("id", "contain")
    .attr("width", sizes.w)
    .attr("height", sizes.h)
    .style("background-color", "white")
    .attr("transform", "translate(" + sizes.offset_x + "," + sizes.offset_y +")");  

  var width = +svg.attr("width") - sizes.margin.right - sizes.margin.left,
      height = +svg.attr("height") - sizes.margin.top - sizes.margin.bottom,  
      radius = Math.max(Math.min(width, height) / 2, 100); //What is the limiting factor on the diameter? Width or height, whichever is smaller   

  if(multiple <= 0)
    /* Se realiza la obtención de los datos. */
    d3.json("js/descrip.json", function(text) {

        var root = d3.hierarchy(text);
        root.sum(function(d) {return d.size})

        var partition = d3.partition().size([height, width])
                     .padding(0);
                     //.round(f);
        /* Permite seleccionar donde posicionar el texto en la página web. */
        var svgraf3 = d3.select(info.text_id);
        /* Permite particionar los datos en nodos. */
        var g1 = partition(root).children;
        
        /* Se busca el nodo correspondiente al gráfico que se desea definir. */
        g1.forEach(function(d){
            if(d.data.name == info.text_name){           
                /* Se adhiere el texto a la página web. */
                d.data.children.forEach(function(h){
                    svgraf3.append("p")
                    .attr("align","justify")
                    .style("text-anchor","end")

                    .text(h.size);
                });
            };
        });

    });

  var g = svg.append("g"),
      per = svg.append("g").attr("id", info.per_id)
        .append("text"),
      arc = d3.arc()
        .outerRadius(radius);

  if(multiple == -1){    
    g.attr("transform", "translate(" + width/2 + "," + height/2 +")"); // Moving the center point. 1/2 the width and 1/2 the height
    per.attr("transform", "translate(" + (width/2 - 25) + "," + height/2 +")");
    arc.innerRadius(125);
  } else {
    g.attr("transform", "translate(" + width/2 + "," + (height/2+25) +")"); // Moving the center point. 1/2 the width and 1/2 the height
    per.attr("transform", "translate(" + (width/2 - 25) + "," + (height/2+20) +")");
    arc.innerRadius(50);
  }  

  d3.csv(info.url_name + "2017-01-31" + ".csv", function (error, data) {
    //console.log(data);
    var dataset = data;
    if(multiple != -1){
      var title = dataset[multiple]['Categoria'];
      svg.append("g").attr("id", "title"+multiple)
      .append("text")
      .attr("transform", "translate(0, 20)")
      .text(title);
    }
    if(info.fix != undefined)
      dataset = info.fix(data);

    keys = dataset.columns;
    var pie = d3.pie()
      .value(function(d) {
        if(info.logScale)
          if(d[keys[1]] == 0) 
            return Math.log10(1);
          else
            return Math.log10(d[keys[1]]); 
          return d[keys[1]]; 
      })(dataset);

    pie.sort(function(a,b) {return a.index - b.index});

    var pie_chart = g.selectAll("arc")
      .data(pie)
      .enter().append("g")
      .attr("class", "arc");

    pie_chart.append("path")
      .attr("d", arc)
      .attr("id", "anidado")
      .style("fill", function(d) { 
        return info.color(d.data[keys[0]]);})
      .each(function(d) { 
        this._current = d; // store the initial angles;            
        arc_local.set(this, arc);
      }); 

    if(multiple <= 0){
      var issues = [];
      for (var i = 0; i < dataset.length; i++) {
      issues.push(dataset[i][keys[0]]);
      }
      put_legend(info, issues, width, height);
    }

    pie_chart.on("mouseover", info.m_over);
    svg.on("mouseleave", info.m_leave);
    pie_chart.on("mouseover", null);
    update_pie_chart(info, d3.select(info.opt_id).property("value"));

    d3.select(info.opt_id).on("change", function() {
      var value = d3.select(this).property("value");
      //console.log(value);        
      update_pie_chart_11(value); //"2017-01-31"
    }); 

  });


}

function update_pie_chart(info, value) {

  d3.csv(info.url_name + value + ".csv", function (error, data) {
    var dataset = data;
    if(info.fix != undefined)
      dataset = info.fix(data);

    var keys = dataset.columns;

    change(dataset, keys, info);
  });

}

function change(data, keys, info) {
  var pie = d3.pie()
    .value(function(d) {
        if(info.logScale)
          if(d[keys[1]] == 0) 
            return Math.log10(1);
          else
            return Math.log10(d[keys[1]]); 
        return d[keys[1]];
    })(data);

  pie.sort(function(a,b) {return a.index - b.index});
  path = d3.select(info.graf_id).selectAll("path").data(pie); // Compute the new angles
  path.transition().duration(1000).attrTween("d", arcTween); // Smooth transition with arcTween
  path.on("mouseover", info.m_over);
}


function arcTween(a) {
  var i = d3.interpolate(this._current, a);
  this._current = i(0);
  var arc = arc_local.get(this);
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

function put_legend(info, issues, width, height) {

  var legend = d3.select(info.graf_id).select("#contain").append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
      .attr("id", "legend")
        .selectAll("#legend")
        .data(issues)
        .enter().append("g")
          .attr("transform", function(d, i) { return "translate(25," + i * 20 + ")"; });

      legend.append("rect")
          .attr("x", width - 19)
          .attr("width", 19)
          .attr("height", 19)
          .attr("fill", info.color);

      legend.append("text")
          .attr("x", width - 24)
          .attr("y", 9.5)
          .attr("dy", "0.32em")
          .text(function(d) { return d; });  
}

// Fade all but the current sequence, and show it in the breadcrumb trail.
function mouseover(d, info) {
    var keys = Object.keys(d.data),
      name = d.data[keys[0]],
      total = d.data[keys[1]];
  
    var per = d3.select("#" + info.per_id),
      p = per.select("text");
    
    p.selectAll("*").remove();
    p.append("tspan")
      .attr("dy", 0)
      .attr("x",0)
      .text(function(d) {return keys[1] + ":";});
    p.append("tspan")
      .attr("dy", "1.2em") // offest by 1.2 em
      .attr("x",0)
      .attr("dx", "1.8em")
      .text(function(d) {return total;})
      .attr("text-anchor","middle");

    // Fade all the segments.
    d3.select(info.graf_id).selectAll("path#anidado")
        .style("opacity", 0.3);
    // Then highlight only those that are an ancestor of the current segment.
    d3.select(info.graf_id).selectAll("path#anidado")
        .filter(function(d) {
            return d.data[keys[0]].localeCompare(name) == 0;
        })
        .style("opacity", 1);
}

// Restore everything to full opacity when moving off the visualization.
function mouseleave(d, info) {  
  var g = d3.select(info.graf_id);

  // Deactivate all segments during transition.
  d3.select(info.graf_id).selectAll("path#anidado").on("mouseover", null);
  d3.select("#" + info.per_id).select("text").selectAll("*").remove();
  // Transition each segment to full opacity and then reactivate it.
  d3.select(info.graf_id).selectAll("path#anidado")
      .transition()
      .duration(1000)
      .style("opacity", 1)
      .each(function() {
              d3.select(this).on("mouseover", info.m_over);
            });
  d3.select(info.graf_id).select("#explanation")
    .style("visibility", "hidden");
}

function update_multiple_pie_charts(info, value) {

    update_pie_chart (align_info(info, 0), value, 0);
    update_pie_chart (align_info(info, 1), value, 1);
    update_pie_chart (align_info(info, 2), value, 2);
    update_pie_chart (align_info(info, 3), value, 3);
    update_pie_chart (align_info(info, 4), value, 4);
    
}

function align_info(info, i) {
  var f = function(dataset) {return arreglo_dataset_11(dataset, i);},
        copiedInfo = jQuery.extend(true, {}, info);
        copiedInfo.fix = f;      
        copiedInfo.graf_id += i;
        copiedInfo.per_id += i;

        copiedInfo.m_over = function (d) {return mouseover(d, copiedInfo);}
        copiedInfo.m_leave = function (d) {return mouseleave(d, copiedInfo);}

        return copiedInfo;
}

function create_mini_pie_chart (info, sizes, i, rows, columns) {
        
        var new_sizes = jQuery.extend(true, {}, mini_sizes);              
        new_sizes.offset_x = columns * mini_sizes.w;
        new_sizes.offset_y = rows * mini_sizes.h;                

        var chart_id = info.graf_id.replace('#', '') + i;   

        var sub_svg = d3.select(info.graf_id)
          .append('div')
          .attr("id", chart_id)
          .style('position','absolute')
          .style('width', new_sizes.w + "px")
          .style ('height', new_sizes.h + "px");

        var new_info = align_info(info, i);
        init_pie_chart(new_info, new_sizes, i);
}

/* DATOS GRAFICO 9*/

/* 
    Esta función permite inicializar el set de datos a utilizar. 
*/
function arreglo_dataset_9(old_dataset){

    var csv_string = "",
        keys = old_dataset.columns, 
        numdomains = keys[0], //primera llave: numdomains, 
        ipsv4count = keys[2]; //segunda llave: ipsv4count
        ipsv6count = keys[3]; //cuarta llave: ipsv6count

    var no_count = 0,
      v4_count = 0,
      v6_count = 0,
      both_count = 0;

    for (var i = 0; i < old_dataset.length; i++) {
      if(+old_dataset[i][ipsv4count] != 0 && +old_dataset[i][ipsv6count] != 0)
        both_count += +old_dataset[i][numdomains];
      else if(+old_dataset[i][ipsv4count] != 0)
        v4_count += +old_dataset[i][numdomains];
      else if(+old_dataset[i][ipsv6count] != 0)
        v6_count += +old_dataset[i][numdomains];
      else
        no_count += +old_dataset[i][numdomains];
    }

    var new_dataset = [{key:"Ninguno", Dominios:no_count},
    {key:"IPv4", Dominios:v4_count},
    {key:"IPv6", Dominios:v6_count},
    {key:"IPv4 & IPv6", Dominios:both_count}];
    new_dataset["columns"] = ["key", "Dominios"];

    return new_dataset;
}

info9 = {graf_id: "#grafico9", 
        text_id: "#text9",
        text_name: 'Gráfico 9',
        opt_id: "#opts9", 
        per_id: "per9",
        m_over: undefined,
        m_leave: undefined,
        color: undefined,
        url_name: "data/countDomainsWithCountNSIps/countDomainsWithCountNSIps",  
        logScale: 0,
        fix: arreglo_dataset_9};


info9.color = d3.scaleOrdinal().range(["#2C93E8","#838690","#F56C4E","#456F4F"]);
info9.m_over = function(d) {return mouseover(d, info9);};
info9.m_leave = function(d) {return mouseleave(d, info9);}        

sizes9 =  {margin : {top: 10, right: 50, bottom: 10, left: 10},
            w : 550,
            h : 500,
            offset_x: 0,
            offset_y: 0};

/* DATOS GRAFICO 10*/            

function arreglo_dataset_10(old_dataset){

  var keys = old_dataset.columns, 
        categoria = keys[0], //primera llave: numdomains, 
        dominios = keys[1]; //segunda llave: ipsv4count

  var new_dataset = []
  for (var i = 0; i < old_dataset.length; i++)
    new_dataset[i] = {categoria:old_dataset[i][categoria], dominios:+old_dataset[i][dominios]};

  new_dataset["columns"] = ["categoria", "dominios"];

  return new_dataset;
}

info10 = {graf_id: "#grafico10", 
            text_id: "#text10",
            text_name: 'Gráfico 10',
            opt_id: "#opts10", 
            per_id: "per10",
            m_over: undefined,
            m_leave: undefined,
            color: undefined,
            url_name: "data/countDomainsWithDNSSEC/countDomainsWithDNSSEC",  
            logScale: 1,
            fix: arreglo_dataset_10};

info10.color = d3.scaleOrdinal().range(["#2C93E8","#F56C4E","#456F4F"]);
info10.m_over = function(d) {return mouseover(d, info10);};
info10.m_leave = function(d) {return mouseleave(d, info10);}            

sizes10 =  {margin : {top: 10, right: 50, bottom: 10, left: 10},
                w : 550,
                h : 500,
                offset_x: 0,
                offset_y: 0}; 

/* DATOS GRAFICOS 11*/

info11 = {graf_id: "#grafico11", 
        text_id: "#text11", 
        text_name: 'Gráfico 11', 
        opt_id: "#opts11",
        per_id: "per11",
        m_over: undefined,
        m_leave: undefined,
        color: undefined,
        url_name: "data/countNameserverCharacteristics/countNameserverCharacteristics",         
        logScale:1,
        fix: undefined};

info11.color = d3.scaleOrdinal().range(["#F56C4E","#456F4F"]);
info11.m_over = function(d) {return mouseover(d, info11);};
info11.m_leave = function(d) {return mouseleave(d, info11);}

function arreglo_dataset_11(old_dataset, i) {
  var keys = old_dataset.columns, 
        categoria = keys[0], //primera llave: categoria
        cumple = keys[1], //segunda llave: cumple
        falla = keys[2]; //tercera llave: falla

  var new_dataset = [];
  new_dataset[0] = {estado:"Cumple", value:+old_dataset[i][cumple]};
  new_dataset[1] = {estado:"Falla", value:+old_dataset[i][falla]};
  new_dataset["columns"] = ["estado", "value"];
  
  return new_dataset;
}

function create_multiple_pie_charts(info) {
  var width = 550,
    height = 780,
    rows = 3,
    columns = 2;

  mini_sizes =  {margin : {top: 15, right: 30, bottom: 15, left: 2},
            w : width/columns,
            h : height/rows,
            offset_x: 0,
            offset_y: 0};
    
    create_mini_pie_chart (info, mini_sizes, 0, 0, 1);
    create_mini_pie_chart (info, mini_sizes, 1, 1, 0);
    create_mini_pie_chart (info, mini_sizes, 2, 1, 1);
    create_mini_pie_chart (info, mini_sizes, 3, 2, 0);
    create_mini_pie_chart (info, mini_sizes, 4, 2, 1);
}

function update_pie_chart_11(value) {
  update_multiple_pie_charts(info11, value)
}