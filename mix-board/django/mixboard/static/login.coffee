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
    next = getURLParameter 'next'
    if not next?
      next = '/'

    postData =
      'username': username
      'password': password

    $.post url, postData, (response) ->
      switch response
        when 'success' then window.location.href = next
        else $('#loginError').html response

  $('#logoutButton').click (e) ->
    $.post '/logout/', '', (response) ->
      window.location.href = '/'
