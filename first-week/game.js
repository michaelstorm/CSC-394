var room = null;

function id(name) {
  return document.getElementById(name);
}

function enterPressed() {
  var text = id('commandInput').value;
  if (text == "north")
    gotoRoom(room.exits["north"]);
  else if (text == "reset")
    reset();
  id('commandInput').value = "";
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
  $('#body').fadeOut('fast', function() {
    var html = '<iframe name="roomFrame" id="roomFrame"></iframe>';
    id("body").innerHTML = html;
    prefix = name;
    loadRoomData("start", function() {
      $('#body').fadeIn('slow', function() {});
    });
  });
}

function showCharacterSelect() {
  id("body").innerHTML = "";
  addCharacter('officer', 'Police<br>Officer', 'police-trans.png');
  addCharacter('computer', 'Computer<br>Technician', 'computer-trans.png');
  addCharacter('husky', 'Siberian<br>Husky', 'paw-trans.png');
  addCharacter('security', 'Security<br>Guard', 'camera-trans.png');
}

function addCharacter(directory, name, image) {
  var html = '<button type="button" class="character" onclick=\'loadCharacter("'+directory+'");\'>';
  html += "<img src='"+image+"' class='characterIcon'>";
  html += name;
  html += "</button>";
  id("body").innerHTML += html;
}

function reset() {
  gotoRoom('first');
}
