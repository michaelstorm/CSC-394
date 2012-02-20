# shamelessly copied from pauloppenheim's answer on
# http://stackoverflow.com/questions/1403888/get-url-parameter-with-jquery
`function getURLParameter(name) {
  return decodeURI(
      (RegExp('[?|&]' + name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
  );
}`

###
Please don't be a jerk with this.
###

window.onerror = (msg, url, line) ->
  params =
    'msg':  msg
    'url':  url
    'line': line

  $.post '/error/', params, (response) ->

#  `var form = document.createElement("form");
#  form.setAttribute("method", "POST");
#  form.setAttribute("action", "/error/");

#  for (var key in params) {
#      if (params.hasOwnProperty(key)) {
#          var hiddenField = document.createElement("input");
#          hiddenField.setAttribute("type", "hidden");
#          hiddenField.setAttribute("name", key);
#          hiddenField.setAttribute("value", params[key]);

#          form.appendChild(hiddenField);
#       }
#  }

#  document.body.appendChild(form);
#  form.submit();`

  return true

window.testError = () ->
  throw new Error("meeeeeeeeeeeessage")

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
