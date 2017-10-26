from neo4j.v1 import GraphDatabase, basic_auth
from database.wineregion import WineRegion
from database.winesubregion import WineSubRegion
from database.grape import Grape


def get_all_regions_subregions_grapes():
    return execute_query(
        "match (region:WineRegion)-[relationship:CONTAINS]->(wsr:WineSubRegion) return region, wsr, relationship")


def get_winesubregion_by_id(id):
    return execute_query(
        "match (wsr:WineSubRegion) where id(wsr) = {} "
        "optional match (wsr)<-[relationship:GROWS_AT]-(grape:Grape) return wsr, grape, relationship".format(
            id))


def get_wineregion_with_subregions_by_id(id):
    return execute_query(
        "match (wr:WineRegion) where id(wr) = {} "
        "optional match (wr)-[relationship:CONTAINS]->(wsr:WineSubRegion) return wr, wsr, relationship".format(
            id))


def get_wineregion_by_id(id):
    result_set = execute_query("match (r:WineRegion) where id(r)= {} return r".format(id))
    return result_set[0]["r"].get("name")


def get_subregions_for_grape(id):
    return execute_query(
        "match (grape:Grape)-[relationship:GROWS_AT]->(wsr:WineSubRegion) where id(grape) = {} "
        "return wsr, grape, relationship".format(
            id))


def get_winesubregion_with_full_details_by_id(id):
    return execute_query(
        "match (wsr:WineSubRegion)<-[contains:CONTAINS]-(wr:WineRegion) where id(wsr) = {} "
        "optional match (grape:Grape)-[grows_at:GROWS_AT]->(wsr) return wsr, grape, wr, grows_at, contains".format(
            id))


def get_wineregions():
    return [WineRegion(record["wr"].id, record["wr"].get("name"))
            for record in execute_query("match (wr:WineRegion) return wr")]


def get_winesubregions():
    return [WineSubRegion(record["wsr"].id, record["wsr"].get("name"))
            for record in execute_query("match (wsr:WineSubRegion) return wsr".format(id))]


def get_grapes():
    return [Grape(record["grape"].id, record["grape"].get("name"))
            for record in execute_query("match (grape:Grape) return distinct grape".format(id))]


def execute_query(query):
    driver = GraphDatabase.driver("bolt://localhost:7687", auth=basic_auth("neo4j", "neo4j"))
    session = driver.session()
    result_set = [record for record in session.run(query)]
    session.close()
    return result_set
