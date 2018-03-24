function clearDetails() {
    detailedNode = null;
    document.getElementById("node-type").innerHTML = "Type: Click on a node";
    document.getElementById("node-name").innerHTML = "Name: Click on a node";
    document.getElementById("node-expanded").innerHTML = "Expanded: Click on a node";
    document.getElementById("node-details").innerHTML = "Node details: Click on a node";
}

function updateDetails(d) {
    updateElementWithText("node-type" , "Type: " + d.type);
    updateElementWithText("node-name" , "Name: " + d.caption);
    updateElementWithText("node-expanded" , "Expanded: " + d.expanded);
    updateElementWithText("node-details" , getNodeDetails(d));
    detailedNode = d.id;
    update();
}


function translateType(node) {
    return node.type;
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
