from database import database
from database.edge import Edge
from database.node import Node


class SubRegionFullDetails(object):
    def __init__(self, subregion_id):
        self.subregion_id = subregion_id
        self.data = self.format_data(database.get_winesubregion_with_full_details_by_id(subregion_id))

    def __str__(self):
        return self.__repr__()

    def __repr__(self):
        return str(self.data).replace("'", '"')

    @staticmethod
    def format_data(data):
        formatted_results = {"nodes": [], "links": []}
        wsr_to_add = True
        region_to_add = True
        for record in data:
            grape = None
            grows_at_edge = None
            region = None
            contains_edge = None
            if "grape" in record and record["grape"] is not None:
                grape = Node(record["grape"].id, next(iter(record["grape"].labels)), record["grape"].get("name"))
            if "wsr" in record and record["wsr"] is not None:
                wsr = Node(record["wsr"].id, next(iter(record["wsr"].labels)), record["wsr"].get("name"))
                wsr.expanded = True
            if "grows_at" in record and record["grows_at"] is not None:
                grows_at_edge = Edge(record["grows_at"].type, record["grows_at"].start, record["grows_at"].end)
            if "contains" in record and record["contains"] is not None:
                contains_edge = Edge(record["contains"].type, record["contains"].start, record["contains"].end)
            if "wr" in record and record["wr"] is not None:
                region = Node(record["wr"].id, next(iter(record["wr"].labels)), record["wr"].get("name"))
            if wsr_to_add:
                formatted_results["nodes"].append(wsr.to_json())
                wsr_to_add = False

            if grape:
                formatted_results["nodes"].append(grape.to_json())
            if grows_at_edge:
                formatted_results["links"].append(grows_at_edge.to_json())
            if region_to_add and region:
                formatted_results["nodes"].append(region.to_json())
                region_to_add = False
            if contains_edge:
                formatted_results["links"].append(contains_edge.to_json())
        return formatted_results
