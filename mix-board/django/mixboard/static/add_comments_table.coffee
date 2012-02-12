$(document).ready ->
  $('#addCommentButton').click ->
    window.blockAddComment();

    postData =
      'song': $('#songId').html()
      'text': $('#addCommentText').val()
    $('#addCommentText').val('')

    url = "/song/comment/add/"
    $.post url, postData, (response) ->
      window.unblockAddComment();

      switch response
        when 'success'
          commentsUrl = "/song/comment/list/#{$('#songOwner').text()}/#{$('#songName').text()}/"
          $.get commentsUrl, (comments) ->
            $('#commentsContainer').html comments
            window.attachCommentButtonHandlers()
        else alert response
