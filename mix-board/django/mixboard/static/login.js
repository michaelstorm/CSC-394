(function() {
  function getURLParameter(name) {
  return decodeURI(
      (RegExp('[?|&]' + name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
  );
};  $(document).ready(function() {
    $('#loginForm').submit(function(e) {
      var next, password, postData, url, username;
      e.preventDefault();
      username = $('#loginName').val();
      password = $('#loginPassword').val();
      url = $('#loginForm').attr('action');
      next = '/';
      postData = {
        'username': username,
        'password': password
      };
      return $.post(url, postData, function(response) {
        switch (response) {
          case 'success':
            break;
          case 'invalid':
            $('#loginError').html('Incorrect username or password.');
            break;
          case 'inactive':
            $('#loginError').html('Account inactive.');
            break;
          default:
            $('#loginError').html('Unknown error.');
        }
        return window.location.replace(next);
      });
    });
    return $('#logoutButton').click(function(e) {
      return $.post('/logout/', '', function(response) {
        return window.location.href = '/';
      });
    });
  });
}).call(this);
