from database.wineregion import WineRegion
from database.winesubregion import WineSubRegion
from database.grape import Grape


def get_all_regions_subregions_grapes(driver):
    return execute_query(driver,
                         "match (region:WineRegion)-[relationship:CONTAINS]->(wsr:WineSubRegion) return region, wsr, relationship")


def get_winesubregion_by_id(driver, id):
    return execute_query(driver,
                         "match (wsr:WineSubRegion) where id(wsr) = {} "
                         "optional match (wsr)<-[relationship:GROWS_AT]-(grape:Grape) return wsr, grape, relationship".format(
                             id))


def get_wineregion_with_subregions_by_id(driver, id):
    return execute_query(driver,
                         "match (wr:WineRegion) where id(wr) = {} "
                         "optional match (wr)-[relationship:CONTAINS]->(wsr:WineSubRegion) return wr, wsr, relationship".format(
                             id))


def get_wineregion_by_id(driver, id):
    result_set = execute_query(driver, "match (r:WineRegion) where id(r)= {} return r".format(id))
    return result_set[0]["r"].get("name")


def get_winery_by_id(driver, id):
    return execute_query(driver,
                         "match (winery:Winery)-[located_in:IS_LOCATED_IN]->(wsr:WineSubRegion) "
                         "where id(winery) = {} "
                         "return winery, located_in, wsr".format(
                             id))


def get_subregions_for_grape(driver, id):
    return execute_query(driver,
                         "match (grape:Grape)-[relationship:GROWS_AT]->(wsr:WineSubRegion) where id(grape) = {} "
                         "return wsr, grape, relationship".format(
                             id))


def get_winesubregion_with_full_details_by_id(driver, id):
    return execute_query(driver,
                         "match (wsr:WineSubRegion)<-[contains:CONTAINS]-(wr:WineRegion) where id(wsr) = {} "
                         "optional match (grape:Grape)-[grows_at:GROWS_AT]->(wsr) "
                         "optional match (wsr)<-[located_in:IS_LOCATED_IN]-(winery:Winery)"
                         "return wsr, grape, wr, grows_at, contains, winery, located_in".format(
                             id))


def get_wineregions(driver):
    return [WineRegion(record["wr"].id, record["wr"].get("name"))
            for record in execute_query(driver, "match (wr:WineRegion) return wr")]


def get_winesubregions(driver):
    return [WineSubRegion(record["wsr"].id, record["wsr"].get("name"))
            for record in execute_query(driver, "match (wsr:WineSubRegion) return wsr".format(id))]


def get_grapes(driver, ):
    return [Grape(record["grape"].id, record["grape"].get("name"))
            for record in execute_query(driver, "match (grape:Grape) return distinct grape".format(id))]


def execute_query(driver, query):
    session = driver.driver.session()
    result_set = [record for record in session.run(query)]
    session.close()
    return result_set
