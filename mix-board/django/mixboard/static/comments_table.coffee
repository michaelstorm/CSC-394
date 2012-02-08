window.attachCommentButtonHandlers = ->
  $('.editCommentButton').click (e) ->
    editComment(e)

  $('.deleteCommentButton').click (e) ->
    deleteComment(e)

editComment = (e) ->
  commentId = $(e.target).attr 'comment'
  bodySpan = $(".commentBody[comment=\"#{commentId}\"]")
  if bodySpan.find('textarea').length > 0
    return

  commentBody = bodySpan.text()
  editHtml = """
             <textarea style='resize: none;
                              overflow: hidden;
                              width: #{bodySpan.width()}px;
                              height: #{bodySpan.height()}px;'>#{commentBody}</textarea>
             <button type='button' id='cancelButton' style='float: right; font-size: 10pt;'>cancel</button>
             <button type='button' id='saveButton' style='float: right; font-size: 10pt;'>save</button>
             """
  bodySpan.html editHtml

  bodySpan.children('textarea').autoResize()

  bodySpan.children('#cancelButton').click (e) ->
    bodySpan.html commentBody

  bodySpan.children('#saveButton').click (e) ->
    editedCommentBody = bodySpan.children('textarea').val()
    postData =
      'text': editedCommentBody

    url = "/song/comment/edit/#{commentId}/"
    $.post url, postData, (response) ->
      if response == 'success'
        bodySpan.html editedCommentBody
      else
        alert response

deleteComment = (e) ->
  commentId = $(e.target).attr 'comment'

  url = "/song/comment/delete/#{commentId}/"
  $.post url, '', (response) ->
    switch response
      when 'success'
        commentsUrl = url = "/song/comment/list/#{$('#songOwner').text()}/#{$('#songName').text()}/"
        $.get commentsUrl, (comments) ->
          $('#commentsContainer').html comments
          window.attachCommentButtonHandlers()
      else alert response

$(document).ready ->
  $('#addCommentText').autoResize()
  window.attachCommentButtonHandlers()
