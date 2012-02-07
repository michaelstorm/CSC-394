$(document).ready ->
  $('.profile').mouseover (e) ->
    target =
      if $(e.target).is('.profile')
        $(e.target)
      else
        $(e.target).parents('.profile')

    target.addClass('button')

  $('.profile').mouseout (e) ->
    target =
      if $(e.target).is('.profile')
        $(e.target)
      else
        $(e.target).parents('.profile')

    target.removeClass('button')

  $('.profile').click (e) ->
    target =
      if $(e.target).is('.profile')
        $(e.target)
      else
        $(e.target).parents('.profile')

    profileUsername = target.find('.profileUsername').attr 'name'
    url = "/user/profile/#{profileUsername}/"
    window.location.href = url
