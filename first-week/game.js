var character = null;

function id(name) {
  return document.getElementById(name);
}

function loadRoomData(name, onLoaded) {
  var req = new XMLHttpRequest();
  req.overrideMimeType("application/json");
  req.open("GET", prefix+'/'+name+".json", true);
  req.onreadystatechange = function() {
    if (req.readyState == 4) {
      var json = eval('('+req.responseText+')');
      setRoomContent(json);
      onLoaded();
    }
  }
  req.send(null);
}

function gotoRoom(name) {
  $('#roomFrame').fadeOut('slow', function() {
    loadRoomData(name, function() {
      $('#roomFrame').fadeIn('slow', function() {})
    });
  });
}

function getDictKeys(dict) {
  var keys = [];
  for (var key in dict) {
    if (dict.hasOwnProperty(key))
      keys.push(key);
  }
  return keys;
}

function setRoomContent(json) {
  var html = "<html><head><link type='text/css' rel='stylesheet' href='room-style.css'></head>";
  html += "<body><div id='title'>"+json.header+"</div>";
  html += "<br>"+json.body;
  html += "<img src='zombie-white.png' id='inset-zombie'>";
  html += "</body></html>";
  window.frames["roomFrame"].document.body.innerHTML = html;

  var keys = getDictKeys(json.exits);
  var footer = id('footer');
  footer.innerHTML = "";
  for (var i in keys) {
    footer.innerHTML += '<input type="button" name="button_'+i+'" id="button_'+i
                        +'" class="action" value="'+keys[i]+'">';
  }

  for (var i in keys) {
    $('#button_' + i).click((function(k) {
      return function(e) {
        eval(json.exits[k]);
      }
    })(keys[i]));
  }

  room = json;
}

function loadCharacter(name) {
  $('#otherDiv').fadeOut('fast', function() {
    prefix = name;
    loadRoomData("start", function() {
      $('#body').fadeIn('slow', function() {});
    });
  });
  character = name;
}

function showCharacterSelect() {
  id("otherDiv").innerHTML = "<div id='chooseText'>Choose your<br>character:</div>";
  addCharacter('loadCharacter("security");', 'Security<br>Guard', 'camera-trans.png');
  addCharacter('loadCharacter("husky");', 'Siberian<br>Husky', 'paw-trans.png');
  addCharacter('loadCharacter("tech");', 'Computer<br>Technician', 'computer-trans.png');
  addCharacter('loadCharacter("officer");', 'Police<br>Officer', 'police-trans.png');
  $('#otherDiv').fadeIn('slow', function() {});
}

function addCharacter(action, name, image) {
  var html = '<button type="button" class="character" onclick=\''+action+'\'>';
  html += "<img src='"+image+"' class='characterIcon'>";
  html += name;
  html += "</button>";
  id("otherDiv").innerHTML += html;
}

function reset() {
  loadCharacter(character);
}

function fadeCharacterSelect() {
  $("#body").fadeOut("slow", function() {
    showCharacterSelect();
  });
}

function showEndScreen(text) {
  $('#body').fadeOut('fast', function() {
    id('footer').innerHTML = '';
    id("otherDiv").innerHTML = "<div id='chooseText'>"+text+"</div>";
    addCharacter('fadeCharacterSelect();', 'Select<br>Character', 'person.png');
    addCharacter('reset();', 'Try<br>Again', 'restart.png');
    $('#otherDiv').fadeIn('slow', function() {});
  });
}

function gameOver() {
  showEndScreen("Game Over");
}

function win() {
  showEndScreen("You Win!");
}

function showStartScreen() {
  var html = "<div id='gameDesc'>";
  html += "<div id='gameTitle'>Welcome to Zombie Madness!</div>";
  html += "The year is 2016, and the zombie apocalypse is at hand. Any semblance ";
  html += "of order has disappeared, and it now looks hopeless, as anyone who has ";
  html += "so far attempted resistance has been turned into a mindless, flesh-eating ";
  html += "drone. Nobody knows how it started, though you, our protagonist, believe ";
  html += "that there is a cure within the creepy manor of lunatic scientist ";
  html += "Heinrich von Wafflestein. Now, it is up to you to choose your character... ";
  html += "and find the cure.</div>"
  html += "<button type='button' id='beginButton' onclick='showCharacterSelect();'>Begin</button>"
  id('otherDiv').innerHTML = html;
}
