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

    if $(e.target).is('.forkSongButton')
      song = target.find('.userSongName').attr 'songId'
      console.log 'song: ' + song
      postData =
        'song': song
      console.log 'postData: ' + postData

      $.post '/song/fork/', postData, (response) ->
        console.log 'response: ' + response
        if /^\d+$/.test(response)
          window.location.href = "/song/edit/#{response}/"
        else if response == 'dup_name'
          window.forkSong = song
          $('#chooseForkNameModal').modal()

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
    textarea.autoResize()
    textarea.focus()

    cancelButton.click (e) ->
      editSpan.hide()
      displaySpan.show()
      window.unblockEditProfile()

    saveButton.click (e) ->
      window.blockEditBio()

      editedBio = textarea.val()
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
    console.log 'submitted'

    name = $('#chooseForkNameForm #forkSongName').val()

    postData =
      'song': window.forkSong
      'name': name

    $.post '/song/fork/', postData, (response) ->
      console.log 'response: ' + response
      if /^\d+$/.test(response)
        window.location.href = "/song/edit/#{response}/"
      else
        $('#chooseForkNameForm #error').html response
