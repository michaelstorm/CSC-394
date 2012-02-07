(function() {

  $(document).ready(function() {
    return $.get('/song/trending/10/', function(response) {
      $('#trendingContainer').html(response);
      $('.trendingSong').mouseover(function(e) {
        var target;
        target = $(e.target).is('.trendingSong') ? $(e.target) : $(e.target).parents('.trendingSong');
        return target.addClass('button');
      });
      $('.trendingSong').mouseout(function(e) {
        var target;
        target = $(e.target).is('.trendingSong') ? $(e.target) : $(e.target).parents('.trendingSong');
        return target.removeClass('button');
      });
      return $('.trendingSong').click(function(e) {
        var songName, target, url, username;
        target = $(e.target).is('.trendingSong') ? $(e.target) : $(e.target).parents('.trendingSong');
        username = target.find('.trendingSongUsername').attr('name');
        songName = target.find('.trendingSongName').attr('name');
        url = "/song/show/" + username + "/" + songName + "/";
        return window.location.href = url;
      });
    });
  });

}).call(this);
