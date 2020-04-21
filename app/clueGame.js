/** **************************************************************************************
    Init
    **************************************************************************************
*/
fetch('/assignPlayer')
.then(function (response) {
    return response.json();
}).then(function (res) {
  document.getElementById("playerID").innerHTML = res['assigned'];
});

/**
p1 = Miss Scarlet
p2 = Col. Mustard
p3 = Mrs. White
p4 = Mr. Green
p5 = Mrs. Peacock
p6 = Prof. Plum
*/
update()
/** **************************************************************************************
    Functions
    **************************************************************************************
*/
//Async function
function getCallback(query, callback) {
  fetch(query)
  .then(function (response) {
      return response.json();
  }).then(function (res) {
    callback(res);
  });
}

function movementAction(el) {
  getCallback('/currentTurn', function(rtn) {
    let currTurn = rtn['currentTurn']
    let playerNum = 'p' + document.getElementById(`playerID`).innerHTML


    getCallback('/location', function(rtn) {
      let from = rtn['locations'][currTurn]
      if (movementAllowed(el, currTurn, from)) {
        $.post('/move', {
          javascript_data: JSON.stringify({'player':playerNum, 'to':el})
        })
        displayMessage(`Player ${playerNum.charAt(1)} moved to ${el.substring(2)}`);
        update()
      }
    })

  })
}

function movementAllowed(to, currTurn, from) {
  let roomNum = to.substring(0,2)
  if (document.getElementById(`playerID`).innerHTML != currTurn.charAt(1)) {
    alert("It is not your turn");
    return false;
  }
  if (document.getElementById(to).innerHTML.includes('img')) {
      alert("You cannot move there");
      return false;
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

function displayMessage(message) {
    document.getElementById("textarea").innerHTML += message + '&#13;&#10;';
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
      document.getElementById(`player${nextPlayerNum}`).innerHTML = `<h3>Your Turn</h3><button onclick='makeAccusation(${nextPlayerNum})'>Accuse</button><br/><button onclick='makeSuggestion(${nextPlayerNum})'>Suggest</button><br/><button id='p${nextPlayerNum}Turn' onclick='endTurn(this.id)'>End Turn</button><br/><br/>`;
      document.getElementById(`player${playerNum}`).innerHTML = '';
      displayMessage(`Player ${playerNum} ended their turn`);
    }
  })

}

function update() {
  getCallback('/update', function(rtn) {
    let currTurn = rtn['currentTurn']
    let locations = rtn['locations']
    for (var p in locations) {
      if (document.getElementById(`${p}`)) {
          document.getElementById(`${p}`).remove();
      }
      document.getElementById(locations[p]).innerHTML = `<img id=${p} class='playerImg' src='app/img/${p}.png'/>`
    }
  })
}

function makeAccusation(playerNum) {
    displayMessage(`Player ${playerNum} made an accusation`);
}

function makeSuggestion(playerNum) {
    displayMessage(`Player ${playerNum} made a suggestion`);
}

function win() {

}


//Room Functions
function getCoordinates() {

}

function hasSecretPassage() {

}
