from flask import Flask, jsonify, request
import json
app = Flask(__name__, static_url_path='/app', static_folder='app')

# Globals
playerCount = 0
currentPlayerTurn = 1


# temps until database gets finished
locations = {'p1':'45hallway2', 'p2':'54hallway5', 'p3':'41hallway12', 'p4':'21hallway11', 'p5':'12hallway8', 'p6':'14hallway3'}

@app.route('/')
def root():
    return app.send_static_file('index.html')

@app.route('/currentTurn', methods=['GET'])
def currentTurn():
    resp = {'currentTurn': 'p' + str(currentPlayerTurn)}
    return jsonify(resp)

@app.route('/assignPlayer', methods=['GET'])
def assignPlayer():
    global playerCount
    #### DEBUGGTGGGG
    resp = {'assigned': 1}
    return jsonify(resp)
    if playerCount < 5:
        playerCount += 1
        resp = {'assigned': playerCount}
        return jsonify(resp)

@app.route('/nextTurn', methods=['POST'])
def nextTurn():
    print(request.form['javascript_data'])
    print(request.json)
    global currentPlayerTurn
    currentPlayerTurn += 1
    if (currentPlayerTurn == 7):
        currentPlayerTurn = 1
    return 'OK', 200

@app.route('/move', methods=['POST'])
def move():
    data = json.loads(request.form['javascript_data'])
    locations[data['player']] = data['to']

    return 'Ok', 200

@app.route('/update', methods=['GET'])
def update():
    return jsonify({'currentTurn': currentPlayerTurn, 'locations': locations})

@app.route('/location', methods=['GET'])
def location():
    return jsonify({'locations': locations})
