width = $(window).width() / 12 * 8;
height = $(window).height() / 10 * 9;

//width = $("body").width() / 12 * 8
//height = $("body").height() / 10 * 9

var svg = d3.select("svg").attr("width", width).attr("height", height)
    .attr("preserveAspectRatio", "xMinYMin meet")
   .attr("viewBox", "0 0 " + width + " " + height)
   //class to make it responsive
   .classed("svg-content-responsive", true);
var color = d3.scaleOrdinal(d3.schemeCategory20);
var simulation;
var nodes;
var links;
var zoom_handler;
var detailedNode = null;

function graph() {
  return getJsonFrom("/data/data");
}

function refreshLocalGraph() {
    var freshGraphFromDb = graph();
    nodes = freshGraphFromDb["nodes"];
    links = freshGraphFromDb["links"];
}

function reset() {
  refreshLocalGraph();
  resetView();
}

function hard_reset() {
  nodes = [];
  links = [];
  resetView();
}

function resetView() {
  simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; })
    .distance(function(edge) {
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
  clearDetails();
  update(-20);
}

function clearDetails() {
    detailedNode = null;
    document.getElementById("node-type").innerHTML = "Type: Click on a node";
    document.getElementById("node-name").innerHTML = "Name: Click on a node";
    document.getElementById("node-expanded").innerHTML = "Expanded: Click on a node";
    document.getElementById("node-details").innerHTML = "Node details: Click on a node";
}

function update(strength = -5) {
  svg.selectAll("*").remove();
  links_to_display = links;
  nodes_to_display = nodes;

  var elem = svg.selectAll("circle").data(nodes_to_display);
  var elemEnter = elem.enter().append("g");

  var node = elemEnter
    .append("circle")
    .attr("r", function(d) {
        radius = 8;
        d.radius = radius;
        return radius;
    })
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
      return "black";
    })
    .style("stroke", function(d) {
        if (d.id == detailedNode) {
            return "red";
        }
        return "none";
    });

  node
    .on("click", expandNode)
    .on("contextmenu", function (d, i) {
        d3.event.preventDefault();
        updateDetails(d)
    });

  node.call(d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended));
  
  node.append("title")
      .attr("title", function(d) { return d.type + ": " + d.caption; })
      .text(function(d) {
        return d.type + ": " + d.caption + " expanded: " + d.expanded + " id: " + d.id;
      });

  var link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(links_to_display)
    .enter().append("line");


  simulation
    .nodes(nodes_to_display)
    .force("charge", d3.forceManyBody().strength(strength))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(function(d) {
    return d.radius
  }))
    .on("tick", ticked)
    .force("link")
    .links(links_to_display);
  simulation.alpha(1).restart();

  zoom_handler = d3.zoom().on("zoom", zoom_actions);

  function zoom_actions(){
   node.attr("transform", d3.event.transform);
   link.attr("transform", d3.event.transform);
  }

  zoom_handler(svg);

  function ticked(d) {
    link
        .attr("x1", function(d) {
        return d.source.x;
        })
        .attr("y1", function(d) {
        return d.source.y;
        })
        .attr("x2", function(d) {
        return d.target.x;
        })
        .attr("y2", function(d) {
        return d.target.y;
        });
    node
        .attr("cx", function(d) {
        return d.x;
        })
        .attr("cy", function(d) {
        return d.y;
        });
  }
};

function zoomInClick() {
  zoom_handler.scaleBy(svg, 1.2);
};

function zoomOutClick() {
  zoom_handler.scaleBy(svg, 0.8);
};

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

function detailAndExpand(d) {
    expandNode(d);
    updateDetails(d);
    update();
}

function updateDetails(d) {
    updateElementWithText("node-type" , "Type: " + d.type);
    updateElementWithText("node-name" , "Name: " + d.caption);
    updateElementWithText("node-expanded" , "Expanded: " + d.expanded);
    updateElementWithText("node-details" , getNodeDetails(d));
    detailedNode = d.id;
    update();
}

function updateElementWithText(elementName, text) {
    document.getElementById(elementName).innerHTML = text;
}

function getGrape(id) {
    return searchNodeInArray(getJsonFrom("/data/subregions_of_grape/" + id)["nodes"], id);
}

function getRegion(id) {
    return searchNodeInArray(getJsonFrom("/data/regions/" + id)["nodes"], id);
}

function getSubregion(id) {
    return searchNodeInArray(getJsonFrom("/data/subregion_with_grapes_and_parent_and_wineries/" + id)["nodes"], id);
}

function getWinery(id) {
    return searchNodeInArray(getJsonFrom("/data/winery_and_subregion/" + id)["nodes"], id);
}

function searchNodeInArray(array, id) {
    for (node_id in array) {
        if (array[node_id].id == id) {
            return array[node_id];
        }
    }
}

function getNodeDetails(node) {
  if (node.type == "WineRegion") {
    info = getJsonFrom("/data/regions/" + node.id);
    subregions = "Subregions included: "
    for (node_id in info["nodes"]) {
      if (info["nodes"][node_id].type == "WineSubRegion") {
        link = "<a href=\"javascript:detailAndExpand(getSubregion(" + info["nodes"][node_id].id + "));\">" + info["nodes"][node_id].caption + "</a>"
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
        link = "<a href=\"javascript:detailAndExpand(getRegion(" + info["nodes"][node_id].id + "));\">" + info["nodes"][node_id].caption + "</a>"
        parent = "Parent region: " + link;
      } else if (info["nodes"][node_id].type == "Grape") {
        link = "<a href=\"javascript:detailAndExpand(getGrape(" + info["nodes"][node_id].id + "));\">" + info["nodes"][node_id].caption + "</a>"
        grapes += link + ", ";
      } else if (info["nodes"][node_id].type == "Winery") {
        link = "<a href=\"javascript:detailAndExpand(getWinery(" + info["nodes"][node_id].id + "));\">" + info["nodes"][node_id].caption + "</a>"
        wineries += link + ", ";
      }
    }
    return parent + "<br>" + grapes.slice(0, -2) + "<br>" + wineries.slice(0, -2);
  } else if (node.type == "Grape") {
    info = getJsonFrom("/data/subregions_of_grape/" + node.id);
    parentSubregions = "This grape is procuded at: "
    for (node_id in info["nodes"]) {
      if (info["nodes"][node_id].type == "WineSubRegion") {
        link = "<a href=\"javascript:detailAndExpand(getSubregion(" + info["nodes"][node_id].id + "));\">" + info["nodes"][node_id].caption + "</a>"
        parentSubregions += link + ", ";
      }
    }
    return parentSubregions.slice(0, -2);
  } else if (node.type == "Winery") {
    if (node.url === "" || node.url === null || typeof node.url === 'undefined') {
      url = "Not available";
    } else {
      url = "<a href=\"" + node.url + "\" target=\"_blank\">" + node.url + "</a>";
    }
    info = getJsonFrom("/data/winery_and_subregion/" + node.id);
    for (node_id in info["nodes"]) {
      if (info["nodes"][node_id].type == "WineSubRegion") {
        link = "<a href=\"javascript:detailAndExpand(getSubregion(" + info["nodes"][node_id].id + "));\">" + info["nodes"][node_id].caption + "</a>"
        parentSubregion = link;
      }
    }
    return "Name: " + node.caption + "<br>Village: " + node.village + "<br>Url: " + url
        + "<br>Is located at the subregion of " + parentSubregion;
  }
  return "no details for nodes with type of " + node.type;
}

function expandNode(d) {
  if (d.type == "WineRegion" && nodeIsCollapsed(d)) {
      needed = getJsonFrom("/data/regions/" + d.id);
      genericExpand(d, needed["nodes"], needed["links"]);
  } else if (d.type == "WineSubRegion" && nodeIsCollapsed(d)) {
      needed = getJsonFrom("/data/subregion_with_grapes_and_parent_and_wineries/" + d.id);
      genericExpand(d, needed["nodes"], needed["links"]);
  } else if (d.type == "Grape" && nodeIsCollapsed(d)) {
    needed = getJsonFrom("/data/subregions_of_grape/" + d.id);
    genericExpand(d, needed["nodes"], needed["links"]);
  } else if (d.type == "Winery" && nodeIsCollapsed(d)) {
    needed = getJsonFrom("/data/winery_and_subregion/" + d.id);
    genericExpand(d, needed["nodes"], needed["links"]);
  } else if (!nodeIsCollapsed(d)) {
    collapseNode(d);
  }
}

function nodeIsCollapsed(node) {
    return node.expanded == "false" || node.expanded == false;
}

function genericExpand(d, new_nodes, new_links) {
  mergeNodes(new_nodes);
  mergeLinks(new_links);
  for (id in nodes) {
    if (nodes[id].id == d.id) {
        nodes[id].expanded = true;
        break;
    }
  }
  update();
}

function collapseNode(node) {
  if (node.type == "WineSubRegion") {
    to_clean_up = getJsonFrom("/data/subregion_with_grapes_and_parent_and_wineries/" + node.id);
  } else if (node.type == "Grape") {
    to_clean_up = getJsonFrom("/data/subregions_of_grape/" + node.id);
  } else if (node.type == "WineRegion") {
    to_clean_up = getJsonFrom("/data/regions/" + node.id);
  } else if (node.type == "Winery") {
    to_clean_up = getJsonFrom("/data/winery_and_subregion/" + node.id);
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
    var temp = [];
    var result = [];
    
    for (i in filter) {
        temp.push(filter[i].source + "-" + filter[i].target);
    }

    for (i in source) {
        id = source[i].source.id + "-" + source[i].target.id ;
        if (temp.indexOf(id) == -1) {
            result.push(source[i]);
        }
    }
    return result;
}

function isLinkedToMoreThanOne(node) {
  var counter = 0;
  for (i in links) {
    if (links[i].source.id == node.id
        || links[i].target.id == node.id) {
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

function addRegion(id)
{
  addItemFromAndUpdateDetails("/data/regions/" + id, id);
}

function addSubregion(id)
{
  addItemFromAndUpdateDetails("/data/subregion_with_grapes_and_parent_and_wineries/" + id, id);
}

function addGrape(id)
{
  addItemFromAndUpdateDetails("/data/subregions_of_grape/" + id, id);
}

function addItemFromAndUpdateDetails(uri, id)
{
  needed = getJsonFrom(uri);
  for (node in needed["nodes"]) {
    if (needed["nodes"][node].id == id) {
      needed["nodes"][node].expanded = true;
      updateDetails(needed["nodes"][node]);
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
      if (
           (links[link].source == new_links[new_link].source && links[link].target == new_links[new_link].target)
           || (links[link].source == new_links[new_link].target && links[link].target == new_links[new_link].source)
         )
            {
        already_there = true;
        break;
      } 
    }

    if (!already_there) {
        links.push(new_links[new_link]);
    }
  }
}

function keep_only_selected() {
    if (detailedNode == null) {
        alert("No node is selected!");
        return;
    }
    node_to_keep = searchNodeInArray(nodes, detailedNode);
    node_to_keep.expanded = false;
    links = [];
    nodes = [];
    nodes.push(node_to_keep);
    detailAndExpand(nodes[0])
}
