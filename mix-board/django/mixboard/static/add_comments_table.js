(function() {

  $(document).ready(function() {
    return $('#addCommentButton').click(function() {
      var postData, url;
      window.blockAddComment();
      postData = {
        'song': $('#songId').html(),
        'text': $('#addCommentText').val()
      };
      $('#addCommentText').val('');
      url = "/song/comment/add/";
      return $.post(url, postData, function(response) {
        var commentsUrl;
        window.unblockAddComment();
        switch (response) {
          case 'success':
            commentsUrl = "/song/comment/list/" + ($('#songOwner').text()) + "/" + ($('#songName').text()) + "/";
            return $.get(commentsUrl, function(comments) {
              $('#commentsContainer').html(comments);
              return window.attachCommentButtonHandlers();
            });
          default:
            return alert(response);
        }
      });
    });
  });

}).call(this);
