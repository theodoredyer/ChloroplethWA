var margin = {top: 10, right: 40, bottom: 150, left: 50},
    width = 760 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;


var svg = d3.select("view")
    .append("svg")
    .attr("class", "wa-svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var path = d3.geoPath();

var color = d3.scaleThreshold()
    .domain([1, 10, 50, 200, 500, 1000, 2000, 4000])
    .range(d3.schemeOrRd[9]);

// Define the color to switch to on button press
var flipcolor = d3.scaleThreshold()
    .domain([1, 10, 50, 200, 500, 1000, 2000, 4000])
    .range(d3.schemeYlGnBu[9]);

var x = d3.scaleSqrt()
    .domain([0, 4500])
    .rangeRound([440, 950]);


d3.json("wa-topo.json").then(function(topology) {
    
    var cpath = svg.append("g")
        .selectAll("path")
        .data(topojson.feature(topology, topology.objects.tracts).features)
        .enter().append("path")
        .attr("fill", function(d) { return color(d.properties.density); })
        .attr("d", path);

    svg.append("path")
        .datum(topojson.feature(topology, topology.objects.counties))
        .attr("fill", "none")
        .attr("stroke", "#000")
        .attr("stroke-opacity", 0.3)
        .attr("d", path);
    
    var statebound = svg.append("path")
        .datum(topojson.feature(topology, topology.objects.state))
        .attr("fill", "none")
        .attr("stroke", "#000")
        .attr("stroke-opacity", 0)
        .attr("d", path);
    
    var tracbound = svg.append("path")
        .datum(topojson.feature(topology, topology.objects.tracts))
        .attr("fill", "none")
        .attr("stroke", "#000")
        .attr("stroke-opacity", 0)
        .attr("d", path);
    
    var g = svg.append("g")
        .attr("class", "key")
        .attr("transform", "translate(0,40)");
    
    var legend = g.selectAll("rect")
        .data(color.range().map(function(d) {
        d = color.invertExtent(d);
        if (d[0] == null) d[0] = x.domain()[0];
        if (d[1] == null) d[1] = x.domain()[1];
        return d;
    }))
    .enter().append("rect")
        .attr("height", 8)
        .attr("x", function(d) { return x(d[0]); })
        .attr("width", function(d) { return x(d[1]) - x(d[0]); })
        .attr("fill", function(d) { return color(d[0]); });
    
    g.append("text")
        .attr("class", "caption")
        .attr("x", x.range()[0])
        .attr("y", -6)
        .attr("fill", "#000")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text("Population per square mile");

    g.call(d3.axisBottom(x)
        .tickSize(13)
        .tickValues(color.domain()))
        .select(".domain")
        .remove();
    
    var originalColor = 1;
    var visibleSB = 1;
    var visibleTr = 1;
    
    d3.select("#colorbtn").on("click", legendColor);
    d3.select("#tractbtn").on("click", tractoggle);
    d3.select("#statebtn").on("click", statetoggle);
    
    function legendColor() {
        if(originalColor == 1) {
            legend.transition(6000).attr("fill", function(d) {
                return flipcolor(d[0]);
            });
            
            cpath.transition(10000).attr("fill", function(d) {
                return flipcolor(d.properties.density);
            })
            originalColor = 0;
        } else {
            legend.transition(6000).attr("fill", function(d) {
                return color(d[0]);
            });
            
            cpath.transition(10000).attr("fill", function(d) {
                return color(d.properties.density);
            })
            originalcolor = 1;
        }
    }
    
    function tractoggle() {
        if(visibleTr == 1) {
            tracbound.attr("stroke-opacity", 0.5);
            visibleTr = 0;
        } else {
            tracbound.attr("stroke-opacity", 0);
            visibleTr = 1;
        }
    }
    
    function statetoggle() {
        if(visibleSB == 1) {
            statebound.attr("stroke-opacity", 0.5);
            visibleSB = 0;
        } else {
            statebound.attr("stroke-opacity", 0);
            visibleSB = 1;
        }
    }
    
});