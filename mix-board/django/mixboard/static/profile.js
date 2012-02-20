(function() {

  $(document).ready(function() {
    var t;
    t = $('#bioEdit textarea');
    t.data('codeMirror', CodeMirror.fromTextArea(t.get(0), {
      mode: {
        name: "markdown"
      },
      theme: "night"
    }));
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
      var postData, song, songId, songName, target, url, username;
      target = $(e.target).is('.userSong') ? $(e.target) : $(e.target).parents('.userSong');
      if ($(e.target).is('.forkSongButton')) {
        song = target.find('.userSongName').attr('songId');
        postData = {
          'song': song
        };
        return $.post('/song/fork/', postData, function(response) {
          if (/^\d+$/.test(response)) {
            return window.location.href = "/song/edit/" + response + "/";
          } else if (response === 'dup_name') {
            window.forkSong = song;
            return $('#chooseForkNameModal').modal();
          }
        });
      } else if ($(e.target).is('.deleteSongButton')) {
        songId = target.find('.userSongName').attr('songId');
        postData = {
          'song': songId
        };
        return $.post('/song/delete/', postData, function(response) {
          if (response === 'success') {
            return window.location.reload();
          } else {
            return alert(response);
          }
        });
      } else if (!$(e.target).is('.editSongButton')) {
        username = $('#profileUsername').html();
        songName = target.find('.userSongName').attr('name');
        songId = target.find('.userSongName').attr('songId');
        url = "/song/show/" + songId + "/" + username + "/" + songName + "/";
        return window.location.href = url;
      }
    });
    $('#editBioButton').click(function(e) {
      var cancelButton, displaySpan, editSpan, saveButton, textarea;
      window.blockEditProfile();
      displaySpan = $("#bioDisplay");
      displaySpan.hide();
      editSpan = $("#bioEdit");
      editSpan.show();
      textarea = editSpan.find('textarea');
      cancelButton = editSpan.find('#cancelButton');
      saveButton = editSpan.find('#saveButton');
      textarea.focus();
      textarea.data('codeMirror').refresh();
      cancelButton.click(function(e) {
        editSpan.hide();
        displaySpan.show();
        return window.unblockEditProfile();
      });
      return saveButton.click(function(e) {
        var editedBio, postData;
        window.blockEditBio();
        editedBio = textarea.data('codeMirror').getValue();
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
    return $('#chooseForkNameForm').submit(function(e) {
      var name, postData;
      e.preventDefault();
      name = $('#chooseForkNameForm #forkSongName').val();
      postData = {
        'song': window.forkSong,
        'name': name
      };
      return $.post('/song/fork/', postData, function(response) {
        if (/^\d+$/.test(response)) {
          return window.location.href = "/song/edit/" + response + "/";
        } else {
          return $('#chooseForkNameForm #error').html(response);
        }
      });
    });
  });

}).call(this);
