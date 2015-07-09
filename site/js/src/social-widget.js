var circle = document.querySelectorAll('div.socials__btn');

for(var i = 0, l = circle.length; i < l; i++) {
  circle[i].addEventListener('click', function() {
    this.parentNode.classList.toggle('is-bloomed');
  });
}