(function() {

  $(document).ready(function() {
    $('.profile').mouseover(function(e) {
      var target;
      target = $(e.target).is('.profile') ? $(e.target) : $(e.target).parents('.profile');
      return target.addClass('button');
    });
    $('.profile').mouseout(function(e) {
      var target;
      target = $(e.target).is('.profile') ? $(e.target) : $(e.target).parents('.profile');
      return target.removeClass('button');
    });
    return $('.profile').click(function(e) {
      var profileUsername, target, url;
      target = $(e.target).is('.profile') ? $(e.target) : $(e.target).parents('.profile');
      profileUsername = target.find('.profileUsername').attr('name');
      url = "/user/profile/" + profileUsername + "/";
      return window.location.href = url;
    });
  });

}).call(this);
