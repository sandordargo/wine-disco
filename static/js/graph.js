width = $(window).width() / 12 * 10
height = $(window).height() / 10 * 9

var svg = d3.select("svg").attr("width", width).attr("height", height);

var color = d3.scaleOrdinal(d3.schemeCategory20);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

function graph() {
  return getJsonFrom("/data/data");
}

var nodes = graph()["nodes"]
var links = graph()["links"]

function update() {
  svg.selectAll("*").remove();
  links_to_display = links
  nodes_to_display = nodes
  
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
      .text(function(d) { return d.type + ": " + d.caption + " expanded: " + d.expanded + " id: " + d.id; });

  simulation
    .nodes(nodes_to_display)
    .on("tick", ticked);

  simulation.force("link")
      .links(links_to_display);


  var zoom_handler = d3.zoom().on("zoom", zoom_actions);

  function zoom_actions(){
   node.attr("transform", d3.event.transform);
   link.attr("transform", d3.event.transform);
  }

  zoom_handler(svg);

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
  if (d.type == "WineSubRegion" && (d.expanded == "false" || d.expanded == false)) {
      needed = getJsonFrom("/data/grapes_at_subregion/" + d.id)

      new_nodes = needed["nodes"]
  
      for (node in new_nodes) {
        if (new_nodes[node].id == d.id) {
          new_nodes.splice(node, 1)
          break;
        }

      }

      var i = 0;
      var stop = false

      while (i < new_nodes.length) {
        for (node in new_nodes) {
          for (old_node in nodes) {
            if (new_nodes[node].id == nodes[old_node].id) {
              new_nodes.splice(node, 1)
              stop = true
              console.info('sliced')
              break
            }
          }
        }
        i++;
        if (stop == true) break;
      }

      nodes = nodes.concat(new_nodes)
      new_links = needed["links"]
      links  = links.concat(new_links)
      d.expanded = true;
      if (new_links.length > 0 || new_nodes.length > 0) {
        console.info("update")
        update()
      }
  } else if (d.type == "Grape" && (d.expanded == "false" || d.expanded == false)) {
    needed = getJsonFrom("/data/subregions_of_grape/" + d.id)

      new_nodes = needed["nodes"]
  
      for (node in new_nodes) {
        if (new_nodes[node].id == d.id) {
          console.info("not adding twice" + new_nodes[node].caption)
          new_nodes.splice(node, 1)
          
        }

      }

      var i = 0;
      var stop = false

      while (i <= new_nodes.length + 1) {
        for (node in new_nodes) {
          for (old_node in nodes) {
            console.info(node)
            if (new_nodes[node].id == nodes[old_node].id) {
              console.info("not adding twice" + new_nodes[node].caption)
              new_nodes.splice(node, 1);
              stop = true;
              
              console.info('sliced');
              break;
            } else {
              console.info("adding " + new_nodes[node].caption);
            }
          }
        }
        i++;
        // if (stop == true) break;
      }

      for (n in new_nodes) {
        console.info(new_nodes[n])  
      }
      
      nodes = nodes.concat(new_nodes)
      new_links = needed["links"]
      links  = links.concat(new_links)
      d.expanded = true;
      if (new_links.length > 0 || new_nodes.length > 0) {
        console.info("update")
        update()
      }
  } else if (d.expanded == true) {
    collapseNode(d);  
  }

};

function collapseNode(node) {
  if (node.type == "WineSubRegion") {
    to_clean_up = getJsonFrom("/data/grapes_at_subregion/" + node.id);
    nodes_to_remove = to_clean_up["nodes"]

    for (a_node_to_remove in nodes_to_remove) {
      for (a_shown_node in nodes) {
        if (nodes[a_shown_node].id == nodes_to_remove[a_node_to_remove].id 
          && nodes_to_remove[a_node_to_remove].type != "WineSubRegion" 
          && !isLinkedToMoreThanOne(nodes_to_remove[a_node_to_remove])) {
          nodes.splice(a_shown_node, 1);
        }
      }
    }

    links_to_remove = to_clean_up["links"];
    links = filterArray(links, links_to_remove);

    node.expanded = false;
    update();
  } else if (node.type == "Grape") {
    to_clean_up = getJsonFrom("/data/subregions_of_grape/" + node.id);
    nodes_to_remove = to_clean_up["nodes"]

    for (a_node_to_remove in nodes_to_remove) {
      for (a_shown_node in nodes) {
        if (nodes[a_shown_node].id == nodes_to_remove[a_node_to_remove].id 
          && nodes_to_remove[a_node_to_remove].type != "Grape" 
          && !isLinkedToMoreThanOne(nodes_to_remove[a_node_to_remove])) {
          nodes.splice(a_shown_node, 1);
        }
      }
    }

    links_to_remove = to_clean_up["links"];
    links = filterArray(links, links_to_remove);

    node.expanded = false;
    update();
  }
};

function filterArray(source, filter) {
    var temp = [], i, result = [];
    
    for (i = 0; i < filter.length; i++) {
        temp.push(filter[i].source + "-" + filter[i].target);
        console.info(temp[filter[i]])
    }

    console.info(temp)

    for (i = 0; i < source.length; i++) {
        id = source[i].source.id + "-" + source[i].target.id ;
        console.info(id);
        if (temp.indexOf(id) == -1) {
            console.info(id + " is not in temp");
            result.push(source[i]);
        } else {
          console.info(id + " is removed");
        }
    }
    return(result);
}

function isLinkedToMoreThanOne(node) {
  var counter = 0;
  for (link_position in links) {
    if (links[link_position].source.id == node.id || links[link_position].target.id == node.id) {
      counter += 1;
    }
  }
  return counter > 1;
}

function getJsonFrom(uri) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", uri, false ); // false for synchronous request
  xmlHttp.send(null);
  return JSON.parse(xmlHttp.responseText);
}