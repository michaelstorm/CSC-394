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
      if (!(next != null)) next = '/';
      postData = {
        'username': username,
        'password': password
      };
      return $.post(url, postData, function(response) {
        switch (response) {
          case 'success':
            return window.location.href = next;
          default:
            return $('#loginError').html(response);
        }
      });
    });
    $('#logoutButton').click(function(e) {
      return $.post('/logout/', '', function(response) {
        return window.location.href = '/';
      });
    });
    $('#profileButton').click(function(e) {
      return window.location.href = '/user/profile/' + $('#username').text() + '/';
    });
    return $('#usersButton').click(function(e) {
      return window.location.href = '/user/list/';
    });
  });

}).call(this);
