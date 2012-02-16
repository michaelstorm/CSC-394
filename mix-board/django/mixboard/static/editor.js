(function() {
  var IntervalTree, IntervalTreeItem, Key, Mixer, ctrlPressed, mixer, noteColor, noteHoverColor, noteSelectedColor, noteSelectedHoverColor, sendPlayRequest;

  ctrlPressed = false;

  noteColor = editorCSS['.note']['background-color'];

  noteHoverColor = editorCSS['.note']['-mb-hover-color'];

  noteSelectedColor = editorCSS['.note']['-mb-selected-color'];

  noteSelectedHoverColor = editorCSS['.note']['-mb-selected-hover-color'];

  IntervalTreeItem = (function() {

    function IntervalTreeItem(data, begin, width) {
      this.data = data;
      this.begin = begin;
      this.width = width;
    }

    return IntervalTreeItem;

  })();

  IntervalTree = (function() {

    function IntervalTree(root) {
      this.root = root;
      if (this.root != null) this.width = this.root.width;
    }

    IntervalTree.prototype.addInterval = function(item) {
      if (!(this.root != null)) {
        return this.root = item;
      } else if (item.begin < this.root.begin) {
        if (this.root.left != null) {
          this.root.left.addInterval(item);
        } else {
          this.root.left = new IntervalTree(item);
        }
        return this.width = this.root.left.width;
      }
    };

    return IntervalTree;

  })();

  Key = (function() {

    function Key(pitch, top) {
      this.pitch = pitch;
      this.top = top;
      this.notes = [];
    }

    Key.prototype.addNoteAtPosition = function(note) {
      return this.notes.push(note);
    };

    return Key;

  })();

  Mixer = (function() {

    Mixer.prototype.reset = function() {
      var _this = this;
      this.fromX = null;
      this.keyboardClicked = false;
      this.noteClicked = false;
      this.noteClickedMoved = false;
      this.nextNoteNumber = 0;
      this.activeNote = null;
      this.clickedNoteBar = null;
      this.rightPosition = null;
      this.selectedNote = null;
      this.hoveredNote = null;
      return $('.note').each(function(i, note) {
        return _this.removeNote($(note));
      });
    };

    function Mixer() {
      var _this = this;
      this.beatWidth = 50;
      this.nextKeyPosition = 0;
      this.keyboard = null;
      this.keys = [];
      this.keysByPitch = {};
      this.keyboardWidth = 100000;
      this.keyHeight = 30;
      this.noteHeightPercent = .50;
      this.reset();
      $(window).bind('load', function() {
        var songData;
        _this.readOnly = $('#readOnly').length > 0;
        _this.songId = $('#songId').text();
        _this.songName = $('#songName').text();
        _this.constructEditButtons();
        _this.constructKeyboard();
        _this.constructJPlayer();
        if (!_this.readOnly) _this.attachInputHandlers();
        songData = $('#songData').text();
        _this.setSongJSON(songData);
        if (_this.readOnly) {
          $('#voteUpButton').click(function(e) {
            var postData;
            postData = {
              'song': $('#songId').html()
            };
            return $.post('/song/vote/up/', postData, function(response) {
              if (response === 'success') {
                return $('#voteCount').html(parseInt($('#voteCount').html()) + 1);
              } else {
                return alert(response);
              }
            });
          });
          return $('#voteDownButton').click(function(e) {
            var postData;
            postData = {
              'song': $('#songId').html()
            };
            return $.post('/song/vote/down/', postData, function(response) {
              if (response === 'success') {
                return $('#voteCount').html(parseInt($('#voteCount').html()) - 1);
              } else {
                return alert(response);
              }
            });
          });
        }
      });
    }

    /*
      DOM construction and event handling setup
    */

    Mixer.prototype.constructEditButtons = function() {
      var _this = this;
      if (this.readOnly) {
        return $('#editButton').click(function() {
          return window.location.href = "/song/edit/" + _this.songId + "/";
        });
      } else {
        $('#saveButton').click(function() {
          var postData;
          if (_this.songName.length === 0) {
            $('#saveSongDialog').modal();
          } else {
            postData = {
              'id': _this.songId,
              'data': _this.getSongJSON()
            };
            $.post("/song/update/", postData, function(response) {
              if (response !== 'success') return alert(response);
            });
          }
          return false;
        });
        $('#saveAsButton').click(function() {
          $('#saveSongDialog').modal();
          return false;
        });
        $('#openButton').click(function() {
          $('#openSongDialog').modal();
          $.get('/song/list/', function(response) {
            var buttons, songs;
            songs = eval('(' + response + ')');
            buttons = '';
            $.each(songs['songs'], function(i, song) {
              return buttons += "<button type='button' class='openSongChoice' songId='" + song['id'] + "'>" + song['name'] + "</button>";
            });
            buttons += '';
            $('#openSongScroll').html(buttons);
            $('#openSongScroll').jScrollPane();
            return $('.openSongChoice').click(function(e) {
              $.get("/song/get/" + ($(e.target).attr('songId')) + "/", function(data) {
                return _this.setSongJSON(data);
              });
              return $.modal.close();
            });
          });
          return false;
        });
        return $('#saveSongForm').submit(function(e) {
          var name, postData;
          e.preventDefault();
          name = $('#saveSongName').val();
          postData = {
            'name': name,
            'data': _this.getSongJSON()
          };
          return $.post('/song/save/', postData, function(response) {
            if (response.search(/\d+/) !== -1) {
              _this.songId = response;
              _this.songName = name;
              if ((typeof history !== "undefined" && history !== null ? history.replaceState : void 0) != null) {
                history.replaceState(null, "Edit song " + songName, "/song/edit/" + _this.songId + "/");
              }
              document.title = "Mixboard : edit : " + _this.songName;
              return $.modal.close();
            } else {
              return $('#saveSongError').html(response);
            }
          });
        });
      }
    };

    Mixer.prototype.attachInputHandlers = function() {
      var _this = this;
      $(window).keydown(function(e) {
        return _this.windowKeyDown(e);
      });
      $(window).keyup(function(e) {
        return _this.windowKeyUp(e);
      });
      $(window).mousedown(function(e) {
        return _this.windowMouseDown(e);
      });
      $(window).mouseup(function(e) {
        return _this.windowMouseUp(e);
      });
      $(window).mousemove(function(e) {
        return _this.windowMouseMove(e);
      });
      return $(window).mouseover(function(e) {
        return _this.windowMouseOver(e);
      });
    };

    Mixer.prototype.constructJPlayer = function() {
      var mixerObject, oldPlayMethod;
      $("#player").jPlayer({
        cssSelectorAncestor: "#jp_container_1",
        swfPath: "/static",
        supplied: "mp3"
      });
      mixerObject = this;
      oldPlayMethod = $.jPlayer.prototype.play;
      return $.jPlayer.prototype.play = function(time) {
        var data, obj;
        $('#play-status').html('Processing song...');
        this.oldPlayMethod = oldPlayMethod;
        obj = this;
        data = mixerObject.getSongJSON();
        return sendPlayRequest(data, function(msg) {
          $("#player").jPlayer("setMedia", {
            mp3: "/output/" + msg + "/"
          });
          $('#play-status').html('Playing song...');
          return obj.oldPlayMethod();
        });
      };
    };

    Mixer.prototype.addBeatLines = function() {
      var height, html, left, line;
      left = 0;
      height = this.keyboard.height();
      html = "";
      while (left <= this.keyboardWidth) {
        line = "<div class='line'\n     style='\n            height: " + height + "px;\n            left:   " + left + "px;\n     '>\n</div>";
        html += line;
        left += this.beatWidth;
      }
      return this.keyboard.append(html);
    };

    Mixer.prototype.createKey = function(pitch) {
      var bgColor, borderColor, key, keyLine, keyObject, textColor;
      if (pitch[pitch.length - 1] === "#") {
        bgColor = editorCSS['.key']['-mb-dark-background-color'];
        textColor = editorCSS['.key']['-mb-dark-text-color'];
        borderColor = editorCSS['.key']['-mb-dark-border-color'];
      } else {
        bgColor = editorCSS['.key']['-mb-light-background-color'];
        textColor = editorCSS['.key']['-mb-light-text-color'];
        borderColor = editorCSS['.key']['-mb-light-border-color'];
      }
      key = "<div class='key'\n     style='\n            top:              " + this.nextKeyPosition + "px;\n            background-color: " + bgColor + ";\n            color:            " + textColor + ";\n            border-top: 1px solid    " + borderColor + ";\n            border-bottom: 1px solid " + borderColor + ";\n     '>\n  " + pitch + "&nbsp;\n</div>";
      keyLine = "<div class='keyLine'\n     onmousedown='return false;'\n     style='\n            width: " + this.keyboardWidth + "px;\n            top:   " + this.nextKeyPosition + "px;\n     '>\n</div>";
      keyObject = new Key(pitch, this.nextKeyPosition);
      this.nextKeyPosition += this.keyHeight;
      this.keys.push(keyObject);
      this.keysByPitch[pitch] = keyObject;
      return [key, keyLine];
    };

    Mixer.prototype.createOctave = function(number) {
      var appendKey, key, keyHtml, keyLine, keyLineHtml, _ref, _ref10, _ref11, _ref12, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
      keyHtml = '';
      keyLineHtml = '';
      appendKey = function(key, keyLine) {
        keyHtml += key;
        return keyLineHtml += keyLine;
      };
      _ref = this.createKey("b" + number), key = _ref[0], keyLine = _ref[1];
      appendKey(key, keyLine);
      _ref2 = this.createKey("b" + number + "b/a" + number + "#"), key = _ref2[0], keyLine = _ref2[1];
      appendKey(key, keyLine);
      _ref3 = this.createKey("a" + number), key = _ref3[0], keyLine = _ref3[1];
      appendKey(key, keyLine);
      _ref4 = this.createKey("a" + number + "b/g" + number + "#"), key = _ref4[0], keyLine = _ref4[1];
      appendKey(key, keyLine);
      _ref5 = this.createKey("g" + number), key = _ref5[0], keyLine = _ref5[1];
      appendKey(key, keyLine);
      _ref6 = this.createKey("g" + number + "b/f" + number + "#"), key = _ref6[0], keyLine = _ref6[1];
      appendKey(key, keyLine);
      _ref7 = this.createKey("f" + number), key = _ref7[0], keyLine = _ref7[1];
      appendKey(key, keyLine);
      _ref8 = this.createKey("e" + number), key = _ref8[0], keyLine = _ref8[1];
      appendKey(key, keyLine);
      _ref9 = this.createKey("e" + number + "b/d" + number + "#"), key = _ref9[0], keyLine = _ref9[1];
      appendKey(key, keyLine);
      _ref10 = this.createKey("d" + number), key = _ref10[0], keyLine = _ref10[1];
      appendKey(key, keyLine);
      _ref11 = this.createKey("d" + number + "b/c" + number + "#"), key = _ref11[0], keyLine = _ref11[1];
      appendKey(key, keyLine);
      _ref12 = this.createKey("c" + number), key = _ref12[0], keyLine = _ref12[1];
      appendKey(key, keyLine);
      return [keyHtml, keyLineHtml];
    };

    Mixer.prototype.constructKeyboard = function() {
      var appendOctave, i, key, keyHtml, keyLine, keyLineHtml, _ref;
      this.keyboard = $("#keyboard");
      keyHtml = '';
      keyLineHtml = '';
      appendOctave = function(key, keyLine) {
        keyHtml += key;
        return keyLineHtml += keyLine;
      };
      i = 0;
      while (i < 8) {
        _ref = this.createOctave(i), key = _ref[0], keyLine = _ref[1];
        appendOctave(key, keyLine);
        i++;
      }
      this.keyboard.append(keyLineHtml);
      $('#keys').append(keyHtml);
      this.keyboard.css("height", this.nextKeyPosition + "px");
      this.keyboard.css("width", this.keyboardWidth + "px");
      this.addBeatLines();
      return $("#content").jScrollPane();
    };

    Mixer.prototype.deselectNotes = function() {
      if (this.selectedNote != null) {
        this.selectedNote.css("background-color", noteColor);
        this.selectedNote.data('rightBar').css("background-color", noteColor);
        this.selectedNote.data('leftBar').css("background-color", noteColor);
        return this.selectedNote = null;
      }
    };

    Mixer.prototype.addNoteAtPosition = function(posX, posY) {
      var key, note;
      this.fromX = this.getSnappedToGrid(posX);
      this.keyboardClicked = true;
      key = this.getKey(posY);
      note = this.addNote(key, this.fromX, 0);
      this.hoverNote(note);
      return this.activeNote = note;
    };

    Mixer.prototype.addNote = function(key, left, width) {
      var height, html, leftNoteBar, note, noteTopMarginPercent, rightNoteBar, top;
      noteTopMarginPercent = (1.0 - this.noteHeightPercent) / 2;
      top = key.top + (this.keyHeight * noteTopMarginPercent);
      height = this.keyHeight * this.noteHeightPercent;
      html = "<div\n     class='note'\n     note= '" + this.nextNoteNumber + "'\n     pitch='" + key.pitch + "'\n     style='\n            top:    " + top + "px;\n            height: " + height + "px;\n            width:  " + width + "px;\n            left:   " + left + "px;\n     '>\n</div>";
      html += "<div class='noteBar'\n     note= '" + this.nextNoteNumber + "'\n     pitch='" + key.pitch + "'\n     side='right'\n     style='\n            top:    " + key.top + "px;\n            height: " + (this.keyHeight / 3) + "px;\n            left:   " + ((left + width) - 2) + "px;\n     '>\n</div>";
      html += "<div class='noteBar'\n     note='" + this.nextNoteNumber + "'\n     pitch='" + key.pitch + "'\n     side='left'\n     style='\n            top:    " + ((key.top + this.keyHeight) - this.keyHeight / 3) + "px;\n            height: " + (this.keyHeight / 3) + "px;\n            left:   " + left + "px;\n     '>\n</div>";
      this.keyboard.append(html);
      note = $(".note[note=\"" + this.nextNoteNumber + "\"]");
      key.addNoteAtPosition(note);
      rightNoteBar = $(".noteBar[note=\"" + this.nextNoteNumber + "\"][side=\"right\"]");
      rightNoteBar.data('note', note);
      note.data('rightBar', rightNoteBar);
      leftNoteBar = $(".noteBar[note=\"" + this.nextNoteNumber + "\"][side=\"left\"]");
      leftNoteBar.data('note', note);
      note.data('leftBar', leftNoteBar);
      this.nextNoteNumber++;
      return note;
    };

    /*
      Input handlers
    */

    Mixer.prototype.windowKeyDown = function(e) {
      if ((this.selectedNote != null) && (e.which === 8 || e.which === 46)) {
        this.removeNote(this.selectedNote);
        this.selectedNote = null;
      }
      if (e.which === 17) return ctrlPressed = true;
    };

    Mixer.prototype.windowKeyUp = function(e) {
      if (e.which === 17) return ctrlPressed = false;
    };

    Mixer.prototype.windowMouseDown = function(e) {
      var targetClass, targetId;
      targetClass = $(e.target).attr("class");
      targetId = $(e.target).attr("id");
      switch (targetClass) {
        case "noteBar":
          return this.noteBarMouseDown(e);
        case "note":
          return this.noteMouseDown(e);
        case "line":
        case "keyLine":
          return this.keyboardMouseDown(e);
        default:
          if ((targetId != null) && targetId === "keyboard") {
            return this.keyboardMouseDown(e);
          }
      }
    };

    Mixer.prototype.windowMouseUp = function(e) {
      if (this.keyboardClicked || (this.clickedNoteBar != null) || this.noteClicked) {
        if ((this.noteClicked || (this.clickedNoteBar != null)) && !this.noteClickedMoved) {
          this.selectedNote = this.activeNote;
        } else {
          this.noteClickedMoved = false;
        }
        if (this.activeNote.width() === 0) {
          this.removeNote(this.activeNote);
          this.activeNote = null;
        }
        $("body").css("cursor", "auto");
        this.keyboardClicked = false;
        this.noteClicked = false;
        this.clickedNoteBar = null;
        this.activeNote = null;
        if ((this.hoveredNote != null) && this.hoveredNote.attr("note") !== $(e.target).attr("note")) {
          this.unhoverNote();
        }
        return this.windowMouseOver(e);
      }
    };

    Mixer.prototype.windowMouseMove = function(e) {
      var left, toX, width;
      if (this.keyboardClicked || (this.clickedNoteBar != null) || this.noteClicked) {
        this.noteClickedMoved = true;
        toX = e.pageX - this.keyboard.offset().left;
        if (this.noteClicked) {
          toX = toX - (this.activeNote.width() - (this.rightPosition - this.fromX));
        }
        if (!ctrlPressed) toX = this.getSnappedToGrid(toX);
        if (this.keyboardClicked) {
          width = toX - this.fromX;
          if (width >= 0) {
            left = this.fromX;
          } else {
            left = toX;
            width = Math.abs(width);
          }
          if (left + width > this.keyboardWidth) {
            width = this.keyboardWidth - this.fromX;
          } else if (left < 0) {
            left = 0;
            width = this.fromX;
          }
        } else if (this.clickedNoteBar != null) {
          if (this.clickedNoteBar.attr("side") === "right") {
            width = toX - this.activeNote.position().left;
            left = this.activeNote.position().left;
            if (width < 0) width = 0;
            if (left + width > this.keyboardWidth) {
              width = this.keyboardWidth - this.activeNote.position().left;
            }
          } else {
            width = (this.activeNote.position().left + this.activeNote.width()) - toX;
            if (width >= 0) {
              left = toX;
            } else {
              left = this.activeNote.position().left + this.activeNote.width();
              width = 0;
            }
            if (left < 0) {
              left = 0;
              width = this.activeNote.width();
            }
          }
        } else {
          left = toX;
          width = this.activeNote.width();
          if (left + width > this.keyboardWidth) {
            left = this.keyboardWidth - width;
          } else if (left < 0) {
            left = 0;
          }
          $("body").css("cursor", "move");
        }
        this.activeNote.css("width", width + "px");
        this.activeNote.css("left", left + "px");
        this.activeNote.data('leftBar').css("left", left + "px");
        return this.activeNote.data('rightBar').css("left", (left + width - this.activeNote.data('rightBar').width()) + "px");
      }
    };

    Mixer.prototype.windowMouseOver = function(e) {
      var targetClass;
      targetClass = $(e.target).attr("class");
      if (targetClass === "note") {
        return this.noteMouseOver(e);
      } else if (targetClass === "noteBar") {
        return this.noteBarMouseOver(e);
      } else {
        if ((this.hoveredNote != null) && (!(this.noteClicked || (this.clickedNoteBar != null) || this.keyboardClicked))) {
          if ((!(this.activeNote != null)) || this.hoveredNote.attr("note") !== this.activeNote.attr("note")) {
            return this.unhoverNote();
          }
        }
      }
    };

    Mixer.prototype.keyboardMouseDown = function(e) {
      var top;
      this.deselectNotes();
      top = e.pageY - this.keyboard.offset().top;
      return this.addNoteAtPosition(e.pageX - this.keyboard.offset().left, top);
    };

    Mixer.prototype.noteMouseDown = function(e) {
      var pitch;
      pitch = $(e.target).attr("pitch");
      this.activeNote = $(e.target);
      this.noteClicked = true;
      pitch = this.activeNote.attr("pitch");
      if ((this.selectedNote != null) && this.activeNote.attr("note") !== this.selectedNote.attr("note")) {
        this.deselectNotes();
      }
      this.fromX = e.pageX - this.keyboard.offset().left;
      return this.rightPosition = this.activeNote.position().left + this.activeNote.width();
    };

    Mixer.prototype.noteMouseOver = function(e) {
      if (!(this.noteClicked || (this.clickedNoteBar != null) || this.keyboardClicked)) {
        if (this.hoveredNote != null) this.unhoverNote();
        return this.hoverNote($(e.target));
      }
    };

    Mixer.prototype.noteBarMouseDown = function(e) {
      var pitch;
      pitch = $(e.target).attr("pitch");
      this.fromX = this.getSnappedToGrid(e.pageX - this.keyboard.offset().left);
      this.clickedNoteBar = $(e.target);
      this.activeNote = this.clickedNoteBar.data('note');
      if ((this.selectedNote != null) && this.activeNote.attr("note") !== this.selectedNote.attr("note")) {
        this.deselectNotes();
      }
      if (this.clickedNoteBar.attr("side") === "left") {
        this.rightPosition = this.activeNote.position().left + this.activeNote.width();
      }
      return $("body").css("cursor", "col-resize");
    };

    Mixer.prototype.noteBarMouseOver = function(e) {
      if (!(this.noteClicked || (this.clickedNoteBar != null) || this.keyboardClicked)) {
        if (this.hoveredNote != null) this.unhoverNote();
        return this.hoverNote($(e.target).data('note'));
      }
    };

    /*
      Accessor and query methods that do not modify state
    */

    Mixer.prototype.getKey = function(top) {
      var index;
      index = Math.floor(top / this.keyHeight);
      return this.keys[index];
    };

    Mixer.prototype.getSnappedToGrid = function(position) {
      var positionMod;
      positionMod = position % this.beatWidth;
      if (positionMod < 10) {
        return Math.floor(position / this.beatWidth) * this.beatWidth;
      } else if (positionMod > this.beatWidth - 10) {
        return Math.ceil(position / this.beatWidth) * this.beatWidth;
      } else {
        return position;
      }
    };

    Mixer.prototype.getSongJSON = function() {
      var data, mixerObject,
        _this = this;
      data = "{ \"notes\": [";
      mixerObject = this;
      $(".note").each(function(i, n) {
        data += "{\n  \"pitch\":   \"" + ($(n).attr("pitch")) + "\",\n  \"start\":    " + ($(n).position().left / _this.beatWidth) + ",\n  \"duration\": " + ($(n).width() / _this.beatWidth) + "\n}";
        if (i < $(".note").size() - 1) return data += ", ";
      });
      return data += "] }";
    };

    Mixer.prototype.setSongJSON = function(data) {
      var json,
        _this = this;
      this.reset();
      if (data.length > 0) {
        json = eval("(" + data + ")");
        return $.each(json['notes'], function(i, note) {
          var key;
          key = _this.keysByPitch[note['pitch']];
          return _this.addNote(key, note['start'] * _this.beatWidth, note['duration'] * _this.beatWidth);
        });
      }
    };

    /*
      State modifier methods
    */

    Mixer.prototype.removeNote = function(n) {
      n.data('rightBar').remove();
      n.data('leftBar').remove();
      return n.remove();
    };

    Mixer.prototype.hoverNote = function(n) {
      var color;
      this.unhoverNote;
      this.hoveredNote = n;
      if ((this.selectedNote != null) && this.selectedNote.attr("note") === this.hoveredNote.attr("note")) {
        color = noteSelectedHoverColor;
      } else {
        color = noteHoverColor;
      }
      this.hoveredNote.css("background-color", color);
      this.hoveredNote.data('rightBar').css("background-color", color);
      return this.hoveredNote.data('leftBar').css("background-color", color);
    };

    Mixer.prototype.unhoverNote = function() {
      var color;
      if (this.hoveredNote != null) {
        if ((this.selectedNote != null) && this.selectedNote.attr("note") === this.hoveredNote.attr("note")) {
          color = noteSelectedColor;
        } else {
          color = noteColor;
        }
        this.hoveredNote.css("background-color", color);
        this.hoveredNote.data('rightBar').css("background-color", color);
        return this.hoveredNote.data('leftBar').css("background-color", color);
      }
    };

    return Mixer;

  })();

  sendPlayRequest = function(data, success) {
    $('#play-status').html('Sending song...');
    return $.ajax({
      type: "POST",
      url: "/play/",
      processData: false,
      data: "notes=" + data,
      dataType: "text"
    }).done(function(msg) {
      return success(msg);
    }).fail(function(jqXHR, msg, x) {
      return alert("Error type: " + msg + "\nMessage: " + x);
    });
  };

  mixer = new Mixer();

}).call(this);
