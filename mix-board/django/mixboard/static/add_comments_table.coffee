$(document).ready ->
  codeMirror = CodeMirror($('#addCommentText').get(0),
    mode:
      name: "markdown"
    theme: "night"
  )

  $('#addCommentButton').click ->
    window.blockAddComment();

    postData =
      'song': $('#songId').html()
      'text': codeMirror.getValue()
    codeMirror.setValue('')

    url = "/song/comment/add/"
    $.post url, postData, (response) ->
      window.unblockAddComment()

      switch response
        when 'success'
          commentsUrl = "/song/comment/list/#{$('#songId').text()}/"
          $.get commentsUrl, (comments) ->
            $('#commentsContainer').html comments
            window.attachCommentButtonHandlers()
        else alert response
