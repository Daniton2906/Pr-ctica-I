var partition = d3.layout.partition().value(function(d) { return d.size; });

/* Permite seleccionar donde posicionar el texto en la página web. */
var svgraf1 = d3.select("#text1");

/* Se realiza la obtención de los datos. */
d3.json("descrip.json", function(text) {

	/* Permite particionar los datos en nodos. */
	var g1 = partition.nodes(text);			

	/* Se busca el nodo correspondiente al gráfico que se desea definir. */
	g1.forEach(function(d){
		if(d.name=='Gráfico 1'){
			
			/* Se adhiere el texto a la página web. */
			d.children.forEach(function(h){
				svgraf1.append("p")
				.attr("align","justify")
				.style("text-anchor","end")
				.text(h.size);
			});
		};
	});

})
