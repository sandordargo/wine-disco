from flask import Flask, render_template
from domainobjects.grape_by_subregions import GrapeBySubregions
from domainobjects.grapes_grown_at_subregion import GrapesGrownAtSubregion
from domainobjects.region_subregion_grape_full_details import RegionSubRegionGrapeFullDetails
from domainobjects.wineregion import WineRegion

from database import database
from domainobjects.subregion_full_details import SubRegionFullDetails

app = Flask(__name__)
app.secret_key = 'some_secret'
APPLICATION_NAME = "Family Tree Application"


@app.route('/data/data')
def get_all_regions_and_subregions():
    return str(RegionSubRegionGrapeFullDetails())


@app.route('/data/regions/<region>')
def get_region_by_id(region):
    return str(WineRegion(region))


@app.route('/data/subregion_with_grapes_and_parent/<subregion>')
def get_full_sub_region_details(subregion):
    return str(SubRegionFullDetails(subregion))


@app.route('/data/grapes_at_subregion/<subregion>')
def get_sub_region_details_2(subregion):
    return str(GrapesGrownAtSubregion(subregion))


@app.route('/data/subregions_of_grape/<grape>')
def get_subregions_of_grape(grape):
    return str(GrapeBySubregions(grape))


@app.route("/")
@app.route("/index.html")
def show_tree():
    import locale
    try:
        locale.setlocale(locale.LC_ALL, locale.locale_alias['hu_hu'])
    except:
        pass
    sorted_grapes = database.get_grapes()
    sorted_grapes.sort(key=lambda grape: locale.strxfrm(grape.name))
    sorted_regions = database.get_wineregions()
    sorted_regions.sort(key=lambda region: locale.strxfrm(region.name))
    sorted_subregions = database.get_winesubregions()
    sorted_subregions.sort(key=lambda region: locale.strxfrm(region.name))
    return render_template('index.html',
                           regions=sorted_regions,
                           subregions=sorted_subregions,
                           grapes=sorted_grapes)


if __name__ == "__main__":
    app.debug = True
    app.run(host='0.0.0.0', port=5000)
