(function() {

  $(document).ready(function() {
    var codeMirror;
    codeMirror = CodeMirror($('#addCommentText').get(0), {
      mode: {
        name: "markdown"
      },
      theme: "night"
    });
    return $('#addCommentButton').click(function() {
      var postData, url;
      window.blockAddComment();
      postData = {
        'song': $('#songId').html(),
        'text': codeMirror.getValue()
      };
      codeMirror.setValue('');
      url = "/song/comment/add/";
      return $.post(url, postData, function(response) {
        var commentsUrl;
        window.unblockAddComment();
        switch (response) {
          case 'success':
            commentsUrl = "/song/comment/list/" + ($('#songId').text()) + "/";
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
