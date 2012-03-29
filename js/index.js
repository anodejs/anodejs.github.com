$(function() {
  $.get('http://org.msproto.net/analytics/hit');

  //
  // http://collaborable.com/blog/disqus-jquery-hack-awesome-ux
  //

  var disqus_shortname = 'anodejs';
  var disqus_url = 'http://anodejs.org';
  var disqus_identifier = '';

  // Leave a comment/cancel.
  $('.entry a.comment').click(function() {

    if ($(this).hasClass('disabled')) {
      return false;
    }

    // Init DISQUS.
    disqus_identifier = $(this).data('disqus-identifier');

    // DISQUS requires each thread to have the ID #disqus_thread.
    var $entry = $(this).parents('div.entry');
    $('#disqus_thread').removeAttr('id');
    $entry.find('div.disqus_thread').attr('id', 'disqus_thread');

    // Reload DISQUS script
    $.getScript('http://' + disqus_shortname + '.disqus.com/embed.js', function() {
      $entry.find('div.comment').slideUp();
      $entry.find('div.comments').slideDown(function() {
        $entry.find('img.loading').hide();
        $entry.find('a.comment').removeClass('disabled');
      });
    });

    // Hide/kill other DISQUS forums.
    $('a.nocomment').trigger('click');

    // Disable link and show loading image
    $entry.find('a.comment').addClass('disabled');
    $entry.find('img.loading').show();

    return false;

  });

  // Hide/kill all open DISQUS forums.
  $('.entry a.nocomment').click(function () {
    var $entry = $(this).parents('div.entry');

    $('div.comments').slideUp('fast', function () {
      $(this).find('.disqus_thread').empty();
    });
    
    $entry.find('div.comment').slideDown();
    
    return false;
  });

});