(function() {

  $(document).ready(function() {
    $('.userSong').mouseover(function(e) {
      var target;
      target = $(e.target).is('.userSong') ? $(e.target) : $(e.target).parents('.userSong');
      return target.addClass('button');
    });
    $('.userSong').mouseout(function(e) {
      var target;
      target = $(e.target).is('.userSong') ? $(e.target) : $(e.target).parents('.userSong');
      return target.removeClass('button');
    });
    return $('.userSong').click(function(e) {
      var songName, target, url, username;
      target = $(e.target).is('.userSong') ? $(e.target) : $(e.target).parents('.userSong');
      username = $('#profileUsername').html();
      songName = target.find('.userSongName').attr('name');
      url = "/song/show/" + username + "/" + songName + "/";
      return window.location.href = url;
    });
  });

}).call(this);
