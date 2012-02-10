$(document).ready ->
  $('#createSongButton').click ->
    window.location.href = '/song/create/'

  $('.userSong').mouseover (e) ->
    target =
      if $(e.target).is('.userSong')
        $(e.target)
      else
        $(e.target).parents('.userSong')

    if not $(e.target).is('.editSongButton')
      target.addClass('buttonNoHover')
    else
      target.addClass('buttonBorder')

  $('.userSong').mouseout (e) ->
    target =
      if $(e.target).is('.userSong')
        $(e.target)
      else
        $(e.target).parents('.userSong')

    target.removeClass('buttonNoHover').removeClass('buttonBorder')

  $('.userSong').click (e) ->
    target =
      if $(e.target).is('.userSong')
        $(e.target)
      else
        $(e.target).parents('.userSong')

    if not $(e.target).is('.editSongButton')
      username = $('#profileUsername').html()
      songName = target.find('.userSongName').attr 'name'
      songId = target.find('.userSongName').attr 'songId'
      url = "/song/show/#{songId}/#{username}/#{songName}/"
      window.location.href = url

  $('#editBioButton').click (e) ->
    bodySpan = $("#bioField")
    if bodySpan.find('textarea').length > 0
      return

    bioBody = bodySpan.text()
    editHtml = """
               <textarea style='resize: none;
                                overflow: hidden;
                                width: #{bodySpan.width()}px;
                                height: #{bodySpan.height()}px;'>#{bioBody}</textarea>
               <button type='button' id='cancelButton' style='float: right; font-size: 10pt;'>cancel</button>
               <button type='button' id='saveButton' style='float: right; font-size: 10pt;'>save</button>
               """
    bodySpan.html editHtml

    bodySpan.children('textarea').autoResize()

    bodySpan.children('#cancelButton').click (e) ->
      bodySpan.html bioBody

    bodySpan.children('#saveButton').click (e) ->
      editedBioBody = bodySpan.children('textarea').val()
      postData =
        'bio': editedBioBody

      url = "/user/update/profile/"
      $.post url, postData, (response) ->
        if response == 'success'
          bodySpan.html editedBioBody
        else
          alert response
