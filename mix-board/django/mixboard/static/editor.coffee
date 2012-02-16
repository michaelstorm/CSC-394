ctrlPressed = false
noteColor              = editorCSS['.note']['background-color']
noteHoverColor         = editorCSS['.note']['-mb-hover-color']
noteSelectedColor      = editorCSS['.note']['-mb-selected-color']
noteSelectedHoverColor = editorCSS['.note']['-mb-selected-hover-color']

class IntervalTreeItem
  constructor: (@data, @begin, @width) ->

class IntervalTree
  constructor: (@root) ->
    if @root?
      @width = @root.width

  addInterval: (item) ->
    if not @root?
      @root = item
    else if item.begin < @root.begin
      if @root.left?
        @root.left.addInterval item
      else
        @root.left = new IntervalTree item
      @width = @root.left.width

class Key
  constructor: (@pitch, @top) ->
    @notes = []

  addNoteAtPosition: (note) ->
    @notes.push note

class Mixer
  reset: ->
    @fromX = null
    @keyboardClicked = false
    @noteClicked = false
    @noteClickedMoved = false
    @nextNoteNumber = 0
    @activeNote = null
    @clickedNoteBar = null
    @rightPosition = null
    @selectedNote = null
    @hoveredNote = null

    $('.note').each (i, note) =>
      @removeNote $(note)

  constructor: ->
    @beatWidth = 50
    @nextKeyPosition = 0
    @keyboard = null
    @keys = []
    @keysByPitch = {}
    @keyboardWidth = 100000
    @keyHeight = 30
    @noteHeightPercent = .50
    @reset()

    $(window).bind 'load', =>
      @readOnly = $('#readOnly').length > 0
      @songId = $('#songId').text()
      @songName = $('#songName').text()

      @constructEditButtons()
      @constructKeyboard()
      @constructJPlayer()
      if not @readOnly
        @attachInputHandlers()

      songData = $('#songData').text()
      @setSongJSON songData

      if @readOnly
        $('#voteUpButton').click (e) ->
          postData =
            'song': $('#songId').html()

          $.post '/song/vote/up/', postData, (response) ->
            if response == 'success'
              $('#voteCount').html parseInt($('#voteCount').html()) + 1
            else alert response

        $('#voteDownButton').click (e) ->
          postData =
            'song': $('#songId').html()

          $.post '/song/vote/down/', postData, (response) ->
            if response == 'success'
              $('#voteCount').html parseInt($('#voteCount').html()) - 1
            else alert response
  ###
  DOM construction and event handling setup
  ###

  constructEditButtons: ->
    if @readOnly
      $('#editButton').click =>
        window.location.href = "/song/edit/#{@songId}/"
    else
      $('#saveButton').click =>
        if @songName.length == 0
          $('#saveSongDialog').modal()
        else
          postData =
            'id': @songId
            'data': @getSongJSON()

          $.post "/song/update/", postData, (response) =>
            if response != 'success'
              alert response

        return false

      $('#saveAsButton').click =>
        $('#saveSongDialog').modal()
        return false

      $('#openButton').click =>
        $('#openSongDialog').modal()

        $.get '/song/list/', (response) =>
          songs = eval('('+response+')')

          buttons = ''
          $.each songs['songs'], (i, song) ->
            buttons += "<button type='button' class='openSongChoice' songId='#{song['id']}'>#{song['name']}</button>"
          buttons += ''
          $('#openSongScroll').html buttons
          $('#openSongScroll').jScrollPane()

          $('.openSongChoice').click (e) =>
            $.get "/song/get/#{$(e.target).attr 'songId'}/", (data) =>
              @setSongJSON data
            $.modal.close()

        return false

      $('#saveSongForm').submit (e) =>
          e.preventDefault()

          name = $('#saveSongName').val()

          postData =
            'name': name
            'data': @getSongJSON()

          $.post '/song/save/', postData, (response) =>
            if response.search(/\d+/) != -1
              @songId   = response
              @songName = name
              if history?.replaceState?
                history.replaceState null, "Edit song #{songName}", "/song/edit/#{@songId}/"
              document.title = "Mixboard : edit : #{@songName}"
              $.modal.close()
            else $('#saveSongError').html response

  attachInputHandlers: ->
    $(window).keydown   (e) => @windowKeyDown e
    $(window).keyup     (e) => @windowKeyUp e
    $(window).mousedown (e) => @windowMouseDown e
    $(window).mouseup   (e) => @windowMouseUp e
    $(window).mousemove (e) => @windowMouseMove e
    $(window).mouseover (e) => @windowMouseOver e

  constructJPlayer: ->
    $("#player").jPlayer
      cssSelectorAncestor: "#jp_container_1"
      swfPath: "/static"
      supplied: "mp3"

    mixerObject = this
    oldPlayMethod = $.jPlayer::play
    $.jPlayer::play = (time) ->
      $('#play-status').html 'Processing song...'
      this.oldPlayMethod = oldPlayMethod
      obj = this

      data = mixerObject.getSongJSON()
      sendPlayRequest data, (msg) ->
        $("#player").jPlayer "setMedia",
          mp3: "/output/#{msg}/"

        $('#play-status').html 'Playing song...'
        obj.oldPlayMethod()

  addBeatLines: ->
    left = 0
    height = @keyboard.height()
    html = ""

    while left <= @keyboardWidth
      line = """
             <div class='line'
                  style='
                         height: #{height}px;
                         left:   #{left}px;
                  '>
             </div>
             """

      html += line
      left += @beatWidth

    @keyboard.append html

  createKey: (pitch) ->
    if pitch[pitch.length-1] is "#"
      bgColor     = editorCSS['.key']['-mb-dark-background-color']
      textColor   = editorCSS['.key']['-mb-dark-text-color']
      borderColor = editorCSS['.key']['-mb-dark-border-color']
    else
      bgColor     = editorCSS['.key']['-mb-light-background-color']
      textColor   = editorCSS['.key']['-mb-light-text-color']
      borderColor = editorCSS['.key']['-mb-light-border-color']

    key = """
          <div class='key'
               style='
                      top:              #{@nextKeyPosition}px;
                      background-color: #{bgColor};
                      color:            #{textColor};
                      border-top: 1px solid    #{borderColor};
                      border-bottom: 1px solid #{borderColor};
               '>
            #{pitch}&nbsp;
          </div>
          """

    keyLine = """
              <div class='keyLine'
                   onmousedown='return false;'
                   style='
                          width: #{@keyboardWidth}px;
                          top:   #{@nextKeyPosition}px;
                   '>
              </div>
              """

    keyObject = new Key(pitch, @nextKeyPosition)

    @nextKeyPosition += @keyHeight

    @keys.push keyObject
    @keysByPitch[pitch] = keyObject
    [key, keyLine]

  createOctave: (number) ->
    keyHtml = ''
    keyLineHtml = ''

    appendKey = (key, keyLine) ->
      keyHtml += key
      keyLineHtml += keyLine

    [key, keyLine] = @createKey "b#{number}"
    appendKey key, keyLine
    [key, keyLine] = @createKey "b#{number}b/a#{number}#"
    appendKey key, keyLine
    [key, keyLine] = @createKey "a#{number}"
    appendKey key, keyLine
    [key, keyLine] = @createKey "a#{number}b/g#{number}#"
    appendKey key, keyLine
    [key, keyLine] = @createKey "g#{number}"
    appendKey key, keyLine
    [key, keyLine] = @createKey "g#{number}b/f#{number}#"
    appendKey key, keyLine
    [key, keyLine] = @createKey "f#{number}"
    appendKey key, keyLine
    [key, keyLine] = @createKey "e#{number}"
    appendKey key, keyLine
    [key, keyLine] = @createKey "e#{number}b/d#{number}#"
    appendKey key, keyLine
    [key, keyLine] = @createKey "d#{number}"
    appendKey key, keyLine
    [key, keyLine] = @createKey "d#{number}b/c#{number}#"
    appendKey key, keyLine
    [key, keyLine] = @createKey "c#{number}"
    appendKey key, keyLine

    [keyHtml, keyLineHtml]

  constructKeyboard: ->
    @keyboard = $("#keyboard")
    keyHtml = ''
    keyLineHtml = ''

    appendOctave = (key, keyLine) ->
      keyHtml += key
      keyLineHtml += keyLine

    i = 0
    while i < 8
      [key, keyLine] = @createOctave i
      appendOctave key, keyLine
      i++

    @keyboard.append keyLineHtml
    $('#keys').append keyHtml

    @keyboard.css "height", @nextKeyPosition + "px"

    @keyboard.css "width", @keyboardWidth + "px"
    @addBeatLines()

    $("#content").jScrollPane()

  deselectNotes: ->
    if @selectedNote?
      @selectedNote.css                  "background-color", noteColor
      @selectedNote.data('rightBar').css "background-color", noteColor
      @selectedNote.data('leftBar').css  "background-color", noteColor
      @selectedNote = null

  addNoteAtPosition: (posX, posY) ->
    @fromX = @getSnappedToGrid(posX)
    @keyboardClicked = true
    key = @getKey posY
    note = @addNote key, @fromX, 0
    @hoverNote note
    @activeNote = note

  addNote: (key, left, width) ->
    noteTopMarginPercent = (1.0 - @noteHeightPercent)/2
    top = key.top + (@keyHeight * noteTopMarginPercent)
    height = @keyHeight * @noteHeightPercent

    html = """
           <div
                class='note'
                note= '#{@nextNoteNumber}'
                pitch='#{key.pitch}'
                style='
                       top:    #{top}px;
                       height: #{height}px;
                       width:  #{width}px;
                       left:   #{left}px;
                '>
           </div>
           """

    html += """
            <div class='noteBar'
                 note= '#{@nextNoteNumber}'
                 pitch='#{key.pitch}'
                 side='right'
                 style='
                        top:    #{key.top}px;
                        height: #{@keyHeight/3}px;
                        left:   #{(left + width) - 2}px;
                 '>
            </div>
            """

    html += """
            <div class='noteBar'
                 note='#{@nextNoteNumber}'
                 pitch='#{key.pitch}'
                 side='left'
                 style='
                        top:    #{(key.top + @keyHeight) - @keyHeight/3}px;
                        height: #{@keyHeight/3}px;
                        left:   #{left}px;
                 '>
            </div>
            """

    @keyboard.append html

    note = $(".note[note=\"#{@nextNoteNumber}\"]")
    key.addNoteAtPosition note

    rightNoteBar = $(".noteBar[note=\"#{@nextNoteNumber}\"][side=\"right\"]")
    rightNoteBar.data 'note', note
    note.data 'rightBar', rightNoteBar

    leftNoteBar = $(".noteBar[note=\"#{@nextNoteNumber}\"][side=\"left\"]")
    leftNoteBar.data 'note', note
    note.data 'leftBar', leftNoteBar

    @nextNoteNumber++
    note

  ###
  Input handlers
  ###

  windowKeyDown: (e) ->
    if @selectedNote? and (e.which is 8 or e.which is 46)
      @removeNote @selectedNote
      @selectedNote = null
    ctrlPressed = true  if e.which is 17

  windowKeyUp: (e) ->
    ctrlPressed = false if e.which is 17

  windowMouseDown: (e) ->
    targetClass = $(e.target).attr("class")
    targetId = $(e.target).attr("id")

    switch targetClass
      when "noteBar"
        @noteBarMouseDown e
      when "note"
        @noteMouseDown e
      when "line", "keyLine"
        @keyboardMouseDown e
      else
        if targetId? and targetId is "keyboard"
          @keyboardMouseDown e

  windowMouseUp: (e) ->
    if @keyboardClicked or @clickedNoteBar? or @noteClicked
      if (@noteClicked or @clickedNoteBar?) and not @noteClickedMoved
        @selectedNote = @activeNote
      else
        @noteClickedMoved = false

      if @activeNote.width() is 0
        @removeNote @activeNote
        @activeNote = null

      $("body").css "cursor", "auto"
      @keyboardClicked = false
      @noteClicked = false
      @clickedNoteBar = null
      @activeNote = null

      if @hoveredNote? and @hoveredNote.attr("note") isnt $(e.target).attr("note")
        @unhoverNote()
      @windowMouseOver e

  windowMouseMove: (e) ->
    if @keyboardClicked or @clickedNoteBar? or @noteClicked
      @noteClickedMoved = true
      toX = e.pageX - @keyboard.offset().left
      if @noteClicked
        toX = toX - (@activeNote.width() - (@rightPosition - @fromX))

      unless ctrlPressed
        toX = @getSnappedToGrid(toX)

      if @keyboardClicked
        width = toX - @fromX

        if width >= 0
          left = @fromX
        else
          left = toX
          width = Math.abs(width)

        if left + width > @keyboardWidth
          width = @keyboardWidth - @fromX
        else if left < 0
          left = 0
          width = @fromX

      else if @clickedNoteBar?
        if @clickedNoteBar.attr("side") is "right"
          width = toX - @activeNote.position().left
          left = @activeNote.position().left
          if width < 0
            width = 0
          if left + width > @keyboardWidth
            width = @keyboardWidth - @activeNote.position().left
        else
          width = (@activeNote.position().left + @activeNote.width()) - toX
          if width >= 0
            left = toX
          else
            left = @activeNote.position().left + @activeNote.width()
            width = 0

          if left < 0
            left = 0
            width = @activeNote.width()
      else
        left = toX
        width = @activeNote.width()

        if left + width > @keyboardWidth
          left = @keyboardWidth - width
        else if left < 0
          left = 0

        $("body").css "cursor", "move"

      @activeNote.css "width", width + "px"

      @activeNote.css                  "left", left + "px"
      @activeNote.data('leftBar').css  "left", left + "px"
      @activeNote.data('rightBar').css "left", (left + width - @activeNote.data('rightBar').width()) + "px"

  windowMouseOver: (e) ->
    targetClass = $(e.target).attr("class")
    if targetClass is "note"
      @noteMouseOver e
    else if targetClass is "noteBar"
      @noteBarMouseOver e
    else
      if @hoveredNote? and (not (@noteClicked or @clickedNoteBar? or @keyboardClicked))
        if (not @activeNote?) or @hoveredNote.attr("note") isnt @activeNote.attr("note")
          @unhoverNote()

  keyboardMouseDown: (e) ->
    @deselectNotes()
    top = e.pageY - @keyboard.offset().top
    @addNoteAtPosition e.pageX - @keyboard.offset().left, top

  noteMouseDown: (e) ->
    pitch = $(e.target).attr("pitch")

    @activeNote = $(e.target)
    @noteClicked = true
    pitch = @activeNote.attr("pitch")

    if @selectedNote? and @activeNote.attr("note") isnt @selectedNote.attr("note")
      @deselectNotes()
    @fromX = e.pageX - @keyboard.offset().left
    @rightPosition = @activeNote.position().left + @activeNote.width()

  noteMouseOver: (e) ->
    unless @noteClicked or @clickedNoteBar? or @keyboardClicked
      @unhoverNote()  if @hoveredNote?
      @hoverNote $(e.target)

  noteBarMouseDown: (e) ->
    pitch = $(e.target).attr("pitch")
    @fromX = @getSnappedToGrid(e.pageX - @keyboard.offset().left)

    @clickedNoteBar = $(e.target)
    @activeNote = @clickedNoteBar.data 'note'

    if @selectedNote? and @activeNote.attr("note") isnt @selectedNote.attr("note")
      @deselectNotes()

    if @clickedNoteBar.attr("side") is "left"
      @rightPosition = @activeNote.position().left + @activeNote.width()

    $("body").css "cursor", "col-resize"

  noteBarMouseOver: (e) ->
    unless @noteClicked or @clickedNoteBar? or @keyboardClicked
      @unhoverNote()  if @hoveredNote?
      @hoverNote $(e.target).data 'note'

  ###
  Accessor and query methods that do not modify state
  ###

  getKey: (top) ->
    index = Math.floor(top / @keyHeight)
    @keys[index]

  getSnappedToGrid: (position) ->
    positionMod = position % @beatWidth
    if positionMod < 10
      Math.floor(position / @beatWidth) * @beatWidth
    else if positionMod > @beatWidth - 10
      Math.ceil(position / @beatWidth) * @beatWidth
    else
      position

  getSongJSON: ->
    data = "{ \"notes\": ["
    mixerObject = this
    $(".note").each (i, n) =>
      data += """
              {
                "pitch":   "#{$(n).attr("pitch")}",
                "start":    #{($(n).position().left / this.beatWidth)},
                "duration": #{($(n).width() / this.beatWidth)}
              }
              """
      data += ", "  if i < $(".note").size() - 1
    data += "] }"

  setSongJSON: (data) ->
    @reset()

    if data.length > 0
      json = eval("(#{data})")
      $.each json['notes'], (i, note) =>
        key = @keysByPitch[note['pitch']]
        @addNote key, note['start']*@beatWidth, note['duration']*@beatWidth

  ###
  State modifier methods
  ###

  removeNote: (n) ->
    n.data('rightBar').remove()
    n.data('leftBar').remove()
    n.remove()

  hoverNote: (n) ->
    @unhoverNote

    @hoveredNote = n
    if @selectedNote? and @selectedNote.attr("note") is @hoveredNote.attr("note")
      color = noteSelectedHoverColor
    else
      color = noteHoverColor;

    @hoveredNote.css                  "background-color", color
    @hoveredNote.data('rightBar').css "background-color", color
    @hoveredNote.data('leftBar').css  "background-color", color

  unhoverNote: ->
    if @hoveredNote?
      if @selectedNote? and @selectedNote.attr("note") is @hoveredNote.attr("note")
        color = noteSelectedColor
      else
        color = noteColor

      @hoveredNote.css                  "background-color", color
      @hoveredNote.data('rightBar').css "background-color", color
      @hoveredNote.data('leftBar').css  "background-color", color

sendPlayRequest = (data, success) ->
  $('#play-status').html 'Sending song...'

  $.ajax(
    type: "POST"
    url: "/play/"
    processData: false
    data: "notes=#{data}"
    dataType: "text"
  ).done((msg) ->
    success msg
  ).fail (jqXHR, msg, x) ->
    alert "Error type: #{msg}\nMessage: #{x}"

mixer = new Mixer()
