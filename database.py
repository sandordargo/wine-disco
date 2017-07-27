from neo4j.v1 import GraphDatabase, basic_auth


def query():
    driver = GraphDatabase.driver("bolt://localhost:7687", auth=basic_auth("neo4j", "neo4j"))
    session = driver.session()

    result = session.run("match (region:WineRegion)-[:CONTAINS]->(wsr:WineSubRegion) return region, wsr")
    for record in result:
        print(record["region"], record["wsr"])

    session.close()
