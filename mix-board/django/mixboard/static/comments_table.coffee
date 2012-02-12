window.attachCommentButtonHandlers = ->
  $('.editCommentButton').click (e) ->
    editComment(e)

  $('.deleteCommentButton').click (e) ->
    deleteComment(e)

editComment = (e) ->
  window.blockEditComments();

  commentId = $(e.target).attr 'comment'
  displaySpan = $(".commentBodyDisplay[comment=\"#{commentId}\"]")
  if displaySpan.find('textarea').length > 0 # in case user clicks edit twice
    console.log 'edit clicked twice'
    return

  commentHtml = displaySpan.html()

  rawSpan = $(".commentBodyRaw[comment=\"#{commentId}\"]")
  commentBody = rawSpan.html()
  editHtml = """
             <div id="textareaOverlay">
               <textarea style='resize: none;
                                overflow: hidden;
                                width: #{displaySpan.width()}px;
                                height: #{displaySpan.height()}px;'>#{commentBody}</textarea>
             </div>
             <div id="cancelOverlay" style='float: right;'>
               <button type='button' id='cancelButton' style='font-size: 10pt;'>cancel</button>
             </div>
             <div id="saveOverlay" style='float: right;'>
               <button type='button' id='saveButton' style='font-size: 10pt;'>save</button>
             </div>
             <div id="busyIndicator" style="display: none; float: right;">
              <img src="/static/busy.gif/">
             </div>
             """

  displaySpan.html editHtml
  textarea      = displaySpan.find('textarea')
  cancelButton  = displaySpan.find('#cancelButton')
  saveButton    = displaySpan.find('#saveButton')
  busyIndicator = displaySpan.find('#busyIndicator')
  textarea.autoResize()

  cancelButton.click (e) ->
    displaySpan.html commentHtml
    window.unblockEditComments()

  saveButton.click (e) ->
    disabledElements = [
      displaySpan.children("#textareaOverlay")
      displaySpan.children("#saveOverlay")
      displaySpan.children("#cancelOverlay")
    ]

    $(disabledElements).each (i, element) ->
      element.block { message: null, fadeIn: 400 }
    busyIndicator.attr 'style', 'float: right; margin: 7px;'

    editedCommentBody = textarea.val()
    postData =
      'comment': commentId
      'text':    editedCommentBody

    $.post '/song/comment/edit/', postData, (response) ->
      if response == 'success'
        window.unblockEditComments()

        commentsUrl = "/song/comment/list/#{$('#songOwner').text()}/#{$('#songName').text()}/"
        $.get commentsUrl, (comments) ->
          $(disabledElements).each (i, element) ->
            element.unblock { fadeOut: 0 }

          $('#commentsContainer').html comments
          window.attachCommentButtonHandlers()
      else
        alert response

deleteComment = (e) ->
  commentId = $(e.target).attr 'comment'

  postData =
    'comment': commentId

  $.post '/song/comment/delete/', postData, (response) ->
    switch response
      when 'success'
        commentsUrl = "/song/comment/list/#{$('#songOwner').text()}/#{$('#songName').text()}/"
        $.get commentsUrl, (comments) ->
          $('#commentsContainer').html comments
          window.attachCommentButtonHandlers()
      else alert response

$(document).ready ->
  $('#addCommentText').autoResize()
  window.attachCommentButtonHandlers()
