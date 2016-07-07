'use strict';

function windowSize() {
  'use strict';

  var window_width = window.innerWidth;
}

windowSize();

window.addEventListener('resize', function () {
  windowSize();
});