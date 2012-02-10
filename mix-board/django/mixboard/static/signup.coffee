# shamelessly copied from pauloppenheim's answer on
# http://stackoverflow.com/questions/1403888/get-url-parameter-with-jquery
`function getURLParameter(name) {
  return decodeURI(
      (RegExp('[?|&]' + name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
  );
}`

$(document).ready ->
  $('#registerForm').submit (e) ->
    e.preventDefault()

    username = $('#registerName').val()
    email    = $('#registerEmail').val()
    password = $('#registerPassword').val()
    url      = $('#registerForm').attr 'action'
    next = getURLParameter 'next'

    postData =
      'username': username
      'email'   : email
      'password': password

    $.post url, postData, (response) ->
      switch response
        when 'success'
          if not next? or next == "null"
            window.location.replace(window.location.pathname)
          else
            window.location.href = next
        else $('#registerError').html response
