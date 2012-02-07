$(document).ready ->
  $('#createSongButton').click ->
    window.location.href = '/song/create/'

  $('.userSong').mouseover (e) ->
    target =
      if $(e.target).is('.userSong')
        $(e.target)
      else
        $(e.target).parents('.userSong')

    target.addClass('button')

  $('.userSong').mouseout (e) ->
    target =
      if $(e.target).is('.userSong')
        $(e.target)
      else
        $(e.target).parents('.userSong')

    target.removeClass('button')

  $('.userSong').click (e) ->
    target =
      if $(e.target).is('.userSong')
        $(e.target)
      else
        $(e.target).parents('.userSong')

    username = $('#profileUsername').html()
    songName = target.find('.userSongName').attr 'name'
    url = "/song/show/#{username}/#{songName}/"
    window.location.href = url
