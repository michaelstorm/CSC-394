(function() {
  function getURLParameter(name) {
  return decodeURI(
      (RegExp('[?|&]' + name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
  );
};

    $(document).ready(function() {
    $('#signupForm').submit(function(e) {
        e.preventDefault();
        var registerName, registerEmail, registerPassword;
        username = $('#registerName').val();
        password = $('#registerPassword').val();
        email = $('#registerEmail').val();
        url = $('#signupForm').attr('action');
        next = getURLParameter('next');
        postData = {
            'username': username,
            'password': password
            'email':email
        };
        
        return $.post(url, postData, function(response) {
            switch (response) {
                case 'success':
                    return window.location.replace(next);
                case 'invalid':
                    return $('#signupError').html('Incorrect username or password.');
                case 'inactive':
                    return $('#signupError').html('Account inactive.');
                default:
                    return $('#signupError').html('Unknown error.');
            }
      });
        
    });
}).call(this);
