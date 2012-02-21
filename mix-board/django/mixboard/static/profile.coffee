$(document).ready ->
  t = $('#bioEdit textarea')
  t.data 'codeMirror', CodeMirror.fromTextArea(t.get(0),
    mode:
      name: "markdown"
    theme: "night"
  )

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

    if $(e.target).is('.forkSongButton')
      song = $(e.target).parents('.userSong')
      window.forkSong = song.attr 'songId'
      name = song.find('.userSongName').html()

      forkSongName = $('#chooseForkNameModal #forkSongName')
      forkSongName.val("#{name} [fork]")

      $('#chooseForkNameModal').modal()
      forkSongName.focus()
      forkSongName.select()

    else if $(e.target).is('.deleteSongButton')
      songId = target.find('.userSongName').attr 'songId'
      postData =
        'song': songId

      $.post '/song/delete/', postData, (response) ->
        if response == 'success'
          window.location.reload()
        else alert response

    else if not $(e.target).is('.editSongButton')
      username = $('#profileUsername').html()
      songName = target.find('.userSongName').attr 'name'
      songId = target.find('.userSongName').attr 'songId'
      url = "/song/show/#{songId}/#{username}/#{songName}/"
      window.location.href = url

  $('#editBioButton').click (e) ->
    window.blockEditProfile();

    displaySpan = $("#bioDisplay")
    displaySpan.hide()

    editSpan = $("#bioEdit")
    editSpan.show()

    textarea      = editSpan.find('textarea')
    cancelButton  = editSpan.find('#cancelButton')
    saveButton    = editSpan.find('#saveButton')
    textarea.focus()
    textarea.data('codeMirror').refresh()

    cancelButton.click (e) ->
      editSpan.hide()
      displaySpan.show()
      window.unblockEditProfile()

    saveButton.click (e) ->
      window.blockEditBio()

      editedBio = textarea.data('codeMirror').getValue()
      postData =
        'bio': editedBio

      $.post '/user/update/profile/', postData, (response) ->
        if response == 'success'
          markdown_request =
            'text': editedBio
          $.post '/markdownify/', markdown_request, (markdown_response) ->
            editSpan.hide()
            $('#bioDisplay').html markdown_response
            displaySpan.show()
            window.unblockEditBio()
            window.unblockEditProfile()
        else
          window.unblockEditBio()
          window.unblockEditProfile()
          alert response

  $('#chooseForkNameForm').submit (e) ->
    e.preventDefault()
    window.blockChooseForkName();

    name = $('#chooseForkNameForm #forkSongName').val()

    postData =
      'song': window.forkSong
      'name': name

    $.post '/song/fork/', postData, (response) ->
      if /^\d+$/.test(response)
        window.location.href = "/song/edit/#{response}/"
      else
        window.unblockChooseForkName();
        $('#chooseForkNameForm #error').html response
