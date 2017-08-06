'use strict';

// Quotator : A simplistic testimonial rotator
// ======================================================================
// @credit  : Created and shared by Dennis Gaebel (@gryghostvisuals)
// @support : No dependencies required. IE10+ (querySelectorAll, classList)

var quotator = function () {
  function lazyLoad(img) {
    img.src = img.getAttribute('data-src');
    img.removeAttribute('data-src');
    img.srcset = img.getAttribute('data-srcset');
    img.removeAttribute('data-srcset');
  }

  return {
    init: function init(selector, condition, speed) {
      var quotes = document.querySelectorAll(selector),
          state = replaceString(condition),
          cycle_speed = speed;

      if (quotes.length !== 'undefined') {
        quotes[0].classList.add(state);

        // lazy load
        var img = document.querySelector('.quote-avatar');
        lazyLoad(img);

        setInterval(function () {
          cycle(quotes, state);
        }, cycle_speed);
      }

      function replaceString(txt) {
        return txt.toString().replace('.', '');
      }

      function cycle(selector, state) {
        state = '.' + state;

        var current = document.querySelectorAll(state),
            next = current[0].nextElementSibling;

        state = replaceString(state);

        if (!next) {
          current[0].classList.remove(state);
          selector[0].classList.add(state);
        } else {
          // lazy load
          var img = next.children[0].lastElementChild.lastElementChild.children[0];
          lazyLoad(img);

          current[0].classList.remove(state);
          next.classList.add(state);
        }
      }
    }
  };
}();

quotator.init('.quote', '.js-current', 9000);