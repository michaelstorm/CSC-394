(function() {

  $(document).ready(function() {
    $('#createSongButton').click(function() {
      return window.location.href = '/song/create/';
    });
    $('.userSong').mouseover(function(e) {
      var target;
      target = $(e.target).is('.userSong') ? $(e.target) : $(e.target).parents('.userSong');
      if (!$(e.target).is('.editSongButton')) {
        return target.addClass('buttonNoHover');
      } else {
        return target.addClass('buttonBorder');
      }
    });
    $('.userSong').mouseout(function(e) {
      var target;
      target = $(e.target).is('.userSong') ? $(e.target) : $(e.target).parents('.userSong');
      return target.removeClass('buttonNoHover').removeClass('buttonBorder');
    });
    $('.userSong').click(function(e) {
      var songId, songName, target, url, username;
      target = $(e.target).is('.userSong') ? $(e.target) : $(e.target).parents('.userSong');
      if (!$(e.target).is('.editSongButton')) {
        username = $('#profileUsername').html();
        songName = target.find('.userSongName').attr('name');
        songId = target.find('.userSongName').attr('songId');
        url = "/song/show/" + songId + "/" + username + "/" + songName + "/";
        return window.location.href = url;
      }
    });
    return $('#editBioButton').click(function(e) {
      var cancelButton, displaySpan, editSpan, saveButton, textarea;
      window.blockEditProfile();
      displaySpan = $("#bioDisplay");
      displaySpan.hide();
      editSpan = $("#bioEdit");
      editSpan.show();
      textarea = editSpan.find('textarea');
      cancelButton = editSpan.find('#cancelButton');
      saveButton = editSpan.find('#saveButton');
      textarea.autoResize();
      textarea.focus();
      cancelButton.click(function(e) {
        editSpan.hide();
        displaySpan.show();
        return window.unblockEditProfile();
      });
      return saveButton.click(function(e) {
        var editedBio, postData;
        window.blockEditBio();
        editedBio = textarea.val();
        postData = {
          'bio': editedBio
        };
        return $.post('/user/update/profile/', postData, function(response) {
          var markdown_request;
          if (response === 'success') {
            markdown_request = {
              'text': editedBio
            };
            return $.post('/markdownify/', markdown_request, function(markdown_response) {
              editSpan.hide();
              $('#bioDisplay').html(markdown_response);
              displaySpan.show();
              window.unblockEditBio();
              return window.unblockEditProfile();
            });
          } else {
            window.unblockEditBio();
            window.unblockEditProfile();
            return alert(response);
          }
        });
      });
    });
  });

}).call(this);
