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
    var busyIndicator, cancelButton, commentBody, commentHtml, commentId, displaySpan, editHtml, rawSpan, saveButton, textarea;
    window.blockEditComments();
    commentId = $(e.target).attr('comment');
    displaySpan = $(".commentBodyDisplay[comment=\"" + commentId + "\"]");
    if (displaySpan.find('textarea').length > 0) {
      console.log('edit clicked twice');
      return;
    }
    commentHtml = displaySpan.html();
    rawSpan = $(".commentBodyRaw[comment=\"" + commentId + "\"]");
    commentBody = rawSpan.html();
    editHtml = "<div id=\"textareaOverlay\">\n  <textarea style='resize: none;\n                   overflow: hidden;\n                   width: " + (displaySpan.width()) + "px;\n                   height: " + (displaySpan.height()) + "px;'>" + commentBody + "</textarea>\n</div>\n<div id=\"cancelOverlay\" style='float: right;'>\n  <button type='button' id='cancelButton' style='font-size: 10pt;'>cancel</button>\n</div>\n<div id=\"saveOverlay\" style='float: right;'>\n  <button type='button' id='saveButton' style='font-size: 10pt;'>save</button>\n</div>\n<div id=\"busyIndicator\" style=\"display: none; float: right;\">\n <img src=\"/static/busy.gif/\">\n</div>";
    displaySpan.html(editHtml);
    textarea = displaySpan.find('textarea');
    cancelButton = displaySpan.find('#cancelButton');
    saveButton = displaySpan.find('#saveButton');
    busyIndicator = displaySpan.find('#busyIndicator');
    textarea.autoResize();
    cancelButton.click(function(e) {
      displaySpan.html(commentHtml);
      return window.unblockEditComments();
    });
    return saveButton.click(function(e) {
      var disabledElements, editedCommentBody, postData;
      disabledElements = [displaySpan.children("#textareaOverlay"), displaySpan.children("#saveOverlay"), displaySpan.children("#cancelOverlay")];
      $(disabledElements).each(function(i, element) {
        return element.block({
          message: null,
          fadeIn: 400
        });
      });
      busyIndicator.attr('style', 'float: right; margin: 7px;');
      editedCommentBody = textarea.val();
      postData = {
        'comment': commentId,
        'text': editedCommentBody
      };
      return $.post('/song/comment/edit/', postData, function(response) {
        var commentsUrl;
        if (response === 'success') {
          window.unblockEditComments();
          commentsUrl = "/song/comment/list/" + ($('#songOwner').text()) + "/" + ($('#songName').text()) + "/";
          return $.get(commentsUrl, function(comments) {
            $(disabledElements).each(function(i, element) {
              return element.unblock({
                fadeOut: 0
              });
            });
            $('#commentsContainer').html(comments);
            return window.attachCommentButtonHandlers();
          });
        } else {
          return alert(response);
        }
      });
    });
  };

  deleteComment = function(e) {
    var commentId, postData;
    commentId = $(e.target).attr('comment');
    postData = {
      'comment': commentId
    };
    return $.post('/song/comment/delete/', postData, function(response) {
      var commentsUrl;
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
  };

  $(document).ready(function() {
    $('#addCommentText').autoResize();
    return window.attachCommentButtonHandlers();
  });

}).call(this);
