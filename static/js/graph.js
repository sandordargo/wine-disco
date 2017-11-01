width = $(window).width() / 12 * 8
height = $(window).height() / 10 * 9

var svg = d3.select("svg").attr("width", width).attr("height", height);

var color = d3.scaleOrdinal(d3.schemeCategory20);

var simulation;

function graph() {
  return getJsonFrom("/data/data");
}

var nodes;
var links;

function refreshLocalGraph() {
    var localGraph = graph();
    nodes = localGraph["nodes"];
    links = localGraph["links"];
}

function reset() {
  refreshLocalGraph();
  simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(function(edge) {
        if (edge.source.type == "WineRegion" || edge.target.type == "WineRegion" ) {
            return 25;
        } else if ((edge.source.type == "WineSubRegion" && edge.target.type == "Grape")
            || (edge.source.type == "Grape" && edge.target.type == "WineSubRegion")) {
            return 25;
        }
        return 75;
    }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));
  update();
}

function hard_reset() {
  console.info("update!")
  nodes = [];
  links = [];
  simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(function(edge) {
        if (edge.source.type == "WineRegion" || edge.target.type == "WineRegion" ) {
            return 25;
        } else if ((edge.source.type == "WineSubRegion" && edge.target.type == "Grape")
            || (edge.source.type == "Grape" && edge.target.type == "WineSubRegion")) {
            return 25;
        }
        return 75;
    }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));
  update();
}

var zoom_handler;

function update() {
  svg.selectAll("*").remove();
  links_to_display = links;
  nodes_to_display = nodes;
  
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
    .attr("fill", function(d) { 
      if (d.type == "WineSubRegion") {
        return "gray";
      }
      else if (d.type == "WineRegion") {
        return "orange";
      }
      else if (d.type == "Grape") {
        return "blue";
      }
      else if (d.type == "Winery") {
        return "yellow";
      }
      return color(d.caption); 
    });
    node.on("click", click)
    .on("contextmenu", function (d, i) {
            d3.event.preventDefault();
            doubleclick(d)
        });

    node.call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));
  
  node.append("title")
      .attr("title", function(d) { return d.type + ": " + d.caption; })
      .text(function(d) { return d.type + ": " + d.caption + " expanded: " + d.expanded + " id: " + d.id; });

  simulation
    .nodes(nodes_to_display)
    .on("tick", ticked).force("link")
    .links(links_to_display);

  zoom_handler = d3.zoom().on("zoom", zoom_actions);

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


function zoomInClick() {
  zoom_handler.scaleBy(svg, 1.2);
};


function zoomOutClick() {
  zoom_handler.scaleBy(svg, 0.8);
};

function reCenter() {
  update();
};

function click(d)
{
    expandNode(d);
}

function doubleclick(d)
{
    document.getElementById("node-type").innerHTML = "Type: " + d.type;
    document.getElementById("node-name").innerHTML = "Name: " + d.caption;
    document.getElementById("node-expanded").innerHTML = "Expanded: " + d.expanded;
    document.getElementById("node-details").innerHTML = "Node details: " + getNodeDetails(d);
}


function getGrape(id) {
    info = getJsonFrom("/data/subregions_of_grape/" + id);
    for (node in info["nodes"]) {
        if (info["nodes"][node].id == id) {
            return info["nodes"][node];
        }
    }
}

function getRegion(id) {
    info = getJsonFrom("/data/regions/" + id);
    for (node in info["nodes"]) {
        if (info["nodes"][node].id == id) {
            return info["nodes"][node];
        }
    }
}

function getSubregion(id) {
    info = getJsonFrom("/data/subregion_with_grapes_and_parent_and_wineries/" + id);
    for (node in info["nodes"]) {
        if (info["nodes"][node].id == id) {
            return info["nodes"][node];
        }
    }
}

function getNodeDetails(node) {
  if (node.type == "WineRegion") {
    info = getJsonFrom("/data/regions/" + node.id);
    subregions = "<br>Subregions included: "
    for (node_id in info["nodes"]) {
      if (info["nodes"][node_id].type == "WineSubRegion") {
        link = "<a href=\"javascript:doubleclick(getSubregion(" + info["nodes"][node_id].id + "));\">" + info["nodes"][node_id].caption + "</a>"
        subregions += link + ", ";
      }
    }
    return subregions.slice(0, -2);
  } else if (node.type == "WineSubRegion") {
    info = getJsonFrom("/data/subregion_with_grapes_and_parent_and_wineries/" + node.id);
    parent = ""
    grapes = "Grapes produced: "
    wineries = "Wineries in subregion: "
    for (node_id in info["nodes"]) {
      if (info["nodes"][node_id].type == "WineRegion") {
        link = "<a href=\"javascript:doubleclick(getRegion(" + info["nodes"][node_id].id + "));\">" + info["nodes"][node_id].caption + "</a>"
        parent = "<br>Parent region: " + link;
      } else if (info["nodes"][node_id].type == "Grape") {
        link = "<a href=\"javascript:doubleclick(getGrape(" + info["nodes"][node_id].id + "));\">" + info["nodes"][node_id].caption + "</a>"
        grapes += link + ", ";
      } else if (info["nodes"][node_id].type == "Winery") {
        wineries += info["nodes"][node_id].caption + ", ";
      }
    }
    return parent + "<br>" + grapes.slice(0, -2) + "<br>" + wineries.slice(0, -2);
  } else if (node.type == "Grape") {
    info = getJsonFrom("/data/subregions_of_grape/" + node.id);
    parentSubregions = "This grape is procuded at: "
    for (node_id in info["nodes"]) {
      if (info["nodes"][node_id].type == "WineSubRegion") {
        link = "<a href=\"javascript:doubleclick(getSubregion(" + info["nodes"][node_id].id + "));\">" + info["nodes"][node_id].caption + "</a>"
        parentSubregions += link + ", ";
      }
    }
    return parentSubregions.slice(0, -2);
  } else if (node.type == "Winery") {
    var url;
    console.info(node.url)
    console.info(typeof(node.url))
    if (node.url === "" || node.url === null || typeof node.url === 'undefined') {
      url = "Not available";
    } else {
      url = "<a href=\"" + node.url + "\">" + node.url + "</a>";
    }
    return "<br>Name: " + node.caption + "<br>Village: " + node.village + "<br>Url: " + url;
  }
  return "no details for nodes with type of " + node.type;
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
  if (d.type == "WineRegion" && (d.expanded == "false" || d.expanded == false)) {
      needed = getJsonFrom("/data/regions/" + d.id);
      genericExpand(d, needed["nodes"], needed["links"]);
  } else if (d.type == "WineSubRegion" && (d.expanded == "false" || d.expanded == false)) {
      needed = getJsonFrom("/data/subregion_with_grapes_and_parent_and_wineries/" + d.id);
      genericExpand(d, needed["nodes"], needed["links"]);
  } else if (d.type == "Grape" && (d.expanded == "false" || d.expanded == false)) {
    needed = getJsonFrom("/data/subregions_of_grape/" + d.id);
    genericExpand(d, needed["nodes"], needed["links"]);
  } else if (d.expanded == true || d.expanded == "true") {
    collapseNode(d);  
  }
};

function genericExpand(d, new_nodes, new_links) {
  mergeNodes(new_nodes);
  mergeLinks(new_links);
  d.expanded = true;
  update();
}

function collapseNode(node) {
  if (node.type == "WineSubRegion") {
    to_clean_up = getJsonFrom("/data/subregion_with_grapes_and_parent_and_wineries/" + node.id);
  } else if (node.type == "Grape") {
    to_clean_up = getJsonFrom("/data/subregions_of_grape/" + node.id);
  } else if (node.type == "WineRegion") {
    to_clean_up = getJsonFrom("/data/regions/" + node.id);
  }
  genericCollapse(node, to_clean_up["nodes"], to_clean_up["links"], node.type)
};

function genericCollapse(node, nodes_to_remove, links_to_remove, node_type) {
  for (a_node_to_remove in nodes_to_remove) {
    for (a_shown_node in nodes) {
      if (nodes[a_shown_node].id == nodes_to_remove[a_node_to_remove].id 
          && nodes_to_remove[a_node_to_remove].type != node_type 
          && !isLinkedToMoreThanOne(nodes_to_remove[a_node_to_remove])) {
        nodes.splice(a_shown_node, 1);
      }
    }
  }

  links = filterArray(links, links_to_remove);

  node.expanded = false;
  update();
}

function filterArray(source, filter) {
    var temp = [], i, result = [];
    
    for (i = 0; i < filter.length; i++) {
        temp.push(filter[i].source + "-" + filter[i].target);
        console.info(temp[filter[i]])
    }

    for (i = 0; i < source.length; i++) {
        id = source[i].source.id + "-" + source[i].target.id ;
        if (temp.indexOf(id) == -1) {
            result.push(source[i]);
        }
    }
    return result;
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


document.getElementById("wineRegions").onchange = function()
{
  addItemFrom("/data/regions/" + this.value, this.value);
};

document.getElementById("wineSubregions").onchange = function()
{
  addItemFrom("/data/subregion_with_grapes_and_parent_and_wineries/" + this.value, this.value);
};

document.getElementById("grapes").onchange = function()
{
  addItemFrom("/data/subregions_of_grape/" + this.value, this.value);
};

function addItemFrom(uri, id)
{
  needed = getJsonFrom(uri);
   for (node in needed["nodes"]) {
     if (needed["nodes"][node].id == id) {
        needed["nodes"][node].expanded = true;
     }
   }
  mergeNodes(needed["nodes"]);
  mergeLinks(needed["links"]);
  update();
}

function mergeNodes(new_nodes) {
  for (new_node in new_nodes) {

    var already_there = false;
    for (node in nodes) {
      if (nodes[node].id == new_nodes[new_node].id) {
        already_there = true;
        break;
      } 
    }

    if (!already_there) {
        nodes.push(new_nodes[new_node]);
    }
  }
}

function mergeLinks(new_links)   {
  for (new_link in new_links) {
    var already_there = false;
    for (link in links) {
      if (links[link].source == new_links[new_link].source && links[link].target == new_links[new_link].target) {
        already_there = true;
        break;
      } 
    }

    if (!already_there) {
        links.push(new_links[new_link]);
    }
  }
}
