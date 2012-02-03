(function() {
  function getURLParameter(name) {
  return decodeURI(
      (RegExp('[?|&]' + name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
  );
};
  $(document).ready(function() {
    $('#loginForm').submit(function(e) {
      var next, password, postData, url, username;
      e.preventDefault();
      username = $('#loginName').val();
      password = $('#loginPassword').val();
      url = $('#loginForm').attr('action');
      next = getURLParameter('next');
      postData = {
        'username': username,
        'password': password
      };
      return $.post(url, postData, function(response) {
        switch (response) {
          case 'success':
            return window.location.replace(next);
          case 'invalid':
            return $('#loginError').html('Incorrect username or password.');
          case 'inactive':
            return $('#loginError').html('Account inactive.');
          default:
            return $('#loginError').html('Unknown error.');
        }
      });
    });
    return $('#logoutButton').click(function(e) {
      return $.post('/logout/', '', function(response) {
        return window.location.href = '/';
      });
    });
  });

}).call(this);
