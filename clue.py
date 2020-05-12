from flask import Flask, jsonify, request
import json
import random

app = Flask(__name__, static_url_path='/app', static_folder='app')

# Globals
playerCount = 0
currentPlayerTurn = 1
moved = False
gameStarted = False

# temps until database gets finished
locations = {'p1':'45hallway2', 'p2':'54hallway5', 'p3':'41hallway12', 'p4':'21hallway11', 'p5':'12hallway8', 'p6':'14hallway3'}
playerCards = {'p1':[], 'p2':[], 'p3':[], 'p4':[], 'p5':[], 'p6':[]}
rooms = ['Study', 'Hall', 'Lounge', 'Library', 'Billiard', 'Dining', 'Conservatory', 'Ballroom', 'Kitchen']
characters = ['Miss Scarlet', 'Col. Mustard', 'Mrs. White', 'Mr. Green', 'Mrs. Peacock', 'Prof. Plum']
weapons = ['Candlestick', 'Revolver', 'Knife', 'Pipe', 'Wrench', 'Rope']
crime = {}
messages = []
privateMessages = {'p1':[], 'p2':[], 'p3':[], 'p4':[], 'p5':[], 'p6':[]}
failedAccusition = {'p1':False, 'p2':False, 'p3':False, 'p4':False, 'p5':False, 'p6':False}

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
    incrementTurn()
    return 'OK', 200

def incrementTurn():
    global currentPlayerTurn
    currentPlayerTurn += 1
    if (currentPlayerTurn == playerCount +1):
        currentPlayerTurn = 1
    while failedAccusition[f'p{currentPlayerTurn}']:
        currentPlayerTurn += 1
        if (currentPlayerTurn == playerCount +1):
            currentPlayerTurn = 1

@app.route('/move', methods=['POST'])
def move():
    data = json.loads(request.form['javascript_data'])
    locations[data['player']] = data['to']
    global moved
    moved = True
    return 'Ok', 200

@app.route('/accuse', methods=['POST'])
def accuse():
    data = json.loads(request.form['javascript_data'])
    if data == crime:
        # Win
        messages.append(f'Congradulations! Player {currentPlayerTurn} has won the game!')
    else:
        messages.append(f'Player {currentPlayerTurn} was incorrect.')
        global failedAccusition
        failedAccusition[f'p{currentPlayerTurn}'] = True
        incrementTurn()
    return 'Ok', 200


@app.route('/message', methods=['POST'])
def message():
    data = json.loads(request.form['javascript_data'])
    global messages
    messages.append(data['message'])
    return 'Ok', 200

@app.route('/privateMessage', methods=['POST'])
def privateMessage():
    data = json.loads(request.form['javascript_data'])
    global privateMessages
    privateMessages['p' + str(currentPlayerTurn)].append(data['message'])
    return 'Ok', 200

@app.route('/update', methods=['GET'])
def update():
    return jsonify({'currentTurn': currentPlayerTurn, 'locations': locations, 'messages':messages, 'cards':playerCards, 'privateMessages':privateMessages})

@app.route('/data', methods=['GET'])
def data():
    return jsonify({'locations': locations, 'moved':moved, 'started':gameStarted, 'currentTurn':currentPlayerTurn})

@app.route('/start', methods=['POST'])
def start():
    global gameStarted
    global messages
    if(playerCount >= 3 and not gameStarted):
        random.shuffle(rooms)
        random.shuffle(characters)
        random.shuffle(weapons)
        global crime
        global playerCards
        crime = {'accused':characters.pop(), 'room':rooms.pop(), 'weapon':weapons.pop()}
        print(crime)
        count = 1
        for i in range(len(characters)):
            playerCards['p'+str(count)].append(characters[i])
            count += 1
            if (count == playerCount +1):
                count = 1

        for i in range(len(rooms)):
            playerCards['p'+str(count)].append(rooms[i])
            count += 1
            if (count == playerCount +1):
                count = 1

        for i in range(len(weapons)):
            playerCards['p'+str(count)].append(weapons[i])
            count += 1
            if (count == playerCount +1):
                count = 1

        gameStarted = True
        messages.append('Game started!')
        return 'Ok', 200
    else:
        if playerCount < 3:
            messages.append('Need 3 players to start!')
            
        return 'Ok', 200
