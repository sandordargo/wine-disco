import os
from flask import Flask, render_template
from domainobjects.grape_by_subregions import GrapeBySubregions
from domainobjects.grapes_grown_at_subregion import GrapesGrownAtSubregion
from domainobjects.region_subregion_grape_full_details import RegionSubRegionGrapeFullDetails
from domainobjects.wineregion import WineRegion
from domainobjects.winery_with_subregion import WineryWithSubregion

from database import database
from domainobjects.subregion_full_details import SubRegionFullDetails

import arguments
from database.driver import Driver

app = Flask(__name__)
app.secret_key = 'some_secret'
app.password = None
app.bolt_url = None
app.username = None
app.driver = None
APPLICATION_NAME = "Family Tree Application"


@app.route('/data/data')
def get_all_regions_and_subregions():
    return str(RegionSubRegionGrapeFullDetails(app.driver))


@app.route('/data/regions/<region>')
def get_region_by_id(region):
    return str(WineRegion(app.driver, region))


@app.route('/data/subregion_with_grapes_and_parent_and_wineries/<subregion>')
def get_full_sub_region_details(subregion):
    return str(SubRegionFullDetails(app.driver, subregion))


@app.route('/data/grapes_at_subregion/<subregion>')
def get_sub_region_details_2(subregion):
    return str(GrapesGrownAtSubregion(app.driver, subregion))


@app.route('/data/subregions_of_grape/<grape>')
def get_subregions_of_grape(grape):
    return str(GrapeBySubregions(app.driver, grape))


@app.route('/data/winery_and_subregion/<winery>')
def get_winery_and_subregion(winery):
    return str(WineryWithSubregion(app.driver, winery))


@app.route("/")
@app.route("/index.html")
def show_tree():
    import locale
    try:
        locale.setlocale(locale.LC_ALL, locale.locale_alias['hu_hu'])
    except:
        pass
    sorted_grapes = database.get_grapes(app.driver)
    sorted_grapes.sort(key=lambda grape: locale.strxfrm(grape.name))
    sorted_regions = database.get_wineregions(app.driver)
    sorted_regions.sort(key=lambda region: locale.strxfrm(region.name))
    sorted_subregions = database.get_winesubregions(app.driver)
    sorted_subregions.sort(key=lambda region: locale.strxfrm(region.name))
    return render_template('index.html',
                           regions=sorted_regions,
                           subregions=sorted_subregions,
                           grapes=sorted_grapes)


if __name__ == "__main__":
    app.debug = True
    args = arguments.parse_arguments()
    app.bolt_url = args.bolt_url
    app.username = args.user
    app.password = args.password
    app.driver = Driver(app.bolt_url, app.username, app.password)
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
