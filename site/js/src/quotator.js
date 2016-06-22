'use strict';

// Quotator : A simplistic testimonial rotator
// ======================================================================
// @credit  : Created and shared by Dennis Gaebel (@gryghostvisuals)
// @support : No dependencies required. IE10+ (querySelectorAll, classList)

var quotator = function () {
  return {
    init: function init(selector, state, speed) {
      var quotes = document.querySelectorAll(selector),
          state = replaceString(state),
          cycle_speed = speed;

      if (quotes.length !== 'undefined') {
        quotes[0].classList.add(state);

        setInterval(function () {
          cycle(quotes, state);
        }, cycle_speed);
      }

      function replaceString(txt) {
        return txt.toString().replace('.', '');
      }

      function cycle(selector, state) {
        var state = '.' + state,
            current = document.querySelectorAll(state),
            next = current[0].nextElementSibling;

        state = replaceString(state);

        if (!next) {
          current[0].classList.remove(state);
          selector[0].classList.add(state);
        } else {
          current[0].classList.remove(state);
          next.classList.add(state);
        }
      }
    }
  };
}();

quotator.init('.quote', '.js-current', 9000);