// JavaScript source code

var margin = {top: 80, right: 200, bottom: 80, left: 100},
    w = 850,
    h = 500,
    url_name = "data/countNSPerDomain/countNSPerDomain",
    graf_id = "#grafico3",
    text_id = "#text3",
    opt_id = "#opts3"; 

var x = d3.local(),
    xScale = d3.local(),
    yScale = d3.local(),
    color = d3.local(),
    xAxis = d3.local(),
    yAxis = d3.local();


function init_bar_chart(graf_id, text_id, text_name, opt_id, url_name, tip_name, inverse) {

    //Crear un elemento SVG
    var svg = d3.select(graf_id) //("#featured-wrapper")
                .append("svg")
                .attr("width", w)
                .attr("height", h)
                .style("background-color", "white");

    //Width and height
    var width = +svg.attr("width") - margin.right - margin.left,
        height = +svg.attr("height") - margin.top - margin.bottom,
        barPadding = height/100,  
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");   

    /* Se realiza la obtención de los datos. */
    d3.json("js/descrip.json", function(text) {

        var root = d3.hierarchy(text);
        root.sum(function(d) {return d.size})

        var partition = d3.partition().size([height, width])
                     .padding(0);
                     //.round(f);
        /* Permite seleccionar donde posicionar el texto en la página web. */
        var svgraf3 = d3.select(text_id);
        /* Permite particionar los datos en nodos. */
        var g1 = partition(root).children;
        
        /* Se busca el nodo correspondiente al gráfico que se desea definir. */
        g1.forEach(function(d){
            if(d.data.name == text_name){           
                /* Se adhiere el texto a la página web. */
                d.data.children.forEach(function(h){
                    svgraf3.append("p")
                    .attr("align","justify")
                    .style("text-anchor","end")
                    .text(h.size);
                });
            };
        });

    })

    //definir escalas, ejes y tip de manera local para cada grafico
    g.call( function() {
                var lx = x.set(this, d3.scaleBand()
                    .rangeRound([0, width])
                    .padding(0.1)
                    );
                xScale.set(this, d3.scaleLinear()
                    .range([0, width])
                    );
                var ty = yScale.set(this, d3.scaleLog()
                    .range([height, 0]).base(10)
                    );
                color.set(this, d3.scaleSequential(d3.interpolateBlues)
                    );
                xAxis.set(this, d3.axisBottom()
                    .scale(lx)
                    );
                yAxis.set(this, d3.axisLeft()
                    .scale(ty)
                    .ticks(5) //Número aproximado de marcadores);
                    ); 
    })

    updateCSVBarChart(graf_id, "2017-01-16", text_id, url_name, 0, tip_name, inverse);
    updateCSVBarChart(graf_id, "2017-01-16", text_id, url_name, 0, tip_name, inverse);

    /* Esto permite identificar cuando ocurre un cambio del set de datos del gráfico. */ 
    d3.select(opt_id).on("change", function() {

        var value = d3.select(this).property("value");
        updateCSVBarChart(graf_id, value, text_id, url_name, 2000, tip_name, inverse);
    });       

}           

function updateCSVBarChart(graf_id, n, text_id, url_name, duration, tip_name, inverse) {

    var dataset = d3.csv(url_name + n + ".csv",
        function (d, i, columns) { //row
            for (var i = 0, n = columns.length; i < n; ++i)
                d[columns[i]] = +d[columns[i]];
            return d;
        }, function (error, data) { //callback
            if (error) throw error;

            var svg = d3.select(graf_id).select("svg"),
                width = +svg.attr("width") - margin.right - margin.left,
                height = +svg.attr("height") - margin.top - margin.bottom,
                barPadding = height/100,  
                g = svg.select("g");

            var keys = data.columns;   
            //console.log(keys); //["numns", "num"]
            if (inverse) {
                keys.reverse();
            }
            
            console.log(keys);           
                        
            var maxValue = d3.max(data, function (d) { return d[keys[0]]; });

            var tx, ty, tc, lx, ax, ay;

            g.call( function(){

                tx = xScale.get(this).domain([0, data.length]);

                ty = yScale.get(this).domain([1, maxValue]);

                tc = color.get(this).domain([-maxValue, maxValue]);

                lx = x.get(this).domain(data.map(function(d) { return d[keys[1]]; }));

                ax = xAxis.get(this).scale(lx);

                ay = yAxis.get(this).scale(ty);
            
            });

            var tp = d3.tip()
                    .attr('class', 'd3-tip')
                    .offset([-10, 0])
                    .html(function(d) {
                        return "<strong> "+ tip_name + ":</strong> <span style='color:white'>" + d[keys[0]] + "</span>";
                    });

            g.call(tp);
            
            var rects= g.selectAll("rect");

            rects.data(data)
                .enter()
                .append("rect");

            rects.transition()
                .duration(duration)
                .attr("x", function (d, i) {
                    return lx(d[keys[1]]);
                })
                .attr("y", function (d) {
                    return ty(d[keys[0]]) - barPadding;  //Altura menos el dato
                })
                .attr("width", lx.bandwidth())
                .attr("height", function (d) {
                    return height - ty(d[keys[0]]) + barPadding;
                })
                .attr("fill", function (d) {
                    return tc(0);//color(d.numdomains);
                })
                .attr("stroke-width", "1px")
                .attr("stroke", "black");

            rects.on('mouseover', tp.show)
                .on('mouseout', tp.hide);        
                            
            g.selectAll(".axisX").remove();
            g.append("g")
              .attr("class", "axisX")
              .attr("transform", "translate(0," + height + ")")
              .call(ax)

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
                .call(ay)

                g.append("text")
                    .attr("y", margin.left/4)
                    .attr("dy","-6em")
                    .attr("transform","rotate(-90)")
                    .style("text-anchor","end")
                    .text("Número de dominios, logaritmica");

        });
}

init_bar_chart("#grafico3", "#text3", 'Gráfico 3', "#opts3", "data/countNSPerDomain/countNSPerDomain", "NSs", 1);

init_bar_chart("#grafico5", "#text5", 'Gráfico 5', "#opts5", "data/countCountryPerDomain/countCountryPerDomain", "Dominios", 0);

