from neo4j.v1 import GraphDatabase, basic_auth


class Node(object):
    def __init__(self, id, type, caption):
        self.caption = caption
        self.type = type
        self.id = id

    def to_json(self):
        return {"caption": self.caption, "type": self.type, "id": self.id}


class Edge(object):
    def __init__(self, caption, source, target):
        self.caption = caption
        self.source = source
        self.target = target

    def to_json(self):
        return {"source": self.source, "target": self.target, "caption": self.caption}


def query():
    driver = GraphDatabase.driver("bolt://localhost:7687", auth=basic_auth("neo4j", "neo4j"))
    session = driver.session()

    result = session.run(
        "match (region:WineRegion)-[relationship:CONTAINS]->(wsr:WineSubRegion) return region, wsr, relationship")
    result_set = []
    for record in result:
        print(record["region"], record["wsr"], record['relationship'])
        result_set.append(record)
    session.close()
    return result_set


def format_results(unformatted_results):
    formatted_results = {"comment": "this is a nice comment", "nodes": [], "edges": []}

    for record in unformatted_results:
        region = Node(record["region"].id, next(iter(record["region"].labels)), record["region"].get("name"))
        wsr = Node(record["wsr"].id, next(iter(record["wsr"].labels)), record["wsr"].get("name"))
        edge = Edge(record["relationship"].type, record["relationship"].start, record["relationship"].end)
        formatted_results["nodes"].append(region.to_json())
        formatted_results["nodes"].append(wsr.to_json())
        formatted_results["edges"].append(edge.to_json())


    return formatted_results
