$(document).ready ->
  $.get '/song/trending/', (response) ->
    $('#trendingContainer').html response

    $('.trendingSong').mouseover (e) ->
      target =
        if $(e.target).is('.trendingSong')
          $(e.target)
        else
          $(e.target).parents('.trendingSong')

      target.addClass('button')

    $('.trendingSong').mouseout (e) ->
      target =
        if $(e.target).is('.trendingSong')
          $(e.target)
        else
          $(e.target).parents('.trendingSong')

      target.removeClass('button')

    $('.trendingSong').click (e) ->
      target =
        if $(e.target).is('.trendingSong')
          $(e.target)
        else
          $(e.target).parents('.trendingSong')

      username = target.find('.trendingSongUsername').attr 'name'
      songName = target.find('.trendingSongName').attr 'name'
      url = "/song/show/#{username}/#{songName}/"
      window.location.href = url
