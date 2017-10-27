from database import database
from database.edge import Edge
from database.node import Node


class RegionSubRegionGrapeFullDetails(object):
    def __init__(self, driver):
        self.data = self.format_data(database.get_all_regions_subregions_grapes(driver))

    def __str__(self):
        return self.__repr__()

    def __repr__(self):
        return str(self.data).replace("'", '"')

    @staticmethod
    def format_data(data):
        formatted_results = {"nodes": [], "links": []}

        for record in data:
            region = Node(record["region"].id, next(iter(record["region"].labels)), record["region"].get("name"))
            wsr = Node(record["wsr"].id, next(iter(record["wsr"].labels)), record["wsr"].get("name"))
            edge = Edge(record["relationship"].type, record["relationship"].start, record["relationship"].end)
            region_to_add = True
            for node in formatted_results["nodes"]:
                if node["id"] == region.id:
                    region_to_add = False
                    break
            if region_to_add:
                formatted_results["nodes"].append(region.to_json())
            formatted_results["nodes"].append(wsr.to_json())
            formatted_results["links"].append(edge.to_json())
        return formatted_results
