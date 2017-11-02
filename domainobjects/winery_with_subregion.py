from database import database
from database.edge import Edge
from database.node import Node
from database.winery_node import WineryNode


class WineryWithSubregion(object):
    def __init__(self, driver, winery_id):
        self.winery_id = winery_id
        self.data = self.format_data(database.get_winery_by_id(driver, winery_id))

    def __str__(self):
        return self.__repr__()

    def __repr__(self):
        return str(self.data).replace("'", '"')

    @staticmethod
    def format_data(data):
        formatted_results = {"nodes": [], "links": []}
        for record in data:
            winery = None
            edge = None
            wsr = None
            if record["winery"] is not None:
             winery = WineryNode(record["winery"].id, next(iter(record["winery"].labels)),
                    record["winery"].get("name"), record["winery"].get("village"),
                    record["winery"].get("url"))
            if record["wsr"] is not None:
                wsr = Node(record["wsr"].id, next(iter(record["wsr"].labels)), record["wsr"].get("name"))
            if record["located_in"] is not None:
                edge = Edge(record["located_in"].type, record["located_in"].start, record["located_in"].end)
            if wsr:
                formatted_results["nodes"].append(wsr.to_json())
            if winery:
                formatted_results["nodes"].append(winery.to_json())
            if edge:
                formatted_results["links"].append(edge.to_json())
        print(formatted_results)
        return formatted_results
