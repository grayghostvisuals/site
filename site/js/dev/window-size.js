function windowSize() {
  'use strict'
  let window_width = window.innerWidth;
}

windowSize();

window.addEventListener('resize', function() {
  windowSize();
});