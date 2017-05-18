'use strict';

var socialBloomer = function () {
  return {
    init: function init(el, state) {
      var circle = document.querySelectorAll(el);

      function socialBloom() {
        this.parentNode.classList.toggle(state);
      }

      function resetBloom() {
        this.parentNode.classList.remove(state);
      }

      for (var i = 0, l = circle.length; i < l; i++) {
        circle[i].addEventListener('click', socialBloom);
        circle[i].addEventListener('mouseenter', socialBloom);
      }
    }
  };
}();

socialBloomer.init('div.socials__btn', 'is-bloomed');