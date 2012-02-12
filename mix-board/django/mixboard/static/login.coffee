# shamelessly copied from pauloppenheim's answer on
# http://stackoverflow.com/questions/1403888/get-url-parameter-with-jquery
`function getURLParameter(name) {
  return decodeURI(
      (RegExp('[?|&]' + name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
  );
}`

$(document).ready ->

  # these handlers have to get stuck above the login form-submit hander,
  # or they don't get called, for some reason

  $('#logoutButton').click (e) ->
    $.post '/logout/', '', (response) ->
      window.location.href = '/'

  $('#profileButton').click (e) ->
    window.location.href = "/user/profile/#{$('#userid').html()}/#{$('#username').html()}/"

  $('#usersButton').click (e) ->
    window.location.href = '/user/list/'

  $('#trendingButton').click (e) ->
    window.location.href = '/song/trending/'

  $('#loginButton').click (e) ->
    $('#hiddenLoginButton').click()

  # oh my god, why won't this form work properly?
  $('#loginForm input').keyup (e) ->
    if e.keyCode == 13
      $('#hiddenLoginButton').click()

  $('#loginForm').submit (e) ->
    e.preventDefault()
    $('#loginChoice').hide()
    window.blockLogin();

    username = $('#loginName').val()
    password = $('#loginPassword').val()
    url = $('#loginForm').attr 'action'
    next = getURLParameter 'next'

    postData =
      'username': username
      'password': password

    $.post url, postData, (response) ->
      switch response
        when 'success'
          if not next? or next == "null"
            window.location.replace(window.location.pathname)
          else
            window.location.href = next
        else
          window.unblockLogin();
          $('#loginChoice').show()

          loginError = $('#loginError')
          loginError.html response
          loginError.modal({ containerCss: {
                               height:50,
                               width: 350
                             }
                          })
