(function() {
  var deleteComment, editComment;

  window.attachCommentButtonHandlers = function() {
    $('#commentsTable textarea').each(function(i, node) {
      return $(node).data('codeMirror', CodeMirror.fromTextArea(node, {
        mode: {
          name: "markdown"
        },
        theme: "night"
      }));
    });
    $('.editCommentButton').click(function(e) {
      return editComment(e);
    });
    return $('.deleteCommentButton').click(function(e) {
      return deleteComment(e);
    });
  };

  editComment = function(e) {
    var cancelButton, commentId, displaySpan, editSpan, saveButton, textarea;
    window.blockEditComments();
    commentId = $(e.target).attr('comment');
    displaySpan = $(".commentBodyDisplay[comment=\"" + commentId + "\"]");
    displaySpan.hide();
    editSpan = $(".commentBodyEdit[comment=\"" + commentId + "\"]");
    editSpan.show();
    textarea = editSpan.find('textarea');
    cancelButton = editSpan.find('#cancelButton');
    saveButton = editSpan.find('#saveButton');
    textarea.focus();
    textarea.data('codeMirror').refresh();
    cancelButton.click(function(e) {
      editSpan.hide();
      displaySpan.show();
      return window.unblockEditComments();
    });
    return saveButton.click(function(e) {
      var editedCommentBody, postData;
      window["blockEditCommentArea_" + commentId]();
      editedCommentBody = textarea.data('codeMirror').getValue();
      postData = {
        'comment': commentId,
        'text': editedCommentBody
      };
      return $.post('/song/comment/edit/', postData, function(response) {
        var commentsUrl;
        if (response === 'success') {
          commentsUrl = "/song/comment/list/" + ($('#songId').text()) + "/";
          return $.get(commentsUrl, function(comments) {
            $('#commentsContainer').html(comments);
            return window.attachCommentButtonHandlers();
          });
        } else {
          window["unblockEditCommentArea_" + commentId]();
          return alert(response);
        }
      });
    });
  };

  deleteComment = function(e) {
    var commentId, postData;
    window.blockEditComments();
    commentId = $(e.target).attr('comment');
    postData = {
      'comment': commentId
    };
    return $.post('/song/comment/delete/', postData, function(response) {
      var commentsUrl;
      switch (response) {
        case 'success':
          commentsUrl = "/song/comment/list/" + ($('#songId').text()) + "/";
          return $.get(commentsUrl, function(comments) {
            $('#commentsContainer').html(comments);
            return window.attachCommentButtonHandlers();
          });
        default:
          window.unblockEditComments();
          return alert(response);
      }
    });
  };

  $(document).ready(function() {
    $('#addCommentText').autoResize();
    return window.attachCommentButtonHandlers();
  });

}).call(this);
