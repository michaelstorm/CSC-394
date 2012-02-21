(function() {

  $(document).ready(function() {
    return $.get('/song/trending/10/', function(response) {
      $('#trendingContainer').html(response);
      $('#chooseForkNameForm').submit(function(e) {
        var name, postData;
        e.preventDefault();
        window.blockChooseForkName();
        name = $('#chooseForkNameForm #forkSongName').val();
        postData = {
          'song': window.forkSong,
          'name': name
        };
        return $.post('/song/fork/', postData, function(response) {
          if (/^\d+$/.test(response)) {
            return window.location.href = "/song/edit/" + response + "/";
          } else {
            $('#chooseForkNameForm #error').html(response);
            return window.unblockChooseForkName();
          }
        });
      });
      $('.trendingSong').mouseover(function(e) {
        var target;
        target = $(e.target).is('.trendingSong') ? $(e.target) : $(e.target).parents('.trendingSong');
        if (!$(e.target).is('.forkSongButton')) {
          return target.addClass('buttonNoHover');
        } else {
          return target.addClass('buttonBorder');
        }
      });
      $('.trendingSong').mouseout(function(e) {
        var target;
        target = $(e.target).is('.trendingSong') ? $(e.target) : $(e.target).parents('.trendingSong');
        return target.removeClass('buttonNoHover').removeClass('buttonBorder');
      });
      return $('.trendingSong').click(function(e) {
        var forkSongName, name, song, songId, songName, target, url, username;
        target = $(e.target).is('.trendingSong') ? $(e.target) : $(e.target).parents('.trendingSong');
        if (!$(e.target).is('.forkSongButton')) {
          songId = target.attr('songId');
          username = target.find('.trendingSongUsername').attr('name');
          songName = target.find('.trendingSongName').attr('name');
          url = "/song/show/" + songId + "/" + username + "/" + songName + "/";
          return window.location.href = url;
        } else {
          song = $(e.target).parents('.trendingSong');
          window.forkSong = song.attr('songId');
          name = song.find('.trendingSongName').html();
          forkSongName = $('#chooseForkNameModal #forkSongName');
          forkSongName.val("" + name + " [fork]");
          $('#chooseForkNameModal').modal();
          forkSongName.focus();
          return forkSongName.select();
        }
      });
    });
  });

}).call(this);
