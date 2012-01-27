var fromX;
var ribbonClicked = false;
var noteBarClicked = false;
var noteClicked = false;
var noteClickedMoved = false;
var ctrlPressed = false;
var snapPercent = .15;
var lineNum = 0;
var beatWidth = 50;
var keyHeight = 30;
var keyboardWidth = 10000;
var noteTopMarginPercent = .25;
var noteHeightPercent = .50;
var noteNum = 0;
var note = null;
var noteBar = null;
var rightPosition = null;
var selectedNote = null;
var hoveredNote = null;
var defaultNoteColor = '#D5D9DB';
var nextKeyPosition = 0;
var keyboard;
var pitches = [];

function addKey(pitch) {
  var bgColor;
  var textColor;
  var borderColor;
  if (pitch[pitch.length-1] === '#') {
    bgColor = '#303030';
    textColor = 'white';
    borderColor = '#D0D0D0';
  }
  else {
    bgColor = '#D0D0D0';
    textColor = 'black';
    borderColor = '#303030';
  }
  var key = '<div class="key" style="'
                + 'top: '+nextKeyPosition+'px;'
                + 'background-color: '+bgColor+';'
                + 'color: '+textColor+';'
                + 'border-top: 1px solid '+borderColor+';'
                + 'border-bottom: 1px solid '+borderColor+';'
              + '">'
              + pitch+'&nbsp;'
            + '</div>';
  var ribbon = '<div class="keyLine" style="width: '+keyboardWidth+'px; top: '+nextKeyPosition+'px;" onmousedown="return false;"></div>';
  nextKeyPosition += keyHeight;
  keyboard.append(ribbon);
  $('#keys').append(key);

  pitches.push(pitch);
}

function addOctave(number) {
  addKey('b'+number);
  addKey('b'+number+'b/a'+number+'#');
  addKey('a'+number);
  addKey('a'+number+'b/g'+number+'#');
  addKey('g'+number);
  addKey('g'+number+'b/f'+number+'#');
  addKey('f'+number);
  addKey('e'+number);
  addKey('e'+number+'b/d'+number+'#');
  addKey('d'+number);
  addKey('d'+number+'b/c'+number+'#');
  addKey('c'+number);
}

function addBeatLines() {
  var left = 0;
  var height = keyboard.height();
  var html = '';
  while (left <= keyboardWidth) {
    lineNum++;
    var line = '<div class="line" '
               + 'style="'
               + 'position: absolute;'
               + 'width: 1px;'
               + 'top: 0px;'
               + 'height: '+height+'px;'
               + 'margin: 0px;'
               + 'background-color: black;'
               + 'left: '+left+'px;"></div>';
    html += line;
    left += beatWidth;
  }
  keyboard.append(html);
}

function deselectNotes() {
  if (selectedNote !== null) {
    var rightNoteBar = $('.rightNoteBar[note="'+selectedNote.attr('note')+'"]');
    var leftNoteBar = $('.leftNoteBar[note="'+selectedNote.attr('note')+'"]');
    rightNoteBar.css('background-color', defaultNoteColor);
    leftNoteBar.css('background-color', defaultNoteColor);

    selectedNote.css('background-color', defaultNoteColor);
    selectedNote = null;
  }
}

function createNote(posX, posY, pitch) {
  fromX = snapGrid(posX);

  ribbonClicked = true;

  noteNum++;
  var html = '<div class="note" id="note_'+noteNum+'" note="'+noteNum+'" pitch="'+pitch+'" ';

  var keyTop = getKeyTop(posY);
  var top = keyTop+(keyHeight*noteTopMarginPercent);
  var height = keyHeight*noteHeightPercent;
  var width = 0;
  var left = fromX;
  var noteStyle = 'top:'+top+'px;'
                + 'height:'+height+'px;'
                + 'width:'+width+'px;'
                + 'left:'+left+'px;';

  html += 'style="'+noteStyle+'"></div>';

  html += '<div class="rightNoteBar" note="'+noteNum+'" pitch="'+pitch+'" side="right" ';
  var rightBarHeight = keyHeight/3;
  var rightBarStyle = 'top:'+keyTop+'px;'
                    + 'height:'+rightBarHeight+'px;'
                    + 'left:'+(left+width-2)+'px;'
                    + 'cursor: col-resize;';

  html += 'style="'+rightBarStyle+'"></div>';

  html += '<div class="leftNoteBar" note="'+noteNum+'" pitch="'+pitch+'" side="left" ';
  var leftBarHeight = keyHeight/3;
  var leftBarTop = (keyTop+keyHeight)-leftBarHeight;
  var leftBarStyle = 'top:'+leftBarTop+'px;'
                   + 'height:'+leftBarHeight+'px;'
                   + 'left:'+left+'px;'
                   + 'cursor: col-resize;';

  html += 'style="'+leftBarStyle+'"></div>';

  keyboard.append(html);
  note = $('.note[note="'+noteNum+'"]');

  hoverNote(note);
}

function getKeyTop(position) {
  var positionMod = position % keyHeight;
  return Math.floor(position/keyHeight)*keyHeight;
}

function getPitch(top) {
  var index = Math.floor(top/keyHeight);
  return pitches[index];
}

function keyboardMouseDown(e) {
  deselectNotes();
  var top = e.pageY-keyboard.offset().top;
  var pitch = getPitch(top);
  createNote(e.pageX-keyboard.offset().left, top, pitch);
}

function noteBarMouseDown(e) {
  var pitch = $(e.target).attr('pitch');
  fromX = snapGrid(e.pageX-keyboard.offset().left);

  noteBarClicked = true;
  noteBar = $(e.target);
  note = $('.note[note="'+noteBar.attr('note')+'"]');

  if (selectedNote !== null && note.attr('note') !== selectedNote.attr('note'))
    deselectNotes();

  if (noteBar.attr('side') === 'left')
    rightPosition = note.position().left+note.width();

  $('body').css('cursor', 'col-resize');
}

function noteMouseDown(e) {
  var pitch = $(e.target).attr('pitch');

  note = $(e.target);
  noteClicked = true;
  var pitch = note.attr('pitch');

  if (selectedNote !== null && note.attr('note') !== selectedNote.attr('note'))
    deselectNotes();

  fromX = e.pageX-keyboard.offset().left;
  rightPosition = note.position().left+note.width();
}

function removeNote(n) {
  var rightNoteBar = $('.rightNoteBar[note="'+n.attr('note')+'"]');
  var leftNoteBar = $('.leftNoteBar[note="'+n.attr('note')+'"]');
  n.remove();
  rightNoteBar.remove();
  leftNoteBar.remove();
}

function noteBarMouseOver(e) {
  if (!(noteClicked || noteBarClicked || ribbonClicked)) {
    if (hoveredNote !== null)
      unhoverNote();
    hoverNote($('.note[note="'+$(e.target).attr('note')+'"]'));
  }
}

function noteMouseOver(e) {
  if (!(noteClicked || noteBarClicked || ribbonClicked)) {
    if (hoveredNote !== null)
      unhoverNote();
    hoverNote($(e.target));
  }
}

function windowMouseOver(e) {
  var targetClass = $(e.target).attr('class');
  if (targetClass === 'note')
    noteMouseOver(e);
  else if (targetClass === 'leftNoteBar' || targetClass === 'rightNoteBar')
    noteBarMouseOver(e);
  else if (hoveredNote !== null && !((noteClicked || noteBarClicked || ribbonClicked)
            && hoveredNote.attr('note') === note.attr('note')))
    unhoverNote();
}

function hoverNote(n) {
  hoveredNote = n;
  var highlightColor = 'white';
  if (selectedNote !== null && selectedNote.attr('note') === hoveredNote.attr('note'))
    highlightColor = '#2E9AFE';

  hoveredNote.css('background-color', highlightColor);
  var rightNoteBar = $('.rightNoteBar[note="'+hoveredNote.attr('note')+'"]');
  var leftNoteBar = $('.leftNoteBar[note="'+hoveredNote.attr('note')+'"]');
  rightNoteBar.css('background-color', highlightColor);
  leftNoteBar.css('background-color', highlightColor);
}

function unhoverNote() {
  var defaultColor = defaultNoteColor;
  if (selectedNote !== null && selectedNote.attr('note') === hoveredNote.attr('note'))
    defaultColor = 'blue';

  hoveredNote.css('background-color', defaultColor);
  var rightNoteBar = $('.rightNoteBar[note="'+hoveredNote.attr('note')+'"]');
  var leftNoteBar = $('.leftNoteBar[note="'+hoveredNote.attr('note')+'"]');
  rightNoteBar.css('background-color', defaultColor);
  leftNoteBar.css('background-color', defaultColor);
}

$(window).load(function() {
  keyboard = $('#keyboard');
  for (var i = 0; i < 8; i++)
    addOctave(i);

  keyboard.css('height', nextKeyPosition+'px');
  keyboard.css('width', keyboardWidth+'px');
  addBeatLines();

  $('#content').jScrollPane();

  $('#player').jPlayer({
    cssSelectorAncestor: '#jp_container_1',
    cssSelector: {
      videoPlay: '.jp-video-play',
      play: '.jp-play',
      pause: '.jp-pause',
      stop: '.jp-stop',
      seekBar: '.jp-seek-bar',
      playBar: '.jp-play-bar',
      mute: '.jp-mute',
      unmute: '.jp-unmute',
      volumeBar: '.jp-volume-bar',
      volumeBarValue: '.jp-volume-bar-value',
      volumeMax: '.jp-volume-max',
      currentTime: '.jp-current-time',
      duration: '.jp-duration',
      fullScreen: '.jp-full-screen',
      restoreScreen: '.jp-restore-screen',
      repeat: '.jp-repeat',
      repeatOff: '.jp-repeat-off',
      gui: '.jp-gui',
      noSolution: '.jp-no-solution'
    },
    swfPath: '/static',
    supplied: 'mp3'
  });

  var oldPlayMethod = $.jPlayer.prototype.play;
  $.jPlayer.prototype.play = function(time) {
    this.oldPlayMethod = oldPlayMethod;

    var data = '{ "notes": [';
      $('.note').each(function(i, n) {
      data += '{'
              + '"pitch": "' + $(n).attr('pitch') + '", '
              + '"start": '+ ($(n).position().left/beatWidth) + ', '
              + '"duration": ' + ($(n).width()/beatWidth)
            + '}';

      if (i < $('.note').size()-1)
        data += ', ';
    });

    data += '] }';
    var obj = this;
    sendPlayRequest(data, function(msg) {
      $('#player').jPlayer('setMedia', {
        mp3: '/output/'+msg+'/'
      });
      obj.oldPlayMethod();
    });
  };

  $(window).keydown(function(e) {
    if (selectedNote !== null && (e.which === 8 || e.which === 46)) {
      removeNote(selectedNote);
      selectedNote = null;
    }

    if (e.which === 17)
      ctrlPressed = true;
  });

  $(window).keyup(function(e) {
    if (e.which === 17)
      ctrlPressed = false;
  });

  $(window).mouseover(function(e) {
    windowMouseOver(e);
  });

  keyboard.mousedown(function(e) {
    var targetClass = $(e.target).attr('class');
    if (targetClass === 'leftNoteBar' || targetClass === 'rightNoteBar')
      noteBarMouseDown(e);
    else if (targetClass === 'note')
      noteMouseDown(e);
    else
      keyboardMouseDown(e);
  });

  $(window).mouseup(function(e) {
    if (ribbonClicked || noteBarClicked || noteClicked) {
      if ((noteClicked || noteBarClicked) && !noteClickedMoved)
        selectedNote = note; // color will be changed by windowMouseOver()
      else
        noteClickedMoved = false;

      if (note.width() === 0) {
        removeNote(note);
        note = null;
      }

      $('body').css('cursor', 'auto');

      ribbonClicked = false;
      noteBarClicked = false;
      noteClicked = false;

      if ((noteClicked || noteBarClicked || ribbonClicked)
          && hoveredNote !== null
          && $(e.target).attr('note') !== hoveredNote.attr('note'))
          unhoverNote();

      windowMouseOver(e);
    }
  });

  $(window).mousemove(function(e) {
    if (ribbonClicked || noteBarClicked || noteClicked) {
      noteClickedMoved = true;
      var toX = e.pageX-keyboard.offset().left;
      if (noteClicked)
        toX = toX-(note.width()-(rightPosition-fromX));

      if (!ctrlPressed)
        toX = snapGrid(toX);

      var left;
      var width;

      // creating a note by clicking and dragging on a ribbon
      if (ribbonClicked) {
        width = toX-fromX;
        if (width >= 0)
          left = fromX;
        else {
          left = toX;
          width = Math.abs(width);
        }

        if (left+width > keyboardWidth)
          width = keyboardWidth - fromX;
        else if (left < 0) {
          left = 0;
          width = fromX;
        }
      }
      else if (noteBarClicked) {
        // dragging the top-right handle of a note
        if (noteBar.attr('side') === 'right') {
          width = toX-note.position().left;
          left = note.position().left;
          if (width < 0)
            width = 0;

          if (left+width > keyboardWidth)
            width = keyboardWidth - note.position().left;
        }
        // dragging the bottom-left handle of a note
        else {
          width = (note.position().left+note.width())-toX;
          if (width >= 0)
            left = toX;
          else {
            left = note.position().left+note.width();
            width = 0;
          }

          if (left < 0) {
            left = 0;
            width = note.width();
          }
        }
      }
      // dragging note
      else {
        left = toX;
        width = note.width();

        if (left+width > keyboardWidth)
          left = keyboardWidth - width;
        else if (left < 0)
          left = 0;

        $('body').css('cursor', 'move');
      }

      note.css('left', left+'px');
      note.css('width', width+'px');

      var rightNoteBar = $('.rightNoteBar[note="'+note.attr('note')+'"]');
      var leftNoteBar = $('.leftNoteBar[note="'+note.attr('note')+'"]');
      leftNoteBar.css('left', left+'px');
      rightNoteBar.css('left', (left+note.width()-rightNoteBar.width())+'px');
    }
  });
});

function snapGrid(position) {
  var positionMod = position % beatWidth;
  if (positionMod < 10)
    return Math.floor(position/beatWidth)*beatWidth;
  else if (positionMod > beatWidth-10)
    return Math.ceil(position/beatWidth)*beatWidth;

  return position;
}

function sendPlayRequest(data, success) {
  $.ajax({
    type: "POST",
    url: "play/",
    processData: false,
    data: "notes="+data,
    dataType: "text",
  }).done(function(msg) {
    success(msg);
  }).fail(function(jqXHR, msg, x) {
    alert("Error type: " + msg + ", Message: " + x);
  });
}
