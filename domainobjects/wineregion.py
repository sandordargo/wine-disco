from database import database
from database.edge import Edge
from database.node import Node


class WineRegion(object):
    def __init__(self, region_id):
        self.region_id = region_id
        self.data = self.format_data(database.get_wineregion_with_subregions_by_id(region_id))

    def __str__(self):
        return self.__repr__()

    def __repr__(self):
        return str(self.data).replace("'", '"')

    @staticmethod
    def format_data(data):
        formatted_results = {"nodes": [], "links": []}
        region_to_add = True
        for record in data:
            wsr = None
            edge = None
            if record["wsr"] is not None:
                wsr = Node(record["wsr"].id, next(iter(record["wsr"].labels)), record["wsr"].get("name"))
            if record["wr"] is not None:
                wr = Node(record["wr"].id, next(iter(record["wr"].labels)), record["wr"].get("name"))
            if record["relationship"] is not None:
                edge = Edge(record["relationship"].type, record["relationship"].start, record["relationship"].end)
            if region_to_add:
                formatted_results["nodes"].append(wr.to_json())
                region_to_add = False
            if wsr:
                formatted_results["nodes"].append(wsr.to_json())
            if edge:
                formatted_results["links"].append(edge.to_json())
        return formatted_results
