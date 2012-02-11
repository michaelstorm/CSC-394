$(document).ready ->
  $.get '/song/trending/10/', (response) ->
    $('#trendingContainer').html response

    $('#chooseForkNameForm').submit (e) ->
      e.preventDefault()

      name = $('#chooseForkNameForm #forkSongName').val()

      postData =
        'song': window.forkSong
        'name': name

      $.post '/song/fork/', postData, (response) ->
        if /^\d+$/.test(response)
          window.location.href = "/song/edit/#{response}/"
        else
          $('#chooseForkNameForm #error').html response

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
        songId   = target.attr 'songId'
        username = target.find('.trendingSongUsername').attr 'name'
        songName = target.find('.trendingSongName').attr 'name'
        url = "/song/show/#{songId}/#{username}/#{songName}/"
        window.location.href = url
      else
        song = $(e.target).parents('.trendingSong').attr 'songId'
        postData =
          'song': song

        $.post '/song/fork/', postData, (response) ->
          if /^\d+$/.test(response)
            window.location.href = "/song/edit/#{response}/"
          else if response == 'dup_name'
            window.forkSong = song
            $('#chooseForkNameModal').modal()
