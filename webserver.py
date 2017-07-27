from flask import Flask, render_template, request, url_for, redirect, flash, make_response, send_from_directory
import database

app = Flask(__name__)
app.secret_key = 'some_secret'
APPLICATION_NAME = "Family Tree Application"


@app.route('/data/data')
def send_js():
    print("blabla")
    # return send_from_directory('data', 'charlie.json')
    return '''{
        "comment": "Charlize Theron's 'ego' network as GraphJSON",
        "nodes": [{
                "caption": "Screen Actors Guild Award for Outstanding Performance by a Female Actor in a Miniseries or Television Movie",
                "type": "award",
                "id": 595472
            },
            {
                "caption": "Children of the Corn III: Urban Harvest",
                "type": "movie",
                "id": 626470
            }
        ],
        "edges": [{
            "source": 626470,
            "target": 595472,
            "caption": "ACTED_IN"
        }]
    }'''


@app.route('/regions')
def get_regions():
    """
    match (region:WineRegion)-[:CONTAINS]->(wsr:WineSubRegion)
    return region, wsr
    :return:
    """
    database.query()
    return ""


@app.route("/")
@app.route("/index.html")
def show_tree():
    return render_template('index.html')


if __name__ == "__main__":
    app.debug = True
    app.run(host='0.0.0.0', port=5000)
