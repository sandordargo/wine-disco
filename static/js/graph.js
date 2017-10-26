width = $(window).width() / 12 * 8
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

function reset() {
  console.info("update!")
  nodes = graph()["nodes"];
  links = graph()["links"];
  simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));
  update();
}

function hard_reset() {
  console.info("update!")
  nodes = [];
  links = [];
  simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));
  update();
}
var zoom_handler;


function clickcancel() {
  var event = d3.dispatch('click', 'dblclick');

  function cc(selection) {
    var down,
      tolerance = 5,
      last,
      wait = null;
    // euclidean distance
    function dist(a, b) {
      return Math.sqrt(Math.pow(a[0] - b[0], 2), Math.pow(a[1] - b[1], 2));
    }
    selection.on('mousedown', function() {
      down = d3.mouse(document.body);
      last = +new Date();
    });
    selection.on('mouseup', function() {
      if (dist(down, d3.mouse(document.body)) > tolerance) {
        return;
      } else {
        if (wait) {
          window.clearTimeout(wait);
          wait = null;
          event.call('dblclick', d3.event);
        } else {
          wait = window.setTimeout((function(e) {
            return function() {
              event.call('click', e);
              wait = null;
            };
          })(d3.event), 300);
        }
      }
    });
    // selection.on('start', function() {dragstarted(this)});
    //     .on("drag", dragged)
    //     .on("end", dragended));
  };
  cc.on = function() {
    var value = event.on.apply(event, arguments);
    return value === event ? cc : value;
  };
  return cc;
}

function update() {
  console.info("update!")
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
    .on("tick", ticked);

  simulation.force("link")
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
  console.info("center");
  // simulation = d3.forceSimulation()
  //   .force("link", d3.forceLink().id(function(d) { return d.id; }))
  //   .force("charge", d3.forceManyBody())
  //   // .force("gravity", 1)
  //   .force("center", d3.forceCenter(width / 2, height / 2));
  update();
  // simulation = d3.forceSimulation()
  //   .force("link", d3.forceLink().id(function(d) { return d.id; }))
  //   .force("charge", d3.forceManyBody())
  //   .force("center", d3.forceCenter(width / 2, height / 2));
};

function click(d)
{
    expandNode(d)

}

function doubleclick(d)
{
    document.getElementById("node-type").innerHTML = "Type: " + d.type;
    document.getElementById("node-name").innerHTML = "Name: " + d.caption;
    document.getElementById("node-expanded").innerHTML = "Expanded: " + d.expanded;
    document.getElementById("node-details").innerHTML = "Node details: " + getNodeDetails(d);
}

function getNodeDetails(node) {
  if (node.type == "WineRegion") {
    info = getJsonFrom("/data/regions/" + node.id);
    subregions = "Subregions included: "
    for (node in info["nodes"]) {
      if (info["nodes"][node].type == "WineSubRegion") {
        subregions += info["nodes"][node].caption + ", ";
      }

    }
    return subregions.slice(0, -2);

  } else if (node.type == "WineSubRegion") {
    info = getJsonFrom("/data/subregion_with_grapes_and_parent/" + node.id);
    parent = ""
    grapes = "Grapes produced: "
    for (node in info["nodes"]) {
      if (info["nodes"][node].type == "WineRegion") {
        parent = "\r\nParent region: " + info["nodes"][node].caption;
      } else if (info["nodes"][node].type == "Grape") {
        grapes += info["nodes"][node].caption + ", ";
      }

    }

    return (parent + "\r\n" + grapes).slice(0, -2);
  } else if (node.type == "Grape") {
    info = getJsonFrom("/data/subregions_of_grape/" + node.id);
    parentSubregions = "This grape is procuded at: "
    for (node in info["nodes"]) {
      if (info["nodes"][node].type == "WineSubRegion") {
        parentSubregions += info["nodes"][node].caption + ", ";
      }

    }

    return parentSubregions.slice(0, -2);
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
      //needed = getJsonFrom("/data/grapes_at_subregion/" + d.id);
      needed = getJsonFrom("/data/regions/" + d.id);
      genericExpand(d, needed["nodes"], needed["links"]);
  } else if (d.type == "WineSubRegion" && (d.expanded == "false" || d.expanded == false)) {
      //needed = getJsonFrom("/data/grapes_at_subregion/" + d.id);
      needed = getJsonFrom("/data/subregion_with_grapes_and_parent/" + d.id);
      genericExpand(d, needed["nodes"], needed["links"]);
  } else if (d.type == "Grape" && (d.expanded == "false" || d.expanded == false)) {
    needed = getJsonFrom("/data/subregions_of_grape/" + d.id);
    genericExpand(d, needed["nodes"], needed["links"])
      
  } else if (d.expanded == true || d.expanded == "true") {
    collapseNode(d);  
  }

};

function genericExpand(d, new_nodes, new_links) {
  //remove node to expand from new_nodes
  for (node in new_nodes) {
    console.info(new_nodes[node])
    if (new_nodes[node].id == d.id) {
      new_nodes.splice(node, 1);
      console.info(new_nodes[node])
    }
  }

  //do not add a node the second time that is already displayed
  var i = 0;
  var stop = false
  while (i <= new_nodes.length + 1) {
    for (node in new_nodes) {
      for (old_node in nodes) {
        if (new_nodes[node].id == nodes[old_node].id) {
          new_nodes.splice(node, 1);
          stop = true;
          break;
        } 
      }
    }
    i++;
  }

  nodes = nodes.concat(new_nodes)
  links  = links.concat(new_links)
  d.expanded = true;
  if (new_links.length > 0 || new_nodes.length > 0) {
    update();
  }
  update();
}

function collapseNode(node) {
  if (node.type == "WineSubRegion") {
    to_clean_up = getJsonFrom("/data/subregion_with_grapes_and_parent/" + node.id);
    genericCollapse(node, to_clean_up["nodes"], to_clean_up["links"], "WineSubRegion")
  } else if (node.type == "Grape") {
    to_clean_up = getJsonFrom("/data/subregions_of_grape/" + node.id);
    genericCollapse(node, to_clean_up["nodes"], to_clean_up["links"], "Grape")
  } else if (node.type == "WineRegion") {
    to_clean_up = getJsonFrom("/data/regions/" + node.id);
    genericCollapse(node, to_clean_up["nodes"], to_clean_up["links"], "Grape")
  }
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


document.getElementById("wineRegions").onchange = function()
{
  addItemFrom("/data/regions/" + this.value);
};

document.getElementById("wineSubregions").onchange = function()
{
  addItemFrom("/data/subregion_with_grapes_and_parent/" + this.value);
};

document.getElementById("grapes").onchange = function()
{
  addItemFrom("/data/subregions_of_grape/" + this.value);
};

function addItemFrom(uri)
{
  needed = getJsonFrom(uri);
  // for (node in needed["nodes"]) {
  //   needed["nodes"][node].expanded = true;
  // }
  mergeNodes(needed["nodes"]);
  mergeLinks(needed["links"]);
  update();
}

function mergeNodes(new_nodes) {
  for (new_node in new_nodes) {

    already_there = false;
    for (node in nodes) {
      if (nodes[node].id == new_nodes[new_node].id) {
        already_there = true
      } 
    }

    if (!already_there) {
        nodes.push(new_nodes[new_node]);
    }
  }
}

function mergeLinks(new_links)   {
  for (new_link in new_links) {
    already_there = false;
    for (link in links) {
      if (links[link].source == new_links[new_link].source && links[link].target == new_links[new_link].target) {
        already_there = true
      } 
    }

    if (!already_there) {
        links.push(new_links[new_link]);
    }
  }
}
