$(document).ready ->
  $.get '/song/trending/10/', (response) ->
    $('#trendingContainer').html response

    $('.trendingSong').mouseover (e) ->
      target =
        if $(e.target).is('.trendingSong')
          $(e.target)
        else
          $(e.target).parents('.trendingSong')

      if not $(e.target).is('.forkSongButton')
        target.addClass('buttonNoHover')
      else
        target.addClass('buttonBorder')

    $('.trendingSong').mouseout (e) ->
      target =
        if $(e.target).is('.trendingSong')
          $(e.target)
        else
          $(e.target).parents('.trendingSong')

      target.removeClass('buttonNoHover').removeClass('buttonBorder')

    $('.trendingSong').click (e) ->
      target =
        if $(e.target).is('.trendingSong')
          $(e.target)
        else
          $(e.target).parents('.trendingSong')

      if not $(e.target).is('.forkSongButton')
        username = target.find('.trendingSongUsername').attr 'name'
        songName = target.find('.trendingSongName').attr 'name'
        url = "/song/show/#{username}/#{songName}/"
        window.location.href = url
