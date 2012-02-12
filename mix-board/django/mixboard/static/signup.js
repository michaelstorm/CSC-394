(function() {
  function getURLParameter(name) {
  return decodeURI(
      (RegExp('[?|&]' + name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
  );
};
  $(document).ready(function() {
    return $('#registerForm').submit(function(e) {
      var email, next, password, postData, url, username;
      window.blockSignup();
      e.preventDefault();
      username = $('#registerName').val();
      email = $('#registerEmail').val();
      password = $('#registerPassword').val();
      url = $('#registerForm').attr('action');
      next = getURLParameter('next');
      postData = {
        'username': username,
        'email': email,
        'password': password
      };
      return $.post(url, postData, function(response) {
        if (/^\d+$/.test(response)) {
          if (!(next != null) || next === "null") {
            return window.location.replace("/user/profile/" + response + "/");
          } else {
            return window.location.href = next;
          }
        } else {
          window.unblockSignup();
          return $('#registerError').html(response);
        }
      });
    });
  });

}).call(this);
