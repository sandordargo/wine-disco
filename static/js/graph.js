width = $(window).width() / 12 * 10
height = $(window).height() / 10 * 9

var svg = d3.select("svg").attr("width", width).attr("height", height);

var color = d3.scaleOrdinal(d3.schemeCategory20);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

function graph() {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", "/data/data", false ); // false for synchronous request
    xmlHttp.send( null );
    return JSON.parse(xmlHttp.responseText);
}

var nodes = graph()["nodes"]
var links = graph()["links"]

function update(nodes_to_add, links_to_add) {
  svg.selectAll("*").remove();
  
  if (links_to_add == links) { 
    links_to_display = links_to_add 
  } else {
    links_to_display = links_to_add.concat(links);
  }
  
  if (nodes_to_add == nodes) { 
    nodes_to_display = nodes_to_add 
  } else {
    nodes_to_display = nodes_to_add.concat(nodes);
  }

  var link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(links_to_display)
    .enter().append("line")
    .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

  var node = svg.append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(nodes_to_display)
    .enter().append("circle")
    .attr("r", 8)
    .attr("fill", function(d) { return color(d.caption); })
    .on("click", click)
    .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

  node.append("title")
      .attr("title", function(d) { return d.type + ": " + d.caption; })
      .text(function(d) { return d.type + ": " + d.caption; });

  simulation
    .nodes(nodes_to_display)
    .on("tick", ticked);

  simulation.force("link")
      .links(links_to_display);

function ticked(d) {
  link
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  node
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
  }
};

function click(d)
{
    expandNode(d)
}


function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}

function expandNode(d) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( "GET", "/data/grapes_at_subregion/" + d.id, false ); // false for synchronous request
  xmlHttp.send( null );
  needed = JSON.parse(xmlHttp.responseText);

  new_nodes = needed["nodes"]
  console.info(new_nodes)
  for (node in new_nodes) {
    if (new_nodes[node].id == d.id) new_nodes.splice(node, 1)
  }
  new_links = needed["links"]
  update(new_nodes, new_links)
}
