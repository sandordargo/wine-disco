from flask import Flask, render_template, request, url_for, redirect, flash, make_response, send_from_directory
import database

app = Flask(__name__)
app.secret_key = 'some_secret'
APPLICATION_NAME = "Family Tree Application"


@app.route('/data/data')
def send_js():
    return str(database.format_results(database.query())).replace("'", '"')


@app.route('/regions')
def get_regions():
    """
    match (region:WineRegion)-[:CONTAINS]->(wsr:WineSubRegion)
    return region, wsr
    :return:
    """
    return database.format_results(database.query())


@app.route("/")
@app.route("/index.html")
def show_tree():
    return render_template('index.html')


if __name__ == "__main__":
    app.debug = True
    app.run(host='0.0.0.0', port=5000)
