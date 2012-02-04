(function() {
  function getURLParameter(name) {
  return decodeURI(
      (RegExp('[?|&]' + name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
  );
};  $(document).ready(function() {
    return $('#signupForm').submit(function(e) {
      var email, next, password, postData, url, username;
      e.preventDefault();
      username = $('#registerName').val();
      password = $('#registerPassword').val();
      email = $('#registerEmail').val();
      url = $('#signupForm').attr('action');
      next = '/signupSuccess/';
      postData = {
        'username': username,
        'password': password,
        'email': email
      };
      return $.post(url, postData, function(response) {
        switch (response) {
          case 'success':
            break;
          case 'exists':
            $('#signupError').html('Name exists');
        }
        return window.location.replace(next);
      });
    });
  });
}).call(this);
