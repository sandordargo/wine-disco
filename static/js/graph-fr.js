function clearDetails() {
    detailedNode = null;
    document.getElementById("node-type").innerHTML = "Type : Cliquez sur un noeud";
    document.getElementById("node-name").innerHTML = "Nom : Cliquez sur un noeud";
    document.getElementById("node-details").innerHTML = "Détails : Cliquez sur un nœud";
}

function updateDetails(d) {
    updateElementWithText("node-type" , "Type : " + translateType(d));
    updateElementWithText("node-name" , "Nom : " + d.caption);
    updateElementWithText("node-details" , getNodeDetails(d));
    detailedNode = d.id;
    update();
}

function translateType(node) {
    if (node.type === "WineRegion") {
        return "Vignoble";
    }
    if (node.type === "WineSubRegion") {
        return "Région viticole";
    }
    if (node.type === "Grape") {
        return "Cépage";
    }
    if (node.type === "Winery") {
        return "Cave";
    }
    return "Inconnu";
}


function getNodeDetails(node) {
  if (node.type == "WineRegion") {
    info = getJsonFrom("/data/regions/" + node.id);
    subregions = "Régions viticoles incluses : "
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
    grapes = "Cépages produits : "
    wineries = "Caves dans la région : "
    for (node_id in info["nodes"]) {
      if (info["nodes"][node_id].type == "WineRegion") {
        link = "<a href=\"javascript:detailAndExpand(getRegion(" + info["nodes"][node_id].id + "));\">" + info["nodes"][node_id].caption + "</a>"
        parent = "Vignoble : " + link;
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
    parentSubregions = "Ce cépage est produits dans les régions viticoles suicvates : "
    for (node_id in info["nodes"]) {
      if (info["nodes"][node_id].type == "WineSubRegion") {
        link = "<a href=\"javascript:detailAndExpand(getSubregion(" + info["nodes"][node_id].id + "));\">" + info["nodes"][node_id].caption + "</a>"
        parentSubregions += link + ", ";
      }
    }
    return parentSubregions.slice(0, -2);
  } else if (node.type == "Winery") {
    if (node.url === "" || node.url === null || typeof node.url === 'undefined') {
      url = "Indisponible";
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
    return "Nom : " + node.caption + "<br>Village : " + node.village + "<br>Url: " + url
        + "<br>Se situe dans le vignoble de " + parentSubregion;
  }
  return "Détails indisponibles pour ce type : " + node.type + ".";
}

