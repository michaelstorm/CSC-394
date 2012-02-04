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
      next = getURLParameter('next');
      postData = {
        'username': username,
        'password': password,
        'email': email
      };
      return $.post(url, postData, function(response) {
        switch (response) {
          case 'success':
            return window.location.replace(next);
          case 'exists':
            return $('#signupError').html('Name exists');
        }
      });
    });
  });
}).call(this);
