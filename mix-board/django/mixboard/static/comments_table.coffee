window.attachCommentButtonHandlers = ->
  $('.editCommentButton').click (e) ->
    editComment(e)

  $('.deleteCommentButton').click (e) ->
    deleteComment(e)

editComment = (e) ->
  window.blockEditComments();

  commentId = $(e.target).attr 'comment'
  displaySpan = $(".commentBodyDisplay[comment=\"#{commentId}\"]")
  displaySpan.hide()

  editSpan = $(".commentBodyEdit[comment=\"#{commentId}\"]")
  editSpan.show()

  textarea      = editSpan.find('textarea')
  cancelButton  = editSpan.find('#cancelButton')
  saveButton    = editSpan.find('#saveButton')
  textarea.autoResize()
  textarea.focus()

  cancelButton.click (e) ->
    editSpan.hide()
    displaySpan.show()
    window.unblockEditComments()

  saveButton.click (e) ->
    window["blockEditCommentArea_#{commentId}"]()

    editedCommentBody = textarea.val()
    postData =
      'comment': commentId
      'text':    editedCommentBody

    $.post '/song/comment/edit/', postData, (response) ->
      if response == 'success'
        commentsUrl = "/song/comment/list/#{$('#songOwner').text()}/#{$('#songName').text()}/"
        $.get commentsUrl, (comments) ->
          $('#commentsContainer').html comments
          window.attachCommentButtonHandlers()
      else
        window["unblockEditCommentArea_#{commentId}"]()
        alert response

deleteComment = (e) ->
  window.blockEditComments();
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
      else
        window.unblockEditComments()
        alert response

$(document).ready ->
  $('#addCommentText').autoResize()
  window.attachCommentButtonHandlers()
