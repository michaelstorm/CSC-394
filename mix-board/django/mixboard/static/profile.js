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
      var songName, target, url, username;
      target = $(e.target).is('.userSong') ? $(e.target) : $(e.target).parents('.userSong');
      if (!$(e.target).is('.editSongButton')) {
        username = $('#profileUsername').html();
        songName = target.find('.userSongName').attr('name');
        url = "/song/show/" + username + "/" + songName + "/";
        return window.location.href = url;
      }
    });
    return $('#editBioButton').click(function(e) {
      var bioBody, bodySpan, editHtml;
      bodySpan = $("#bioField");
      if (bodySpan.find('textarea').length > 0) return;
      bioBody = bodySpan.text();
      editHtml = "<textarea style='resize: none;\n                 overflow: hidden;\n                 width: " + (bodySpan.width()) + "px;\n                 height: " + (bodySpan.height()) + "px;'>" + bioBody + "</textarea>\n<button type='button' id='cancelButton' style='float: right; font-size: 10pt;'>cancel</button>\n<button type='button' id='saveButton' style='float: right; font-size: 10pt;'>save</button>";
      bodySpan.html(editHtml);
      bodySpan.children('textarea').autoResize();
      bodySpan.children('#cancelButton').click(function(e) {
        return bodySpan.html(bioBody);
      });
      return bodySpan.children('#saveButton').click(function(e) {
        var editedBioBody, postData, url;
        editedBioBody = bodySpan.children('textarea').val();
        postData = {
          'bio': editedBioBody
        };
        url = "/user/update/profile/";
        return $.post(url, postData, function(response) {
          if (response === 'success') {
            return bodySpan.html(editedBioBody);
          } else {
            return alert(response);
          }
        });
      });
    });
  });

}).call(this);
