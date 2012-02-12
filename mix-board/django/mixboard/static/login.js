(function() {
  function getURLParameter(name) {
  return decodeURI(
      (RegExp('[?|&]' + name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
  );
};
  $(document).ready(function() {
    $('#logoutButton').click(function(e) {
      return $.post('/logout/', '', function(response) {
        return window.location.href = '/';
      });
    });
    $('#profileButton').click(function(e) {
      return window.location.href = "/user/profile/" + ($('#userid').html()) + "/" + ($('#username').html()) + "/";
    });
    $('#usersButton').click(function(e) {
      return window.location.href = '/user/list/';
    });
    $('#trendingButton').click(function(e) {
      return window.location.href = '/song/trending/';
    });
    $('#loginButton').click(function(e) {
      return $('#hiddenLoginButton').click();
    });
    $('#loginForm input').keyup(function(e) {
      if (e.keyCode === 13) return $('#hiddenLoginButton').click();
    });
    return $('#loginForm').submit(function(e) {
      var next, password, postData, url, username;
      e.preventDefault();
      $('#loginChoice').hide();
      window.blockLogin();
      username = $('#loginName').val();
      password = $('#loginPassword').val();
      url = $('#loginForm').attr('action');
      next = getURLParameter('next');
      postData = {
        'username': username,
        'password': password
      };
      return $.post(url, postData, function(response) {
        var loginError;
        switch (response) {
          case 'success':
            if (!(next != null) || next === "null") {
              return window.location.replace(window.location.pathname);
            } else {
              return window.location.href = next;
            }
            break;
          default:
            window.unblockLogin();
            $('#loginChoice').show();
            loginError = $('#loginError');
            loginError.html(response);
            return loginError.modal({
              containerCss: {
                height: 50,
                width: 350
              }
            });
        }
      });
    });
  });

}).call(this);
