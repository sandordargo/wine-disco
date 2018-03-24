function clearDetails() {
    detailedNode = null;
    document.getElementById("node-type").innerHTML = "Típus: válasszon ki egy csomópontot!";
    document.getElementById("node-name").innerHTML = "Név: válasszon ki egy csomópontot!";
    document.getElementById("node-details").innerHTML = "Részletek: válasszon ki egy csomópontot!";
}

function updateDetails(d) {
    updateElementWithText("node-type" , "Típus: " + translateType(d));
    updateElementWithText("node-name" , "Név: " + d.caption);
    updateElementWithText("node-details" , getNodeDetails(d));
    detailedNode = d.id;
    update();
}

function translateType(node) {
    if (node.type === "WineRegion") {
        return "Borrégió";
    }
    if (node.type === "WineSubRegion") {
        return "Borvidék";
    }
    if (node.type === "Grape") {
        return "Szőlő";
    }
    if (node.type === "Winery") {
        return "Borászat";
    }
    return "Ismeretlen";
}


function getNodeDetails(node) {
  if (node.type == "WineRegion") {
    info = getJsonFrom("/data/regions/" + node.id);
    subregions = "Itt található borvidékek: "
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
    grapes = "Termelt szőlőfajták: "
    wineries = "Itt található borászatok: "
    for (node_id in info["nodes"]) {
      if (info["nodes"][node_id].type == "WineRegion") {
        link = "<a href=\"javascript:detailAndExpand(getRegion(" + info["nodes"][node_id].id + "));\">" + info["nodes"][node_id].caption + "</a>"
        parent = "Az alábbi borrégió része: " + link;
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
    parentSubregions = "Ezt a szőlőlfajtát a következő borvidékeken termelik: "
    for (node_id in info["nodes"]) {
      if (info["nodes"][node_id].type == "WineSubRegion") {
        link = "<a href=\"javascript:detailAndExpand(getSubregion(" + info["nodes"][node_id].id + "));\">" + info["nodes"][node_id].caption + "</a>"
        parentSubregions += link + ", ";
      }
    }
    return parentSubregions.slice(0, -2);
  } else if (node.type == "Winery") {
    if (node.url === "" || node.url === null || typeof node.url === 'undefined') {
      url = "Nem áll rendelkezésre";
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
    return "Név: " + node.caption + "<br>Település: " + node.village + "<br>Url: " + url
        + "<br>" + parentSubregion + " borvidékén található";
  }
  return "Nem állnak rendelkezésre részletek " + node.type + " típushoz.";
}

