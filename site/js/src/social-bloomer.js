var socialBloomer = (function() {
  return {
    init: function(el, state) {
      var circle = document.querySelectorAll(el);

      function socialBloom() {
        this.parentNode.classList.toggle(state);
      }

      for(var i = 0, l = circle.length; i < l; i++) {
        circle[i].addEventListener('click', socialBloom);
      }
    }
  };
})();

socialBloomer.init('div.socials__btn', 'is-bloomed');