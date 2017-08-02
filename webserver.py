from database import database
from flask import Flask, render_template
from grapes_grown_at_subregion import GrapesGrownAtSubregion

app = Flask(__name__)
app.secret_key = 'some_secret'
APPLICATION_NAME = "Family Tree Application"


@app.route('/data/data')
def get_all_regions_and_subregions():
    return str(database.format_results(database.query())).replace("'", '"')


@app.route('/data/grapes_at_subregion/<subregion>')
def get_sub_region_details_2(subregion):
    return str(GrapesGrownAtSubregion(subregion))


@app.route("/")
@app.route("/index.html")
def show_tree():
    return render_template('index.html')


if __name__ == "__main__":
    app.debug = True
    app.run(host='0.0.0.0', port=5000)
