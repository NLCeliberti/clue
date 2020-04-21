from flask import Flask, jsonify, request
import json
app = Flask(__name__, static_url_path='/app', static_folder='app')

# Globals
playerCount = 0
currentPlayerTurn = 1
moved = False
gameStarted = False
messages = []

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
    if not gameStarted:
        global playerCount
        if playerCount < 6:
            playerCount += 1
            resp = {'assigned': playerCount}
            return jsonify(resp)
        else:
            return jsonify({'assigned':'spectator'})
    else:
        return jsonify({'assigned':'spectator'})

@app.route('/nextTurn', methods=['POST'])
def nextTurn():
    global moved
    moved = False
    global currentPlayerTurn
    currentPlayerTurn += 1
    if (currentPlayerTurn == playerCount +1):
        currentPlayerTurn = 1
    return 'OK', 200

@app.route('/move', methods=['POST'])
def move():
    data = json.loads(request.form['javascript_data'])
    locations[data['player']] = data['to']
    global moved
    moved = True
    return 'Ok', 200

@app.route('/message', methods=['POST'])
def message():
    data = json.loads(request.form['javascript_data'])
    global messages
    messages.append(data['message'])
    return 'Ok', 200

@app.route('/update', methods=['GET'])
def update():
    return jsonify({'currentTurn': currentPlayerTurn, 'locations': locations, 'messages':messages})

@app.route('/location', methods=['GET'])
def location():
    return jsonify({'locations': locations, 'moved':moved, 'started':gameStarted})

@app.route('/start', methods=['POST'])
def start():
    #if(playerCount >= 3 and not gameStarted):
    global gameStarted
    if(True and not gameStarted):
        gameStarted = True
        global messages
        messages.append('Game started!')
        return 'Ok', 200
    else:
        return 'Ok', 200
