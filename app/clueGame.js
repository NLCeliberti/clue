// Character art shared by Sari Jack on Drbbble

/** **************************************************************************************
    Init
    **************************************************************************************
*/
fetch('/assignPlayer')
.then(function (response) {
    return response.json();
}).then(function (res) {
  document.getElementById("playerID").innerHTML = res['assigned'];
  displayMessage(`${res['assigned']} joined the game!`);
});

/** **************************************************************************************
    Functions
    **************************************************************************************
*/
function getCallback(query, callback) {
  fetch(query)
  .then(function (response) {
      return response.json();
  }).then(function (res) {
    callback(res);
  });
}

function startGame() {
  $.post('/start', {
    javascript_data: JSON.stringify({'start':'start'})
  })
}

function movementAction(el) {
  getCallback('/currentTurn', function(rtn) {
    let currTurn = rtn['currentTurn']
    let playerNum = 'p' + document.getElementById(`playerID`).innerHTML

    getCallback('/data', function(rtn) {
      let from = rtn['locations'][currTurn]
      if (movementAllowed(el, currTurn, from, rtn['moved'], rtn['started'])) {
        $.post('/move', {
          javascript_data: JSON.stringify({'player':playerNum, 'to':el})
        })
        displayMessage(`Player ${playerNum.charAt(1)} moved to ${el.substring(2)}`);
        update()
      }
    })
  })
}

function movementAllowed(to, currTurn, from, moved, started) {
  let roomNum = to.substring(0,2)
  if (document.getElementById(`playerID`).innerHTML != currTurn.charAt(1)) {
    alert("It is not your turn");
    return false;
  }
  if (!started) {
    alert('Game has not started')
    return false
  }

  if (moved) {
    alert('You already moved')
    return false
  }

  if (document.getElementById(to).innerHTML.includes('img')) {
      if(to.includes('hallway'))
      {
        alert("You cannot move there");
        return false;
      }
  }

    let t = parseInt(to.substring(0,2))
    let frm = parseInt(from.substring(0,2))

    if(frm + 10 === t || frm - 10 === t || frm + 1 === t || frm - 1 === t) {
      return true
    }

    if(to === '15study' && from == '51kitchen') {
      return true
    }

    if(to === '51kitchen' && from == '15study') {
      return true
    }

    if(to === '55lounge' && from == '11conservatory') {
      return true
    }

    if(to === '11conservatory' && from == '55lounge') {
      return true
    }

    alert('You cannot move there')
    return false
}

function show(player, card) {
  $.post('/privateMessage', {
    javascript_data: JSON.stringify({'message': 'Player ' + player + ' showed you ' + card})
  })
}

function displayMessage(message) {
  $.post('/message', {
    javascript_data: JSON.stringify({'message':message})
  })
  //  document.getElementById("textarea").innerHTML += message + '&#13;&#10;';
}

function endTurn(id) {
  const playerNum = parseInt(document.getElementById(`playerID`).innerHTML);
  getCallback('/currentTurn', function(rtn) {
    let currTurn = rtn['currentTurn']
    if (playerNum != parseInt(currTurn.charAt(1))) {
      alert('Not your turn.')
      return
    } else {
      fetch('/nextTurn', {
        method: 'POST',
        body: JSON.stringify({
            "next": "turn"
          })
      })

      let nextPlayerNum;
      if (playerNum === 6)
          nextPlayerNum = 1;
      else
          nextPlayerNum = playerNum + 1;

      displayMessage(`Player ${playerNum} ended their turn`);
    }
  })

}

var msgidx = 0
var prividx = 0
var addCards = true
function update() {
  getCallback('/update', function(rtn) {
    let currTurn = rtn['currentTurn']
    let locations = rtn['locations']
    for (var p in locations) {
      if (document.getElementById(`${p}`)) {
          document.getElementById(`${p}`).remove();
      }
      document.getElementById(locations[p]).innerHTML += `<img id=${p} class='playerImg' src='app/img/${p}.png'/>`
    }
    document.getElementById('currentTurn').innerHTML = `Player ${rtn['currentTurn']}`;

    for (let idx = msgidx; idx < rtn['messages'].length; idx++) {
      document.getElementById("textarea").innerHTML += rtn['messages'][idx] + '&#13;&#10;';
      msgidx+=1
    }
    for (let idx = prividx; idx < rtn['privateMessages']['p' + document.getElementById("playerID").innerHTML].length; idx++) {
      document.getElementById("textarea").innerHTML += rtn['privateMessages']['p' + document.getElementById("playerID").innerHTML][idx] + '&#13;&#10;';
      prividx+=1
    }

    if(addCards) {
      for (let idx = 0; idx < rtn['cards']['p' + document.getElementById("playerID").innerHTML].length; idx++) {
        let text = rtn['cards']['p' + document.getElementById("playerID").innerHTML][idx]
        document.getElementById('cards').innerHTML += `<button onclick="show(${document.getElementById("playerID").innerHTML},\'${text}\')">${text}</button><br/>`
        addCards = false
      }

    }
  })
}

var rooms = ['study', 'hall', 'lounge', 'library', 'billiard', 'dining', 'conservatory', 'ballroom', 'kitchen']
var charToId = {'Miss Scarlet':'p1',
               'Col. Mustard':'p2',
               'Mrs. White':'p3',
               'Mr. Green':'p4',
               'Mrs. Peacock':'p5',
               'Prof. Plum':'p6' }

function makeAccusation() {
  getCallback('/data', function(rtn) {
    let currTurn = rtn['currentTurn']
    let location = rtn['locations']['p' + currTurn].substring(2)
    let accused = document.querySelector('input[name="character"]:checked').value
    let room = document.querySelector('input[name="room"]:checked').value
    let weapon = document.querySelector('input[name="weapon"]:checked').value


    if (document.getElementById(`playerID`).innerHTML != currTurn) {
      alert("It is not your turn");
      return false;
    }
    if (!rtn['started']) {
      alert('Game has not started')
      return false
    }
    displayMessage(`Player ${currTurn} says \"I accuse ${accused} of committing the crime in the ${room} with the ${weapon}.\"`);

    $.post('/accuse', {
      javascript_data: JSON.stringify({'accused':accused, 'room':room, 'weapon':weapon})
    })
    update()

  })

}

function makeSuggestion(playerNum) {

  getCallback('/data', function(rtn) {
    let currTurn = rtn['currentTurn']
    let location = rtn['locations']['p' + currTurn].substring(2)
    let accused = document.querySelector('input[name="character"]:checked').value
    let weapon = document.querySelector('input[name="weapon"]:checked').value
    if(rooms.includes(location)){
      if (document.getElementById(`playerID`).innerHTML != currTurn) {
        alert("It is not your turn");
        return false;
      }
      if (!rtn['started'])  {
        alert('Game has not started')
        return false
      }

      displayMessage(`Player ${currTurn} says \"I suggest the crime was committed in the ${location} by ${accused} with the ${weapon}.\"`);

      $.post('/move', {
        javascript_data: JSON.stringify({'player':charToId[accused], 'to':rtn['locations']['p' + currTurn]})
      })
    } else {
      alert('You are not in a room')
    }
    update()

  })

}

window.setInterval(function(){
  update()
}, 1000);
