from database import database
from database.edge import Edge
from database.node import Node


class GrapesGrownAtSubregion(object):
    def __init__(self, subregion_id):
        self.subregion_id = subregion_id
        self.data = self.format_data(database.get_winesubregion_by_id(subregion_id))

    def __str__(self):
        return self.__repr__()

    def __repr__(self):
        return str(self.data).replace("'", '"')

    @staticmethod
    def format_data(data):
        formatted_results = {"comment": "this is a nice comment", "nodes": [], "links": []}
        wsr_to_add = True
        for record in data:
            grape = Node(record["grape"].id, next(iter(record["grape"].labels)), record["grape"].get("name"))
            wsr = Node(record["wsr"].id, next(iter(record["wsr"].labels)), record["wsr"].get("name"))
            edge = Edge(record["relationship"].type, record["relationship"].start, record["relationship"].end)
            if wsr_to_add:
                formatted_results["nodes"].append(wsr.to_json())
                wsr_to_add = False

            formatted_results["nodes"].append(grape.to_json())
            formatted_results["links"].append(edge.to_json())
        return formatted_results
