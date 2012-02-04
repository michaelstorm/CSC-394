# shamelessly copied from pauloppenheim's answer on
# http://stackoverflow.com/questions/1403888/get-url-parameter-with-jquery
`function getURLParameter(name) {
  return decodeURI(
      (RegExp('[?|&]' + name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
  );
}`

$(document).ready ->
  $('#signupForm').submit (e) ->
    e.preventDefault()

    username = $('#registerName').val()
    password = $('#registerPassword').val()
    email = $('#registerEmail').val()
    url = $('#signupForm').attr 'action'
    next = '/signupSuccess/'

    postData =
      'username': username
      'password': password
      'email': email

    $.post url, postData, (response) ->
      switch response
        when 'success' then break
        when 'exists' then $('#signupError').html 'Name exists'
      window.location.replace next


