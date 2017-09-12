// JavaScript source code

var margin = {top: 80, right: 200, bottom: 80, left: 100},
    w = 850,
    h = 500; 

var x = d3.local(),
    xScale = d3.local(),
    yScale = d3.local(),
    color = d3.local(),
    xAxis = d3.local(),
    yAxis = d3.local()
    length_dataset = d3.local();

dates1 = ["2017-01-16", "2017-01-31", "2017-06-27"];

/*

*/
function align_dataset(incomplete_data, complete_data, keys) {
    for(var i = 0; i < complete_data.length; i++){
        if(!contains(complete_data[i], incomplete_data, keys[1]))
            incomplete_data.push(complete_data[i]);
    }
}

/*

*/
function contains(element, array, key) {
    for(var i = 0; i < array.length; i++){
        //console.log(element + ", " + array[i])
        if(compare(+element[key], +array[i][key]) == 0)
            return 1;
    }
    return 0;
}

/*

*/
function compare(a, b) {
    if(a == b)
        return 0;
    else if(a < b)
        return -1;
    else
        return 1;
}

/*

*/
function set_bar_chart(new_dataset, info, i, fix) {
    if(i < dates1.length){
      d3.csv(info.url_name + dates1[i] + ".csv", function(data) {

        //console.log(data);
        var dataset = data;
        //console.log(data);
        if(fix != undefined)
            dataset = fix(data);

        //console.log(dataset);  
        var keys = dataset.columns;
        if(info.inverse)
            keys.reverse();

        for(var j = 0; j < dataset.length; j++){
            if(!contains(dataset[j], new_dataset, keys[1]))
                new_dataset.push(dataset[j]);
        }
        set_bar_chart(new_dataset, info, i + 1, fix);
      });
    }
    else{
        //console.log(new_dataset);
        for(var i = 0; i < new_dataset.length; i++) {
            var keys = Object.keys(new_dataset[i]);
            if(info.inverse) 
                keys.reverse();
            new_dataset[i][keys[1]] = +new_dataset[i][keys[1]];
            new_dataset[i][keys[0]] = 0;
        }        
        //console.log(new_dataset);
        init_bar_chart(new_dataset, info, fix);
    }    
}

/*

*/
function init_bar_chart(new_dataset, info, fix) {

    //Crear un elemento SVG
    var svg = d3.select(info.graf_id) //("#featured-wrapper")
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
                if(info.logScale)
                    var ty = yScale.set(this, d3.scaleLog()
                        .range([height, 0]).base(10)
                        );
                else
                    var ty = yScale.set(this, d3.scaleLinear()
                        .range([height, 0])
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

                //length_dataset.set(this, graf_id);
    })

    updateCSVBarChart(new_dataset, info, "2017-01-16", 0, fix);
    updateCSVBarChart(new_dataset, info, "2017-01-16", 0, fix);    

    /* Esto permite identificar cuando ocurre un cambio del set de datos del gráfico. */ 
    d3.select(info.opt_id).on("change", function() {
        var value = d3.select(this).property("value");
        updateCSVBarChart(new_dataset, info, value, 2000, fix);
    });       

}           

/*

*/
function updateCSVBarChart(total_dataset, info, n, duration, fix) {

    var dataset = d3.csv(info.url_name + n + ".csv",
        function (d, i, columns) { //row
            for (var i = 0, n = columns.length; i < n; ++i)
                d[columns[i]] = +d[columns[i]];
            return d;
        }, function (error, data) { //callback
            if (error) throw error;

            var svg = d3.select(info.graf_id).select("svg"),
                width = +svg.attr("width") - margin.right - margin.left,
                height = +svg.attr("height") - margin.top - margin.bottom,
                barPadding = height/100,  
                g = svg.select("g");            

            var dataset = data;
            if(fix != undefined){
                dataset = fix(data);

                for(var i = 0; i < dataset.length; i++){
                    var columns = dataset.columns;
                    for(var j = 0; j < columns.length; j++)
                        dataset[i][columns[j]] = +dataset[i][columns[j]];
                }                
            }

            var keys = dataset.columns;
            //console.log(keys); //["numns", "num"]
            if (info.inverse) {
                keys.reverse();
            }            

            align_dataset(dataset, total_dataset, keys);            

            dataset.sort(function (a, b) {return a[keys[1]] - b[keys[1]];})

            //console.log(dataset);
            
            //console.log(keys);           
                        
            var maxValue = d3.max(dataset, function (d) { return d[keys[0]]; });

            var tx, ty, tc, lx, ax, ay, ld;

            g.call( function(){

                tx = xScale.get(this).domain([0, dataset.length]);

                if(info.logScale)
                    ty = yScale.get(this).domain([1, maxValue]).clamp(true);
                else
                    ty = yScale.get(this).domain([0, maxValue]);

                tc = color.get(this).domain([-maxValue, maxValue]);

                lx = x.get(this).domain(dataset.map(function(d) { return d[keys[1]]; }));

                ax = xAxis.get(this).scale(lx);

                ay = yAxis.get(this).scale(ty);
                if(info.logScale)
                    ay.tickFormat(function (d) {
                        return ty.tickFormat(4, d3.format(",d"))(d)
                    });

                //ld = length_dataset.get(this);
            
            });

            //console.log(ld);

            var tp = d3.tip()
                    .attr('class', 'd3-tip')
                    .offset([-10, 0])
                    .html(function(d) {
                        return "<strong> "+ info.tip_name + ":</strong> <span style='color:white'>" + d[keys[0]] + "</span>";
                    });

            g.call(tp);
            
            var rects= g.selectAll("rect");

            rects.data(dataset)
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
                .attr("stroke", "black")
                .attr("opacity", function(d){
                    if(d[keys[0]] == 0)
                        return 0;
                    else
                        return 1;
                });

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
                   .text(info.y_label);

            g.selectAll(".axisY").remove();
            g.append("g")
                .attr("class", "axisY")
                .attr("transform", "translate(0,0)")
                .call(ay);

                g.append("text")
                    .attr("y", margin.left/4)
                    .attr("dy","-6em")
                    .attr("transform","rotate(-90)")
                    .style("text-anchor","end")
                    .text(info.x_label);

        });
}

/* INITIALIZING BAR CHARTS*/


info3 = {graf_id: "#grafico3", 
        text_id: "#text3", 
        text_name: 'Gráfico 3', 
        opt_id: "#opts3", 
        url_name: "data/countNSPerDomain/countNSPerDomain", 
        tip_name: "NSs", 
        inverse: 1, 
        x_label:"Número de NSs", 
        y_label:"Cantidad de dominios", 
        logScale:1};
    

info4 = {graf_id: "#grafico4", 
        text_id: "#text4", 
        text_name: 'Gráfico 4', 
        opt_id: "#opts4", 
        url_name: "data/countASNPerDomain/countASNPerDomain", 
        tip_name: "Dominios", 
        inverse: 0, 
        x_label:"Número de dominios, logaritmica", 
        y_label:"Cantidad de ASNs", 
        logScale:1};

info5 = {graf_id: "#grafico5", 
        text_id: "#text5", 
        text_name: 'Gráfico 5', 
        opt_id: "#opts5", 
        url_name: "data/countCountryPerDomain/countCountryPerDomain", 
        tip_name: "Dominios", 
        inverse: 0, 
        x_label:"Número de dominios, logaritmica", 
        y_label:"Cantidad de países", 
        logScale:1};


/* 
    Esta función permite inicializar el set de datos a utilizar. 
*/
function arreglo_dataset_6(old_dataset){

    var csv_string = "",
        keys = old_dataset.columns, //primera llave: numdomains, segunda llave: ipscount
        numdomains = keys[0],
        ipscount = keys[1];

    csv_string += numdomains + "," + ipscount + "\r\n";

    var ip_counter = 0,
        i = 0,
        dom_counter = 0;

    //console.log(old_dataset);
    while(i < old_dataset.length){
        dom_counter = 0;        
        while(i < old_dataset.length && ip_counter == +old_dataset[i][ipscount]){
            dom_counter += +old_dataset[i][numdomains];
            i++;
        }
        if(dom_counter != 0){
            csv_string += dom_counter + "," + ip_counter + "\r\n";
        }

        ip_counter++;
    }

    //console.log(d3.csvParse(csv_string));
    return d3.csvParse(csv_string);

}

info6 = {graf_id: "#grafico6", 
        text_id: "#text6", 
        text_name: 'Gráfico 6', 
        opt_id: "#opts6", 
        url_name: "data/countDomainsWithCountNSIps/countDomainsWithCountNSIps", 
        tip_name: "Dominios", 
        inverse: 0, 
        x_label:"Número de dominios, logaritmica", 
        y_label:"Número de IPs de NS", 
        logScale:1};



