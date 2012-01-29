(function() {
  var Key, addBeatLines, addKey, addOctave, beatWidth, createNote, ctrlPressed, defaultNoteColor, deselectNotes, fromX, getKeyTop, getPitch, hoverNote, hoveredNote, keyHeight, keyboard, keyboardMouseDown, keyboardWidth, keys, nextKeyPosition, note, noteBar, noteBarClicked, noteBarMouseDown, noteBarMouseOver, noteClicked, noteClickedMoved, noteHeightPercent, noteMouseDown, noteMouseOver, noteNum, removeNote, ribbonClicked, rightPosition, selectedNote, sendPlayRequest, snapGrid, snapPercent, unhoverNote, windowMouseOver;

  fromX = null;

  ribbonClicked = false;

  noteBarClicked = false;

  noteClicked = false;

  noteClickedMoved = false;

  ctrlPressed = false;

  snapPercent = .15;

  beatWidth = 50;

  keyHeight = 30;

  keyboardWidth = 10000;

  noteHeightPercent = .50;

  noteNum = 0;

  note = null;

  noteBar = null;

  rightPosition = null;

  selectedNote = null;

  hoveredNote = null;

  defaultNoteColor = "#D5D9DB";

  nextKeyPosition = 0;

  keyboard = null;

  keys = [];

  Key = (function() {

    function Key(pitch) {
      this.pitch = pitch;
      this.notes = [];
    }

    return Key;

  })();

  addKey = function(pitch) {
    var bgColor, borderColor, key, keyLine, textColor;
    if (pitch[pitch.length - 1] === "#") {
      bgColor = "#303030";
      textColor = "white";
      borderColor = "#D0D0D0";
    } else {
      bgColor = "#D0D0D0";
      textColor = "black";
      borderColor = "#303030";
    }
    key = "<div class='key'\n     style='\n            top: " + nextKeyPosition + "px;\n            background-color: " + bgColor + ";\n            color: " + textColor + ";\n            border-top: 1px solid " + borderColor + ";\n            border-bottom: 1px solid " + borderColor + ";\n     '>\n  " + pitch + "&nbsp;\n</div>";
    keyLine = "<div class='keyLine'\n     onmousedown='return false;'\n     style='\n            width: " + keyboardWidth + "px;\n            top: " + nextKeyPosition + "px;\n     '>\n</div>";
    nextKeyPosition += keyHeight;
    keyboard.append(keyLine);
    $('#keys').append(key);
    return keys.push(new Key(pitch));
  };

  addOctave = function(number) {
    addKey("b" + number);
    addKey("b" + number + "b/a" + number + "#");
    addKey("a" + number);
    addKey("a" + number + "b/g" + number + "#");
    addKey("g" + number);
    addKey("g" + number + "b/f" + number + "#");
    addKey("f" + number);
    addKey("e" + number);
    addKey("e" + number + "b/d" + number + "#");
    addKey("d" + number);
    addKey("d" + number + "b/c" + number + "#");
    return addKey("c" + number);
  };

  addBeatLines = function() {
    var height, html, left, line;
    left = 0;
    height = keyboard.height();
    html = "";
    while (left <= keyboardWidth) {
      line = "<div class='line'\n     style='\n            position: absolute;\n            width: 1px;\n            top: 0px;\n            height: " + height + "px;\n            margin: 0px;\n            background-color: black;\n            left: " + left + "px;\n     '>\n</div>";
      html += line;
      left += beatWidth;
    }
    return keyboard.append(html);
  };

  deselectNotes = function() {
    var leftNoteBar, rightNoteBar;
    if (selectedNote != null) {
      rightNoteBar = $(".rightNoteBar[note=\"" + (selectedNote.attr("note")) + "\"]");
      leftNoteBar = $(".leftNoteBar[note=\"" + (selectedNote.attr("note")) + "\"]");
      rightNoteBar.css("background-color", defaultNoteColor);
      leftNoteBar.css("background-color", defaultNoteColor);
      selectedNote.css("background-color", defaultNoteColor);
      return selectedNote = null;
    }
  };

  createNote = function(posX, posY, pitch) {
    var height, html, keyTop, left, noteTopMarginPercent, top, width;
    fromX = snapGrid(posX);
    ribbonClicked = true;
    noteNum++;
    keyTop = getKeyTop(posY);
    noteTopMarginPercent = (1.0 - noteHeightPercent) / 2;
    top = keyTop + (keyHeight * noteTopMarginPercent);
    height = keyHeight * noteHeightPercent;
    width = 0;
    left = fromX;
    html = "<div\n     class='note'\n     note='" + noteNum + "'\n     pitch='" + pitch + "'\n     style='\n            top: " + top + "px;\n            height: " + height + "px;\n            width: " + width + "px;\n            left: " + left + "px;\n     '>\n</div>";
    html += "<div class='rightNoteBar'\n     note='" + noteNum + "'\n     pitch='" + pitch + "'\n     side='right'\n     style='\n            top: " + keyTop + "px;\n            height: " + (keyHeight / 3) + "px;\n            left: " + ((left + width) - 2) + "px;\n            cursor: col-resize;\n     '>\n</div>";
    html += "<div class='leftNoteBar'\n     note='" + noteNum + "'\n     pitch='" + pitch + "'\n     side='left'\n     style='\n            top: " + ((keyTop + keyHeight) - keyHeight / 3) + "px;\n            height: " + (keyHeight / 3) + "px;\n            left: " + left + "px;\n            cursor: col-resize;\n     '>\n</div>";
    keyboard.append(html);
    note = $(".note[note=\"" + noteNum + "\"]");
    note.rightBar = $(".rightNoteBar[note=\"" + noteNum + "\"]");
    note.leftBar = $(".leftNoteBar[note=\"" + noteNum + "\"]");
    return hoverNote(note);
  };

  getKeyTop = function(position) {
    var positionMod;
    positionMod = position % keyHeight;
    return Math.floor(position / keyHeight) * keyHeight;
  };

  getPitch = function(top) {
    var index;
    index = Math.floor(top / keyHeight);
    return keys[index].pitch;
  };

  keyboardMouseDown = function(e) {
    var pitch, top;
    deselectNotes();
    top = e.pageY - keyboard.offset().top;
    pitch = getPitch(top);
    return createNote(e.pageX - keyboard.offset().left, top, pitch);
  };

  noteBarMouseDown = function(e) {
    var pitch;
    pitch = $(e.target).attr("pitch");
    fromX = snapGrid(e.pageX - keyboard.offset().left);
    noteBarClicked = true;
    noteBar = $(e.target);
    note = $(".note[note=\"" + (noteBar.attr("note")) + "\"]");
    if ((selectedNote != null) && note.attr("note") !== selectedNote.attr("note")) {
      deselectNotes();
    }
    if (noteBar.attr("side") === "left") {
      rightPosition = note.position().left + note.width();
    }
    return $("body").css("cursor", "col-resize");
  };

  noteMouseDown = function(e) {
    var pitch;
    pitch = $(e.target).attr("pitch");
    note = $(e.target);
    noteClicked = true;
    pitch = note.attr("pitch");
    if ((selectedNote != null) && note.attr("note") !== selectedNote.attr("note")) {
      deselectNotes();
    }
    fromX = e.pageX - keyboard.offset().left;
    return rightPosition = note.position().left + note.width();
  };

  removeNote = function(n) {
    n.rightBar.remove();
    n.leftBar.remove();
    return n.remove();
  };

  noteBarMouseOver = function(e) {
    if (!(noteClicked || noteBarClicked || ribbonClicked)) {
      if (hoveredNote != null) unhoverNote();
      return hoverNote($(".note[note=\"" + ($(e.target).attr("note")) + "\"]"));
    }
  };

  noteMouseOver = function(e) {
    if (!(noteClicked || noteBarClicked || ribbonClicked)) {
      if (hoveredNote != null) unhoverNote();
      return hoverNote($(e.target));
    }
  };

  windowMouseOver = function(e) {
    var targetClass;
    targetClass = $(e.target).attr("class");
    if (targetClass === "note") {
      return noteMouseOver(e);
    } else if (targetClass === "leftNoteBar" || targetClass === "rightNoteBar") {
      return noteBarMouseOver(e);
    } else {
      if (!(noteClicked || noteBarClicked || ribbonClicked) && (hoveredNote != null) && (note != null) && hoveredNote.attr("note") === note.attr("note")) {
        return unhoverNote();
      }
    }
  };

  hoverNote = function(n) {
    var highlightColor, leftNoteBar, rightNoteBar;
    hoveredNote = n;
    highlightColor = "white";
    if ((selectedNote != null) && selectedNote.attr("note") === hoveredNote.attr("note")) {
      highlightColor = "#2E9AFE";
    }
    hoveredNote.css("background-color", highlightColor);
    rightNoteBar = $(".rightNoteBar[note=\"" + (hoveredNote.attr("note")) + "\"]");
    leftNoteBar = $(".leftNoteBar[note=\"" + (hoveredNote.attr("note")) + "\"]");
    rightNoteBar.css("background-color", highlightColor);
    return leftNoteBar.css("background-color", highlightColor);
  };

  unhoverNote = function() {
    var defaultColor, leftNoteBar, rightNoteBar;
    defaultColor = defaultNoteColor;
    if ((selectedNote != null) && selectedNote.attr("note") === hoveredNote.attr("note")) {
      defaultColor = "blue";
    }
    hoveredNote.css("background-color", defaultColor);
    rightNoteBar = $(".rightNoteBar[note=\"" + (hoveredNote.attr("note")) + "\"]");
    leftNoteBar = $(".leftNoteBar[note=\"" + (hoveredNote.attr("note")) + "\"]");
    rightNoteBar.css("background-color", defaultColor);
    return leftNoteBar.css("background-color", defaultColor);
  };

  snapGrid = function(position) {
    var positionMod;
    positionMod = position % beatWidth;
    if (positionMod < 10) {
      return Math.floor(position / beatWidth) * beatWidth;
    } else if (positionMod > beatWidth - 10) {
      return Math.ceil(position / beatWidth) * beatWidth;
    } else {
      return position;
    }
  };

  sendPlayRequest = function(data, success) {
    return $.ajax({
      type: "POST",
      url: "play/",
      processData: false,
      data: "notes=" + data,
      dataType: "text"
    }).done(function(msg) {
      return success(msg);
    }).fail(function(jqXHR, msg, x) {
      return alert("Error type: " + msg + "\nMessage: " + x);
    });
  };

  $(window).load(function() {
    var i, oldPlayMethod;
    keyboard = $("#keyboard");
    i = 0;
    while (i < 8) {
      addOctave(i);
      i++;
    }
    keyboard.css("height", nextKeyPosition + "px");
    keyboard.css("width", keyboardWidth + "px");
    addBeatLines();
    $("#content").jScrollPane();
    $("#player").jPlayer({
      cssSelectorAncestor: "#jp_container_1",
      cssSelector: {
        videoPlay: ".jp-video-play",
        play: ".jp-play",
        pause: ".jp-pause",
        stop: ".jp-stop",
        seekBar: ".jp-seek-bar",
        playBar: ".jp-play-bar",
        mute: ".jp-mute",
        unmute: ".jp-unmute",
        volumeBar: ".jp-volume-bar",
        volumeBarValue: ".jp-volume-bar-value",
        volumeMax: ".jp-volume-max",
        currentTime: ".jp-current-time",
        duration: ".jp-duration",
        fullScreen: ".jp-full-screen",
        restoreScreen: ".jp-restore-screen",
        repeat: ".jp-repeat",
        repeatOff: ".jp-repeat-off",
        gui: ".jp-gui",
        noSolution: ".jp-no-solution"
      },
      swfPath: "/static",
      supplied: "mp3"
    });
    oldPlayMethod = $.jPlayer.prototype.play;
    $.jPlayer.prototype.play = function(time) {
      var data, obj;
      this.oldPlayMethod = oldPlayMethod;
      data = "{ \"notes\": [";
      $(".note").each(function(i, n) {
        data += "{\n  \"pitch\": \"" + ($(n).attr("pitch")) + "\",\n  \"start\": " + ($(n).position().left / beatWidth) + ",\n  \"duration\": " + ($(n).width() / beatWidth) + "\n}";
        if (i < $(".note").size() - 1) return data += ", ";
      });
      data += "] }";
      obj = this;
      return sendPlayRequest(data, function(msg) {
        $("#player").jPlayer("setMedia", {
          mp3: "/output/" + msg + "/"
        });
        return obj.oldPlayMethod();
      });
    };
    $(window).keydown(function(e) {
      if ((selectedNote != null) && (e.which === 8 || e.which === 46)) {
        removeNote(selectedNote);
        selectedNote = null;
      }
      if (e.which === 17) return ctrlPressed = true;
    });
    $(window).keyup(function(e) {
      if (e.which === 17) return ctrlPressed = false;
    });
    $(window).mouseover(function(e) {
      return windowMouseOver(e);
    });
    keyboard.mousedown(function(e) {
      var targetClass;
      targetClass = $(e.target).attr("class");
      if (targetClass === "leftNoteBar" || targetClass === "rightNoteBar") {
        return noteBarMouseDown(e);
      } else if (targetClass === "note") {
        return noteMouseDown(e);
      } else {
        return keyboardMouseDown(e);
      }
    });
    $(window).mouseup(function(e) {
      if (ribbonClicked || noteBarClicked || noteClicked) {
        if ((noteClicked || noteBarClicked) && !noteClickedMoved) {
          selectedNote = note;
        } else {
          noteClickedMoved = false;
        }
        if (note.width() === 0) {
          removeNote(note);
          note = null;
        }
        $("body").css("cursor", "auto");
        ribbonClicked = false;
        noteBarClicked = false;
        noteClicked = false;
        if ((noteClicked || noteBarClicked || ribbonClicked) && ((hoveredNote != null) && hoveredNote.attr("note") !== $(e.target).attr("note"))) {
          unhoverNote();
        }
        return windowMouseOver(e);
      }
    });
    return $(window).mousemove(function(e) {
      var left, leftNoteBar, rightNoteBar, toX, width;
      if (ribbonClicked || noteBarClicked || noteClicked) {
        noteClickedMoved = true;
        toX = e.pageX - keyboard.offset().left;
        if (noteClicked) toX = toX - (note.width() - (rightPosition - fromX));
        if (!ctrlPressed) toX = snapGrid(toX);
        if (ribbonClicked) {
          width = toX - fromX;
          if (width >= 0) {
            left = fromX;
          } else {
            left = toX;
            width = Math.abs(width);
          }
          if (left + width > keyboardWidth) {
            width = keyboardWidth - fromX;
          } else if (left < 0) {
            left = 0;
            width = fromX;
          }
        } else if (noteBarClicked) {
          if (noteBar.attr("side") === "right") {
            width = toX - note.position().left;
            left = note.position().left;
            if (width < 0) width = 0;
            if (left + width > keyboardWidth) {
              width = keyboardWidth - note.position().left;
            }
          } else {
            width = (note.position().left + note.width()) - toX;
            if (width >= 0) {
              left = toX;
            } else {
              left = note.position().left + note.width();
              width = 0;
            }
            if (left < 0) {
              left = 0;
              width = note.width();
            }
          }
        } else {
          left = toX;
          width = note.width();
          if (left + width > keyboardWidth) {
            left = keyboardWidth - width;
          } else if (left < 0) {
            left = 0;
          }
          $("body").css("cursor", "move");
        }
        note.css("left", left + "px");
        note.css("width", width + "px");
        rightNoteBar = $(".rightNoteBar[note=\"" + (note.attr("note")) + "\"]");
        leftNoteBar = $(".leftNoteBar[note=\"" + (note.attr("note")) + "\"]");
        leftNoteBar.css("left", left + "px");
        return rightNoteBar.css("left", (left + width - rightNoteBar.width()) + "px");
      }
    });
  });

}).call(this);
