$(document).ready ->
  $('.profile').mouseover (e) ->
    target =
      if $(e.target).is('.profile')
        $(e.target)
      else
        $(e.target).parents('.profile')

    target.addClass('buttonNoHover')

  $('.profile').mouseout (e) ->
    target =
      if $(e.target).is('.profile')
        $(e.target)
      else
        $(e.target).parents('.profile')

    target.removeClass('buttonNoHover')

  $('.profile').click (e) ->
    target =
      if $(e.target).is('.profile')
        $(e.target)
      else
        $(e.target).parents('.profile')

    profileUsername = target.find('.profileUsername').attr 'name'
    profileId = target.find('.profileUsername').attr 'userid'
    url = "/user/profile/#{profileId}/#{profileUsername}/"
    window.location.href = url
