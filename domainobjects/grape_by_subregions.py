from database import database
from database.edge import Edge
from database.node import Node


class GrapeBySubregions(object):
    def __init__(self, driver, grape_id):
        self.grape_id = grape_id
        self.data = self.format_data(database.get_subregions_for_grape(driver, grape_id))

    def __str__(self):
        return self.__repr__()

    def __repr__(self):
        return str(self.data).replace("'", '"')

    @staticmethod
    def format_data(data):
        formatted_results = {"nodes": [], "links": []}
        grape_to_add = True
        for record in data:
            grape = Node(record["grape"].id, next(iter(record["grape"].labels)), record["grape"].get("name"))
            wsr = Node(record["wsr"].id, next(iter(record["wsr"].labels)), record["wsr"].get("name"))
            edge = Edge(record["relationship"].type, record["relationship"].start, record["relationship"].end)
            if grape_to_add:
                formatted_results["nodes"].append(grape.to_json())
                grape_to_add = False

            formatted_results["nodes"].append(wsr.to_json())
            formatted_results["links"].append(edge.to_json())
        return formatted_results
