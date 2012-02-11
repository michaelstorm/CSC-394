(function() {
  var deleteComment, editComment;

  window.attachCommentButtonHandlers = function() {
    $('.editCommentButton').click(function(e) {
      return editComment(e);
    });
    return $('.deleteCommentButton').click(function(e) {
      return deleteComment(e);
    });
  };

  editComment = function(e) {
    var bodySpan, commentBody, commentId, editHtml;
    commentId = $(e.target).attr('comment');
    bodySpan = $(".commentBody[comment=\"" + commentId + "\"]");
    if (bodySpan.find('textarea').length > 0) return;
    commentBody = bodySpan.text();
    editHtml = "<textarea style='resize: none;\n                 overflow: hidden;\n                 width: " + (bodySpan.width()) + "px;\n                 height: " + (bodySpan.height()) + "px;'>" + commentBody + "</textarea>\n<button type='button' id='cancelButton' style='float: right; font-size: 10pt;'>cancel</button>\n<button type='button' id='saveButton' style='float: right; font-size: 10pt;'>save</button>";
    bodySpan.html(editHtml);
    bodySpan.children('textarea').autoResize();
    bodySpan.children('#cancelButton').click(function(e) {
      return bodySpan.html(commentBody);
    });
    return bodySpan.children('#saveButton').click(function(e) {
      var editedCommentBody, postData, url;
      editedCommentBody = bodySpan.children('textarea').val();
      postData = {
        'comment': commentId,
        'text': editedCommentBody
      };
      url = "/song/comment/edit/";
      return $.post(url, postData, function(response) {
        if (response === 'success') {
          return bodySpan.html(editedCommentBody);
        } else {
          return alert(response);
        }
      });
    });
  };

  deleteComment = function(e) {
    var commentId, postData, url;
    commentId = $(e.target).attr('comment');
    url = "/song/comment/delete/";
    postData = {
      'comment': commentId
    };
    return $.post(url, postData, function(response) {
      var commentsUrl;
      switch (response) {
        case 'success':
          commentsUrl = url = "/song/comment/list/" + ($('#songOwner').text()) + "/" + ($('#songName').text()) + "/";
          return $.get(commentsUrl, function(comments) {
            $('#commentsContainer').html(comments);
            return window.attachCommentButtonHandlers();
          });
        default:
          return alert(response);
      }
    });
  };

  $(document).ready(function() {
    $('#addCommentText').autoResize();
    return window.attachCommentButtonHandlers();
  });

}).call(this);
