import os
from flask import Flask, render_template, request, Blueprint, g
from flask.ext.babelex import Babel, gettext

import arguments

from config import LANGUAGES

from database import database
from database.driver import Driver

from domainobjects.grape_by_subregions import GrapeBySubregions
from domainobjects.grapes_grown_at_subregion import GrapesGrownAtSubregion
from domainobjects.region_subregion_grape_full_details import RegionSubRegionGrapeFullDetails
from domainobjects.subregion_full_details import SubRegionFullDetails
from domainobjects.wineregion import WineRegion
from domainobjects.winery_with_subregion import WineryWithSubregion

app = Flask(__name__)
babel = Babel(app)
app.secret_key = 'some_secret'
app.password = None
app.bolt_url = None
app.username = None
app.driver = None
APPLICATION_NAME = "Family Tree Application"

language_blueprint = Blueprint('frontend', __name__, url_prefix='/<lang_code>', template_folder='templates',
                               static_folder='static')
default = Blueprint('default', __name__, url_prefix='/', template_folder='templates',
                    static_folder='static')


@app.before_request
def before_request():
    g.locale = get_locale()

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


@babel.localeselector
def get_locale():
    lang = request.path[1:].split('/', 1)[0]
    if lang and lang not in LANGUAGES:
        lang = None
    if not lang:
        lang = request.accept_languages.best_match(LANGUAGES)
    return lang


@language_blueprint.url_value_preprocessor
def pull_lang_code(endpoint, values):
    g.lang_code = values.pop('lang_code')



@language_blueprint.route("/")
@default.route("/")
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


app.register_blueprint(default)
app.register_blueprint(language_blueprint)

if __name__ == "__main__":
    app.debug = True
    args = arguments.parse_arguments()
    app.bolt_url = args.bolt_url
    app.username = args.user
    app.password = args.password
    app.driver = Driver(app.bolt_url, app.username, app.password)
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
