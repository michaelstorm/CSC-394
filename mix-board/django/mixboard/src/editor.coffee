fromX = null
ribbonClicked = false
noteBarClicked = false
noteClicked = false
noteClickedMoved = false
ctrlPressed = false
snapPercent = .15
beatWidth = 50
keyHeight = 30
keyboardWidth = 10000
noteHeightPercent = .50
noteNum = 0
note = null
noteBar = null
rightPosition = null
selectedNote = null
hoveredNote = null
defaultNoteColor = "#D5D9DB"
nextKeyPosition = 0
keyboard = null
keys = []

class Key
  constructor: (@pitch) ->
    @notes = []

addKey = (pitch) ->
  if pitch[pitch.length - 1] is "#"
    bgColor = "#303030"
    textColor = "white"
    borderColor = "#D0D0D0"
  else
    bgColor = "#D0D0D0"
    textColor = "black"
    borderColor = "#303030"

  key = """
        <div class='key'
             style='
                    top: #{nextKeyPosition}px;
                    background-color: #{bgColor};
                    color: #{textColor};
                    border-top: 1px solid #{borderColor};
                    border-bottom: 1px solid #{borderColor};
             '>
          #{pitch}&nbsp;
        </div>
        """

  keyLine = """
            <div class='keyLine'
                 onmousedown='return false;'
                 style='
                        width: #{keyboardWidth}px;
                        top: #{nextKeyPosition}px;
                 '>
            </div>
            """
  nextKeyPosition += keyHeight

  keyboard.append keyLine
  $('#keys').append key
  keys.push new Key(pitch)

addOctave = (number) ->
  addKey "b#{number}"
  addKey "b#{number}b/a#{number}#"
  addKey "a#{number}"
  addKey "a#{number}b/g#{number}#"
  addKey "g#{number}"
  addKey "g#{number}b/f#{number}#"
  addKey "f#{number}"
  addKey "e#{number}"
  addKey "e#{number}b/d#{number}#"
  addKey "d#{number}"
  addKey "d#{number}b/c#{number}#"
  addKey "c#{number}"

addBeatLines = ->
  left = 0
  height = keyboard.height()
  html = ""
  while left <= keyboardWidth
    line = """
           <div class='line'
                style='
                       position: absolute;
                       width: 1px;
                       top: 0px;
                       height: #{height}px;
                       margin: 0px;
                       background-color: black;
                       left: #{left}px;
                '>
           </div>
           """

    html += line
    left += beatWidth

  keyboard.append html

deselectNotes = ->
  if selectedNote?
    rightNoteBar = $(".rightNoteBar[note=\"#{selectedNote.attr("note")}\"]")
    leftNoteBar = $(".leftNoteBar[note=\"#{selectedNote.attr("note")}\"]")
    rightNoteBar.css "background-color", defaultNoteColor
    leftNoteBar.css "background-color", defaultNoteColor
    selectedNote.css "background-color", defaultNoteColor
    selectedNote = null

createNote = (posX, posY, pitch) ->
  fromX = snapGrid(posX)
  ribbonClicked = true
  noteNum++

  keyTop = getKeyTop(posY)
  noteTopMarginPercent = (1.0 - noteHeightPercent)/2
  top = keyTop + (keyHeight * noteTopMarginPercent)
  height = keyHeight * noteHeightPercent
  width = 0
  left = fromX

  html = """
         <div
              class='note'
              note='#{noteNum}'
              pitch='#{pitch}'
              style='
                     top: #{top}px;
                     height: #{height}px;
                     width: #{width}px;
                     left: #{left}px;
              '>
         </div>
         """

  html += """
          <div class='rightNoteBar'
               note='#{noteNum}'
               pitch='#{pitch}'
               side='right'
               style='
                      top: #{keyTop}px;
                      height: #{keyHeight/3}px;
                      left: #{(left + width) - 2}px;
                      cursor: col-resize;
               '>
          </div>
          """

  html += """
          <div class='leftNoteBar'
               note='#{noteNum}'
               pitch='#{pitch}'
               side='left'
               style='
                      top: #{(keyTop + keyHeight) - keyHeight/3}px;
                      height: #{keyHeight/3}px;
                      left: #{left}px;
                      cursor: col-resize;
               '>
          </div>
          """

  keyboard.append html
  note = $(".note[note=\"#{noteNum}\"]")
  note.rightBar = $(".rightNoteBar[note=\"#{noteNum}\"]")
  note.leftBar = $(".leftNoteBar[note=\"#{noteNum}\"]")
  #console.log("note.leftBar = " + note.leftBar)
  #console.log("note.rightBar = " + note.rightBar)
  #removeNote note
  hoverNote note

getKeyTop = (position) ->
  positionMod = position % keyHeight
  Math.floor(position / keyHeight) * keyHeight

getPitch = (top) ->
  index = Math.floor(top / keyHeight)
  keys[index].pitch

keyboardMouseDown = (e) ->
  deselectNotes()
  top = e.pageY - keyboard.offset().top
  pitch = getPitch(top)
  createNote e.pageX - keyboard.offset().left, top, pitch

noteBarMouseDown = (e) ->
  pitch = $(e.target).attr("pitch")
  fromX = snapGrid(e.pageX - keyboard.offset().left)

  noteBarClicked = true
  noteBar = $(e.target)
  note = $(".note[note=\"#{noteBar.attr("note")}\"]")

  deselectNotes()  if selectedNote? and note.attr("note") isnt selectedNote.attr("note")
  rightPosition = note.position().left + note.width()  if noteBar.attr("side") is "left"
  $("body").css "cursor", "col-resize"

noteMouseDown = (e) ->
  pitch = $(e.target).attr("pitch")

  note = $(e.target)
  noteClicked = true
  pitch = note.attr("pitch")

  deselectNotes()  if selectedNote? and note.attr("note") isnt selectedNote.attr("note")
  fromX = e.pageX - keyboard.offset().left
  rightPosition = note.position().left + note.width()

removeNote = (n) ->
  n.rightBar.remove()
  n.leftBar.remove()
  n.remove()

noteBarMouseOver = (e) ->
  unless noteClicked or noteBarClicked or ribbonClicked
    unhoverNote()  if hoveredNote?
    hoverNote $(".note[note=\"#{$(e.target).attr("note")}\"]")

noteMouseOver = (e) ->
  unless noteClicked or noteBarClicked or ribbonClicked
    unhoverNote()  if hoveredNote?
    hoverNote $(e.target)

windowMouseOver = (e) ->
  targetClass = $(e.target).attr("class")
  if targetClass is "note"
    noteMouseOver e
  else if targetClass is "leftNoteBar" or targetClass is "rightNoteBar"
    noteBarMouseOver e
  else unhoverNote()  if (not (noteClicked or noteBarClicked or ribbonClicked) and hoveredNote? and note? and hoveredNote.attr("note") is note.attr("note"))

hoverNote = (n) ->
  hoveredNote = n
  highlightColor = "white"
  highlightColor = "#2E9AFE"  if selectedNote? and selectedNote.attr("note") is hoveredNote.attr("note")

  hoveredNote.css "background-color", highlightColor
  rightNoteBar = $(".rightNoteBar[note=\"#{hoveredNote.attr("note")}\"]")
  leftNoteBar = $(".leftNoteBar[note=\"#{hoveredNote.attr("note")}\"]")
  rightNoteBar.css "background-color", highlightColor
  leftNoteBar.css "background-color", highlightColor

unhoverNote = ->
  defaultColor = defaultNoteColor
  defaultColor = "blue"  if selectedNote? and selectedNote.attr("note") is hoveredNote.attr("note")

  hoveredNote.css "background-color", defaultColor
  rightNoteBar = $(".rightNoteBar[note=\"#{hoveredNote.attr("note")}\"]")
  leftNoteBar = $(".leftNoteBar[note=\"#{hoveredNote.attr("note")}\"]")
  rightNoteBar.css "background-color", defaultColor
  leftNoteBar.css "background-color", defaultColor

snapGrid = (position) ->
  positionMod = position % beatWidth
  if positionMod < 10
    Math.floor(position / beatWidth) * beatWidth
  else if positionMod > beatWidth - 10
    Math.ceil(position / beatWidth) * beatWidth
  else
    position

sendPlayRequest = (data, success) ->
  $.ajax(
    type: "POST"
    url: "play/"
    processData: false
    data: "notes=#{data}"
    dataType: "text"
  ).done((msg) ->
    success msg
  ).fail (jqXHR, msg, x) ->
    alert "Error type: #{msg}\nMessage: #{x}"

$(window).load ->
  keyboard = $("#keyboard")
  i = 0

  while i < 8
    addOctave i
    i++
  keyboard.css "height", nextKeyPosition + "px"
  keyboard.css "width", keyboardWidth + "px"
  addBeatLines()
  $("#content").jScrollPane()
  $("#player").jPlayer
    cssSelectorAncestor: "#jp_container_1"
    cssSelector:
      videoPlay: ".jp-video-play"
      play: ".jp-play"
      pause: ".jp-pause"
      stop: ".jp-stop"
      seekBar: ".jp-seek-bar"
      playBar: ".jp-play-bar"
      mute: ".jp-mute"
      unmute: ".jp-unmute"
      volumeBar: ".jp-volume-bar"
      volumeBarValue: ".jp-volume-bar-value"
      volumeMax: ".jp-volume-max"
      currentTime: ".jp-current-time"
      duration: ".jp-duration"
      fullScreen: ".jp-full-screen"
      restoreScreen: ".jp-restore-screen"
      repeat: ".jp-repeat"
      repeatOff: ".jp-repeat-off"
      gui: ".jp-gui"
      noSolution: ".jp-no-solution"

    swfPath: "/static"
    supplied: "mp3"

  oldPlayMethod = $.jPlayer::play
  $.jPlayer::play = (time) ->
    @oldPlayMethod = oldPlayMethod
    data = "{ \"notes\": ["
    $(".note").each (i, n) ->
      data += """
              {
                "pitch": "#{$(n).attr("pitch")}",
                "start": #{($(n).position().left / beatWidth)},
                "duration": #{($(n).width() / beatWidth)}
              }
              """
      data += ", "  if i < $(".note").size() - 1

    data += "] }"
    obj = this
    sendPlayRequest data, (msg) ->
      $("#player").jPlayer "setMedia",
        mp3: "/output/#{msg}/"

      obj.oldPlayMethod()

  $(window).keydown (e) ->
    if selectedNote? and (e.which is 8 or e.which is 46)
      removeNote selectedNote
      selectedNote = null
    ctrlPressed = true  if e.which is 17

  $(window).keyup (e) ->
    ctrlPressed = false  if e.which is 17

  $(window).mouseover (e) ->
    windowMouseOver e

  keyboard.mousedown (e) ->
    targetClass = $(e.target).attr("class")
    if targetClass is "leftNoteBar" or targetClass is "rightNoteBar"
      noteBarMouseDown e
    else if targetClass is "note"
      noteMouseDown e
    else
      keyboardMouseDown e

  $(window).mouseup (e) ->
    if ribbonClicked or noteBarClicked or noteClicked
      if (noteClicked or noteBarClicked) and not noteClickedMoved
        selectedNote = note
      else
        noteClickedMoved = false
      if note.width() is 0
        removeNote note
        note = null
      $("body").css "cursor", "auto"
      ribbonClicked = false
      noteBarClicked = false
      noteClicked = false
      unhoverNote()  if (noteClicked or noteBarClicked or ribbonClicked) and (hoveredNote? and hoveredNote.attr("note") isnt $(e.target).attr("note"))
      windowMouseOver e

  $(window).mousemove (e) ->
    if ribbonClicked or noteBarClicked or noteClicked
      noteClickedMoved = true
      toX = e.pageX - keyboard.offset().left
      toX = toX - (note.width() - (rightPosition - fromX))  if noteClicked
      toX = snapGrid(toX)  unless ctrlPressed

      if ribbonClicked
        width = toX - fromX

        if width >= 0
          left = fromX
        else
          left = toX
          width = Math.abs(width)

        if left + width > keyboardWidth
          width = keyboardWidth - fromX
        else if left < 0
          left = 0
          width = fromX

      else if noteBarClicked
        if noteBar.attr("side") is "right"
          width = toX - note.position().left
          left = note.position().left
          width = 0  if width < 0
          width = keyboardWidth - note.position().left  if left + width > keyboardWidth
        else
          width = (note.position().left + note.width()) - toX
          if width >= 0
            left = toX
          else
            left = note.position().left + note.width()
            width = 0

          if left < 0
            left = 0
            width = note.width()
      else
        left = toX
        width = note.width()

        if left + width > keyboardWidth
          left = keyboardWidth - width
        else if left < 0
          left = 0

        $("body").css "cursor", "move"

      note.css "left", left + "px"
      note.css "width", width + "px"

      rightNoteBar = $(".rightNoteBar[note=\"#{note.attr("note")}\"]")
      leftNoteBar = $(".leftNoteBar[note=\"#{note.attr("note")}\"]")
      leftNoteBar.css "left", left + "px"
      rightNoteBar.css "left", (left + width - rightNoteBar.width()) + "px"
