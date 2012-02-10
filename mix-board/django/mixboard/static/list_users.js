(function() {

  $(document).ready(function() {
    $('.profile').mouseover(function(e) {
      var target;
      target = $(e.target).is('.profile') ? $(e.target) : $(e.target).parents('.profile');
      return target.addClass('buttonNoHover');
    });
    $('.profile').mouseout(function(e) {
      var target;
      target = $(e.target).is('.profile') ? $(e.target) : $(e.target).parents('.profile');
      return target.removeClass('buttonNoHover');
    });
    return $('.profile').click(function(e) {
      var profileId, profileUsername, target, url;
      target = $(e.target).is('.profile') ? $(e.target) : $(e.target).parents('.profile');
      profileUsername = target.find('.profileUsername').attr('name');
      profileId = target.find('.profileUsername').attr('userid');
      url = "/user/profile/" + profileId + "/" + profileUsername + "/";
      return window.location.href = url;
    });
  });

}).call(this);
