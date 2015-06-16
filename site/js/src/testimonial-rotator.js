$(document).ready(function() {
  setupRotator();
}); 

function setupRotator() {
  if($('.client-quote').length > 1) {
    $('.client-quote:first').addClass('current').fadeIn(1000);
    setInterval('textRotate()', 9000);
  }
}

function textRotate() {
  var current = $('#testimonials > .current');
  if(current.next().length == 0) {
    current
      .removeClass('current')
      .fadeOut(1000);

    $('.client-quote:first')
      .addClass('current')
      .fadeIn(1000);
  } else {
    current
      .removeClass('current')
      .fadeOut(1000);

    current
      .next()
      .addClass('current')
      .fadeIn(1000);
  }
}