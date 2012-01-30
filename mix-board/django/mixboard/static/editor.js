(function() {
  var Key, addBeatLines, addKey, addOctave, beatWidth, constructKeyboard, createNote, ctrlPressed, deselectNotes, fromX, getKeyTop, getPitch, hoverNote, hoveredNote, keyHeight, keyboard, keyboardMouseDown, keyboardWidth, keys, nextKeyPosition, note, noteBar, noteBarClicked, noteBarMouseDown, noteBarMouseOver, noteClicked, noteClickedMoved, noteColor, noteHeightPercent, noteHoverColor, noteMouseDown, noteMouseOver, noteNum, noteSelectedColor, noteSelectedHoverColor, removeNote, ribbonClicked, rightPosition, selectedNote, sendPlayRequest, snapGrid, snapPercent, unhoverNote, windowMouseOver;

  fromX = null;

  ribbonClicked = false;

  noteBarClicked = false;

  noteClicked = false;

  noteClickedMoved = false;

  ctrlPressed = false;

  snapPercent = .15;

  beatWidth = 50;

  keyHeight = 30;

  keyboardWidth = 100000;

  noteHeightPercent = .50;

  noteNum = 0;

  note = null;

  noteBar = null;

  rightPosition = null;

  selectedNote = null;

  hoveredNote = null;

  noteColor = editorCSS['.note']['background-color'];

  noteHoverColor = editorCSS['.note']['-mb-hover-color'];

  noteSelectedColor = editorCSS['.note']['-mb-selected-color'];

  noteSelectedHoverColor = editorCSS['.note']['-mb-selected-hover-color'];

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
    keys.push(new Key(pitch));
    return [key, keyLine];
  };

  addOctave = function(number) {
    var appendKey, key, keyHtml, keyLine, keyLineHtml, _ref, _ref10, _ref11, _ref12, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
    keyHtml = '';
    keyLineHtml = '';
    appendKey = function(key, keyLine) {
      keyHtml += key;
      return keyLineHtml += keyLine;
    };
    _ref = addKey("b" + number), key = _ref[0], keyLine = _ref[1];
    appendKey(key, keyLine);
    _ref2 = addKey("b" + number + "b/a" + number + "#"), key = _ref2[0], keyLine = _ref2[1];
    appendKey(key, keyLine);
    _ref3 = addKey("a" + number), key = _ref3[0], keyLine = _ref3[1];
    appendKey(key, keyLine);
    _ref4 = addKey("a" + number + "b/g" + number + "#"), key = _ref4[0], keyLine = _ref4[1];
    appendKey(key, keyLine);
    _ref5 = addKey("g" + number), key = _ref5[0], keyLine = _ref5[1];
    appendKey(key, keyLine);
    _ref6 = addKey("g" + number + "b/f" + number + "#"), key = _ref6[0], keyLine = _ref6[1];
    appendKey(key, keyLine);
    _ref7 = addKey("f" + number), key = _ref7[0], keyLine = _ref7[1];
    appendKey(key, keyLine);
    _ref8 = addKey("e" + number), key = _ref8[0], keyLine = _ref8[1];
    appendKey(key, keyLine);
    _ref9 = addKey("e" + number + "b/d" + number + "#"), key = _ref9[0], keyLine = _ref9[1];
    appendKey(key, keyLine);
    _ref10 = addKey("d" + number), key = _ref10[0], keyLine = _ref10[1];
    appendKey(key, keyLine);
    _ref11 = addKey("d" + number + "b/c" + number + "#"), key = _ref11[0], keyLine = _ref11[1];
    appendKey(key, keyLine);
    _ref12 = addKey("c" + number), key = _ref12[0], keyLine = _ref12[1];
    appendKey(key, keyLine);
    return [keyHtml, keyLineHtml];
  };

  addBeatLines = function() {
    var height, html, left, line;
    left = 0;
    height = keyboard.height();
    html = "";
    while (left <= keyboardWidth) {
      line = "<div class='line'\n     style='\n            height: " + height + "px;\n            left: " + left + "px;\n     '>\n</div>";
      html += line;
      left += beatWidth;
    }
    return keyboard.append(html);
  };

  constructKeyboard = function() {
    var appendOctave, i, key, keyHtml, keyLine, keyLineHtml, _ref;
    keyHtml = '';
    keyLineHtml = '';
    appendOctave = function(key, keyLine) {
      keyHtml += key;
      return keyLineHtml += keyLine;
    };
    i = 0;
    while (i < 8) {
      _ref = addOctave(i), key = _ref[0], keyLine = _ref[1];
      appendOctave(key, keyLine);
      i++;
    }
    keyboard.append(keyLineHtml);
    $('#keys').append(keyHtml);
    keyboard.css("height", nextKeyPosition + "px");
    keyboard.css("width", keyboardWidth + "px");
    return addBeatLines();
  };

  deselectNotes = function() {
    if (selectedNote != null) {
      selectedNote.css("background-color", noteColor);
      selectedNote.data('rightBar').css("background-color", noteColor);
      selectedNote.data('leftBar').css("background-color", noteColor);
      return selectedNote = null;
    }
  };

  createNote = function(posX, posY, pitch) {
    var height, html, keyTop, left, leftNoteBar, noteTopMarginPercent, rightNoteBar, top, width;
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
    html += "<div class='noteBar'\n     note='" + noteNum + "'\n     pitch='" + pitch + "'\n     side='right'\n     style='\n            top: " + keyTop + "px;\n            height: " + (keyHeight / 3) + "px;\n            left: " + ((left + width) - 2) + "px;\n     '>\n</div>";
    html += "<div class='noteBar'\n     note='" + noteNum + "'\n     pitch='" + pitch + "'\n     side='left'\n     style='\n            top: " + ((keyTop + keyHeight) - keyHeight / 3) + "px;\n            height: " + (keyHeight / 3) + "px;\n            left: " + left + "px;\n     '>\n</div>";
    keyboard.append(html);
    note = $(".note[note=\"" + noteNum + "\"]");
    rightNoteBar = $(".noteBar[note=\"" + noteNum + "\"][side=\"right\"]");
    rightNoteBar.data('note', note);
    note.data('rightBar', rightNoteBar);
    leftNoteBar = $(".noteBar[note=\"" + noteNum + "\"][side=\"left\"]");
    leftNoteBar.data('note', note);
    note.data('leftBar', leftNoteBar);
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
    note = noteBar.data('note');
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
    n.data('rightBar').remove();
    n.data('leftBar').remove();
    return n.remove();
  };

  noteBarMouseOver = function(e) {
    if (!(noteClicked || noteBarClicked || ribbonClicked)) {
      if (hoveredNote != null) unhoverNote();
      return hoverNote($(e.target).data('note'));
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
    } else if (targetClass === "noteBar") {
      return noteBarMouseOver(e);
    } else if (!(noteClicked || noteBarClicked || ribbonClicked) && (hoveredNote != null) && (note != null) && hoveredNote.attr("note") === note.attr("note")) {
      return unhoverNote();
    }
  };

  hoverNote = function(n) {
    var color;
    hoveredNote = n;
    if ((selectedNote != null) && selectedNote.attr("note") === hoveredNote.attr("note")) {
      color = noteSelectedHoverColor;
    } else {
      color = noteHoverColor;
    }
    hoveredNote.css("background-color", color);
    hoveredNote.data('rightBar').css("background-color", color);
    return hoveredNote.data('leftBar').css("background-color", color);
  };

  unhoverNote = function() {
    var color;
    if ((selectedNote != null) && selectedNote.attr("note") === hoveredNote.attr("note")) {
      color = noteSelectedColor;
    } else {
      color = noteColor;
    }
    hoveredNote.css("background-color", color);
    hoveredNote.data('rightBar').css("background-color", color);
    return hoveredNote.data('leftBar').css("background-color", color);
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
    var oldPlayMethod;
    keyboard = $("#keyboard");
    constructKeyboard();
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
      if (targetClass === "noteBar") {
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
      var left, toX, width;
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
        note.data('leftBar').css("left", left + "px");
        return note.data('rightBar').css("left", (left + width - note.data('rightBar').width()) + "px");
      }
    });
  });

}).call(this);
