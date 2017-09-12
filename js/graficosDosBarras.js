// JavaScript source code

var margin = {top: 80, right: 0, bottom: 80, left: 85},
    w = 550,
    h = 500; 

var xScale_0 = d3.local(),
    xScale_1 = d3.local(),
    yScale = d3.local(),
    color = d3.local(),
    xAxis = d3.local(),
    yAxis = d3.local()
    length_dataset = d3.local();

var z = d3.scaleOrdinal()
    .range(["#6b486b", "#ff8c00"]);

var z2 = d3.scaleOrdinal()
    .range(["#6b486b", "#ff8c00"]);

dates1 = ["2017-01-16", "2017-01-31", "2017-06-27"];

/*

*/
function align_dataset_two(incomplete_data, complete_data, compare) {

    for(var i = 0; i < complete_data.length; i++){
        if(!contains_two_bars(complete_data[i], incomplete_data, compare))
            incomplete_data.push(complete_data[i]);
    }

    //console.log(incomplete_data);
}

/*

*/
function contains_two_bars(element, array, compare) {
    for(var i = 0; i < array.length; i++){
        if(compare(element, array[i]) == 0)
            return 1;
    }
    return 0;
}

/*

*/
function compare_two_bars(a, b) {
    var keys = Object.keys(a),
        val_a = +a[keys[2]],
        val_b = +b[keys[2]];
    if(val_a == val_b)
        return 0;
    else if(val_a < val_b)
        return -1;
    else
        return 1;
}

function compare_two_bars_inverse(a, b) {
    var keys = Object.keys(a); keys.reverse();
        val_a = +a[keys[2]],
        val_b = +b[keys[2]];
    if(val_a == val_b)
        return 0;
    else if(val_a < val_b)
        return -1;
    else
        return 1;
}

/*

*/
function set_two_bar_chart(new_dataset, info, i, fix) {
    if(i < dates1.length){
      d3.csv(info.url_name + dates1[i] + ".csv", function(data) {

        //console.log(data);
        var dataset = data;
        //console.log(data);
        if(fix != undefined)
            dataset = fix(data);

        //console.log(dataset); 
        
        for(var j = 0; j < dataset.length; j++){
            if(!contains_two_bars(dataset[j], new_dataset, info.inverse? compare_two_bars_inverse : compare_two_bars))
                new_dataset.push(dataset[j]);
        }
        set_two_bar_chart(new_dataset, info, i + 1, fix);
      });
    }
    else{
        //console.log(new_dataset);        
        for(var i = 0; i < new_dataset.length; i++) {
            var keys = Object.keys(new_dataset[i]);
            if(info.inverse) 
                keys.reverse();
            new_dataset[i][keys[2]] = +new_dataset[i][keys[2]];
            new_dataset[i][keys[1]] = 0;
            new_dataset[i][keys[0]] = 0;
        } 
        //console.log(new_dataset);
        init_two_bar_chart(new_dataset, info, fix);
    }    
}

/*

*/
function init_two_bar_chart(new_dataset, info, fix) {

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
                var tx_0 = xScale_0.set(this, d3.scaleBand()
                            .rangeRound([0, width])
                            .paddingInner(0.1)
                        );

                var tx_1 = xScale_1.set(this, d3.scaleBand()
                                .padding(0.05)
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
                    .scale(tx_0)
                    );
                yAxis.set(this, d3.axisLeft()
                    .scale(ty)
                    .ticks(5) //Número aproximado de marcadores);
                    ); 

                length_dataset.set(this, info.graf_id);
    })

    update_csv_two_bar_chart(new_dataset, "2017-01-16", 0, info, fix);
    update_csv_two_bar_chart(new_dataset, "2017-01-16", 0, info, fix);

    /* Esto permite identificar cuando ocurre un cambio del set de datos del gráfico. */ 
    d3.select(info.opt_id).on("change", function() {
        var value = d3.select(this).property("value");
        update_csv_two_bar_chart(new_dataset, value, 2000, info, fix);
    });       

}           

function update_csv_two_bar_chart(total_dataset, n, duration, info, fix) {

    var dataset = d3.csv(info.url_name + n + ".csv", 
        function (error, data) { //callback
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

            var keys = dataset.columns.slice(0, 2);
            var key_offset = dataset.columns[2];
            //console.log(dataset.columns); //["numns", "num"]      

            align_dataset_two(dataset, total_dataset, info.inverse? compare_two_bars_inverse : compare_two_bars);            

            dataset.sort(function (a, b) {return a[key_offset] - b[key_offset];})

            //console.log(dataset);
            
            //console.log(keys);
                        
            var maxValue = d3.max(dataset, function (d) { return Math.max(d[keys[0]], d[keys[1]]); });

            var tx_0, tx_1, ty, tc, ax, ay, ld;

            g.call( function(){

                //console.log(dataset.map(function(d) { return d[key_offset]; }));
                tx_0 = xScale_0.get(this).domain(dataset.map(function(d) { return d[key_offset]; }));

                tx_1 = xScale_1.get(this).domain(keys).rangeRound([0, tx_0.bandwidth()]);

                if(info.logScale)
                    ty = yScale.get(this).domain([1, maxValue]).clamp(true);
                else
                    ty = yScale.get(this).domain([0, maxValue]);

                tc = color.get(this).domain([-maxValue, maxValue]);

                ax = xAxis.get(this).scale(tx_0);

                ay = yAxis.get(this).scale(ty);
                if(info.logScale)
                    ay.tickFormat(function (d) {
                        return ty.tickFormat(4, d3.format(",d"))(d);
                    });

                ld = length_dataset.get(this);
            
            });

            //console.log(ld);

            var tp_1 = d3.tip()
                    .attr('class', 'd3-tip')
                    .offset([-10, 0])
                    .html(function(d) {
                            return "<strong> "+ info.tip_name + ":</strong> <span style='color:white'>" + d[keys[0]] + "</span>";
                    });

            var tp_2 = d3.tip()
                    .attr('class', 'd3-tip')
                    .offset([-10, 0])
                    .html(function(d) {
                            return "<strong> "+ info.tip_name + ":</strong> <span style='color:white'>" + d[keys[1]] + "</span>";
                    });

            g.call(tp_1);
            g.call(tp_2);

            var rects_1 = g.selectAll("#rect_1")
                .data(dataset);

            var rects_2 = g.selectAll("#rect_2")
                .data(dataset);

            rects_1.enter().append("rect").attr("id", "rect_1");

            rects_2.enter().append("rect").attr("id", "rect_2");

            rects_1.transition()
                  .duration(duration)
              .attr("x", function(d) { return tx_0(d[key_offset]) + tx_1(keys[0]); })
              .attr("y", function(d) { return ty(d[keys[0]]) - barPadding; })
              .attr("width", tx_1.bandwidth())
              .attr("height", function(d) { return height - ty(d[keys[0]]) + barPadding; })
              .attr("fill", function(d) { return z(keys[0]); })
                .attr("stroke-width", "1px")
                .attr("stroke", "black")
                .attr("opacity", function(d){
                    if(d[keys[0]] == 0)
                        return 0;
                    else
                        return 1;
                });

            rects_2.transition()
                  .duration(duration)
              .attr("x", function(d) { return tx_0(d[key_offset]) + tx_1(keys[1]); })
              .attr("y", function(d) { return ty(d[keys[1]]) - barPadding; })
              .attr("width", tx_1.bandwidth())
              .attr("height", function(d) { return height - ty(d[keys[1]]) + barPadding; })
              .attr("fill", function(d) { return z(keys[1]); })
                .attr("stroke-width", "1px")
                .attr("stroke", "black")
                .attr("opacity", function(d){
                    if(d[keys[1]] == 0)
                        return 0;
                    else
                        return 1;
                });

            rects_1.on('mouseover', tp_1.show)
                .on('mouseout', tp_1.hide);        

            rects_2.on('mouseover', tp_2.show)
                .on('mouseout', tp_2.hide); 

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


            var legend = g.append("g")
              .attr("font-family", "sans-serif")
              .attr("font-size", 10)
              .attr("text-anchor", "end")
                .selectAll("g")
                .data(keys.slice(0, 2).reverse())
                .enter().append("g")
                  .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

              legend.append("rect")
                  .attr("x", width - 30)
                  .attr("width", 19)
                  .attr("height", 19)
                  .attr("fill", z);

              legend.append("text")
                  .attr("x", width - 35)
                  .attr("y", 9.5)
                  .attr("dy", "0.32em")
                  .text(function(d) { return d; });

        });
}

/* 
    Esta función permite inicializar el set de datos a utilizar. 
*/
function arreglo_dataset_8(old_dataset){

    var csv_string = "",
        keys = old_dataset.columns, 
        numdomains = keys[0], //primera llave: numdomains, 
        ipsv4count = keys[2]; //segunda llave: ipsv4count
        ipsv6count = keys[3]; //cuarta llave: ipsv6count

    //console.log(old_dataset);

    var array_v4 = [],
        array_v6 = [];
    var ipcount;

    for (var i = 0; i < old_dataset.length; i++) {
        var dom_count = +old_dataset[i][numdomains];

        ip_count = old_dataset[i][ipsv4count];    
        if(array_v4[ip_count] == undefined)
            array_v4[ip_count] = dom_count;
        else
            array_v4[ip_count] += dom_count;

        ip_count = old_dataset[i][ipsv6count];
        if(array_v6[ip_count] == undefined)
            array_v6[ip_count] = dom_count;
        else
            array_v6[ip_count] += dom_count;
    }
    //console.log(array_v4);
    //console.log(array_v6);

    var new_dataset = [];
    var iv4 = 0, iv6 = 0, i = 0;
    while(i < Math.max(array_v4.length, array_v6.length)){
        var data = {numdomains_v4: array_v4[i] != undefined? array_v4[i]: 0, 
                    numdomains_v6: array_v6[i] != undefined? array_v6[i]: 0, 
                    ipscount: i};
        if(data.numdomains_v4 != 0 || data.numdomains_v6 != 0)
            new_dataset.push(data);
        i++;
    }
    new_dataset["columns"] = ["numdomains_v4", "numdomains_v6","ipscount"];

    //console.log(new_dataset);
    return new_dataset;

}
    info8 = {graf_id: "#grafico8", 
            text_id: "#text8", 
            text_name: 'Gráfico 8', 
            opt_id: "#opts8", 
            url_name: "data/countDomainsWithCountNSIps/countDomainsWithCountNSIps", 
            tip_name: "Dominios", 
            inverse: 0, 
            x_label:"Número de IPs", 
            y_label:"Cantidad de dominios", 
            logScale:1};
        
