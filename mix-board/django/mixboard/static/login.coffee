# shamelessly copied from pauloppenheim's answer on
# http://stackoverflow.com/questions/1403888/get-url-parameter-with-jquery
`function getURLParameter(name) {
  return decodeURI(
      (RegExp('[?|&]' + name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
  );
}`

$(document).ready ->
  $('#loginForm').submit (e) ->
    e.preventDefault()

    username = $('#loginName').val()
    password = $('#loginPassword').val()
    url = $('#loginForm').attr 'action'
    next = '/'

    postData =
      'username': username
      'password': password

    $.post url, postData, (response) ->
      switch response
        when 'success' then break
        when 'invalid' then $('#loginError').html 'Incorrect username or password.'
        when 'inactive' then $('#loginError').html 'Account inactive.'
        else $('#loginError').html 'Unknown error.'
      window.location.replace next

  $('#logoutButton').click (e) ->
    $.post '/logout/', '', (response) ->
      window.location.href = '/'
