from neo4j.v1 import GraphDatabase, basic_auth


driver = GraphDatabase.driver("bolt://hobby-okkilhhaanncgbkedbmmmepl.dbs.graphenedb.com:24786", auth=basic_auth("wine_hun", "b.PjkgEcaSK1oi.NbnasmXHEMnMRn5h"))

session = driver.session()


session.run("CREATE (n:Person {name:'Bob'})")
result = session.run("MATCH (n:Person) RETURN n.name AS name")
for record in result:
    print(record["name"])
session.close()
