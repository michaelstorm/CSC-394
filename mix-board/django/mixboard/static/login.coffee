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
        else $('#loginError').html response

  $('#logoutButton').click (e) ->
    $.post '/logout/', '', (response) ->
      window.location.href = '/'

  $('#profileButton').click (e) ->
    window.location.href = '/user/profile/'+$('#username').text()+'/'

  $('#usersButton').click (e) ->
    window.location.href = '/user/list/'
