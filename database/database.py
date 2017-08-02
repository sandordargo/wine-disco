from neo4j.v1 import GraphDatabase, basic_auth
from database.node import Node
from database.edge import Edge


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
    formatted_results = {"comment": "this is a nice comment", "nodes": [], "links": []}

    for record in unformatted_results:
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


def get_winesubregion_by_id(id):
    result_set = execute_query(
        "match (wsr:WineSubRegion)<-[relationship:GROWS_AT]-(grape:Grape) where id(wsr)= {} return wsr, grape, relationship".format(id))
    return result_set


def get_wineregion_by_id(id):
    result_set = execute_query("match (r:WineRegion) where id(r)= {} return r".format(id))
    return result_set[0]["r"].get("name")


def execute_query(query):
    driver = GraphDatabase.driver("bolt://localhost:7687", auth=basic_auth("neo4j", "neo4j"))
    session = driver.session()

    result = session.run(query)
    result_set = []
    for record in result:
        result_set.append(record)
    session.close()
    return result_set
