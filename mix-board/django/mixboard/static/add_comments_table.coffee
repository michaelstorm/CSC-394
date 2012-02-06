$(document).ready ->
  $('#addCommentButton').click ->
    postData =
      'text': $('#addCommentText').val()
    $('#addCommentText').val('')

    url = "/song/comment/add/#{$('#songOwner').text()}/#{$('#songName').text()}/"
    $.post url, postData, (response) ->
      switch response
        when 'success'
          commentsUrl = "/song/comment/list/#{$('#songOwner').text()}/#{$('#songName').text()}/"
          $.get commentsUrl, (comments) ->
            $('#commentsContainer').html comments
            window.attachCommentButtonHandlers()
        else alert response
