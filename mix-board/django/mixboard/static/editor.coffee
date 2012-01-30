fromX = null
ribbonClicked = false
noteBarClicked = false
noteClicked = false
noteClickedMoved = false
ctrlPressed = false
snapPercent = .15
beatWidth = 50
keyHeight = 30
keyboardWidth = 100000
noteHeightPercent = .50
noteNum = 0
note = null
noteBar = null
rightPosition = null
selectedNote = null
hoveredNote = null
noteColor = editorCSS['.note']['background-color']
noteHoverColor = editorCSS['.note']['-mb-hover-color']
noteSelectedColor = editorCSS['.note']['-mb-selected-color']
noteSelectedHoverColor = editorCSS['.note']['-mb-selected-hover-color']
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

  keys.push new Key(pitch)
  [key, keyLine]

addOctave = (number) ->
  keyHtml = ''
  keyLineHtml = ''

  appendKey = (key, keyLine) ->
    keyHtml += key
    keyLineHtml += keyLine

  [key, keyLine] = addKey "b#{number}"
  appendKey key, keyLine
  [key, keyLine] = addKey "b#{number}b/a#{number}#"
  appendKey key, keyLine
  [key, keyLine] = addKey "a#{number}"
  appendKey key, keyLine
  [key, keyLine] = addKey "a#{number}b/g#{number}#"
  appendKey key, keyLine
  [key, keyLine] = addKey "g#{number}"
  appendKey key, keyLine
  [key, keyLine] = addKey "g#{number}b/f#{number}#"
  appendKey key, keyLine
  [key, keyLine] = addKey "f#{number}"
  appendKey key, keyLine
  [key, keyLine] = addKey "e#{number}"
  appendKey key, keyLine
  [key, keyLine] = addKey "e#{number}b/d#{number}#"
  appendKey key, keyLine
  [key, keyLine] = addKey "d#{number}"
  appendKey key, keyLine
  [key, keyLine] = addKey "d#{number}b/c#{number}#"
  appendKey key, keyLine
  [key, keyLine] = addKey "c#{number}"
  appendKey key, keyLine

  [keyHtml, keyLineHtml]

addBeatLines = ->
  left = 0
  height = keyboard.height()
  html = ""
  while left <= keyboardWidth
    line = """
           <div class='line'
                style='
                       height: #{height}px;
                       left: #{left}px;
                '>
           </div>
           """

    html += line
    left += beatWidth

  keyboard.append html

constructKeyboard = ->
  keyHtml = ''
  keyLineHtml = ''

  appendOctave = (key, keyLine) ->
    keyHtml += key
    keyLineHtml += keyLine

  i = 0
  while i < 8
    [key, keyLine] = addOctave i
    appendOctave key, keyLine
    i++

  keyboard.append keyLineHtml
  $('#keys').append keyHtml

  keyboard.css "height", nextKeyPosition + "px"
  keyboard.css "width", keyboardWidth + "px"
  addBeatLines()

deselectNotes = ->
  if selectedNote?
    selectedNote.css "background-color", noteColor
    selectedNote.data('rightBar').css "background-color", noteColor
    selectedNote.data('leftBar').css "background-color", noteColor
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
          <div class='noteBar'
               note='#{noteNum}'
               pitch='#{pitch}'
               side='right'
               style='
                      top: #{keyTop}px;
                      height: #{keyHeight/3}px;
                      left: #{(left + width) - 2}px;
               '>
          </div>
          """

  html += """
          <div class='noteBar'
               note='#{noteNum}'
               pitch='#{pitch}'
               side='left'
               style='
                      top: #{(keyTop + keyHeight) - keyHeight/3}px;
                      height: #{keyHeight/3}px;
                      left: #{left}px;
               '>
          </div>
          """

  keyboard.append html

  note = $(".note[note=\"#{noteNum}\"]")

  rightNoteBar = $(".noteBar[note=\"#{noteNum}\"][side=\"right\"]")
  rightNoteBar.data 'note', note
  note.data 'rightBar', rightNoteBar

  leftNoteBar = $(".noteBar[note=\"#{noteNum}\"][side=\"left\"]")
  leftNoteBar.data 'note', note
  note.data 'leftBar', leftNoteBar

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
  note = noteBar.data 'note'

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
  n.data('rightBar').remove()
  n.data('leftBar').remove()
  n.remove()

noteBarMouseOver = (e) ->
  unless noteClicked or noteBarClicked or ribbonClicked
    unhoverNote()  if hoveredNote?
    hoverNote $(e.target).data 'note'

noteMouseOver = (e) ->
  unless noteClicked or noteBarClicked or ribbonClicked
    unhoverNote()  if hoveredNote?
    hoverNote $(e.target)

windowMouseOver = (e) ->
  targetClass = $(e.target).attr("class")
  if targetClass is "note"
    noteMouseOver e
  else if targetClass is "noteBar"
    noteBarMouseOver e
  else if (not (noteClicked or noteBarClicked or ribbonClicked) and hoveredNote? and note? and hoveredNote.attr("note") is note.attr("note"))
    unhoverNote()

hoverNote = (n) ->
  hoveredNote = n
  if selectedNote? and selectedNote.attr("note") is hoveredNote.attr("note")
    color = noteSelectedHoverColor
  else
    color = noteHoverColor;

  hoveredNote.css "background-color", color
  hoveredNote.data('rightBar').css "background-color", color
  hoveredNote.data('leftBar').css "background-color", color

unhoverNote = ->
  if selectedNote? and selectedNote.attr("note") is hoveredNote.attr("note")
    color = noteSelectedColor
  else
    color = noteColor

  hoveredNote.css "background-color", color
  hoveredNote.data('rightBar').css "background-color", color
  hoveredNote.data('leftBar').css "background-color", color

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
  constructKeyboard()

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
    if targetClass is "noteBar"
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

      if (noteClicked or noteBarClicked or ribbonClicked) and (hoveredNote? and hoveredNote.attr("note") isnt $(e.target).attr("note"))
        unhoverNote()
      windowMouseOver e

  $(window).mousemove (e) ->
    if ribbonClicked or noteBarClicked or noteClicked
      noteClickedMoved = true
      toX = e.pageX - keyboard.offset().left
      if noteClicked
        toX = toX - (note.width() - (rightPosition - fromX))

      unless ctrlPressed
        toX = snapGrid(toX)

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
          if width < 0
            width = 0
          if left + width > keyboardWidth
            width = keyboardWidth - note.position().left
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
      note.data('leftBar').css "left", left + "px"
      note.data('rightBar').css "left", (left + width - note.data('rightBar').width()) + "px"
