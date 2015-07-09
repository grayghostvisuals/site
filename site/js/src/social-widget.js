var circle = document.querySelectorAll('div.socials__btn');

function socialBloom() {
  this.parentNode.classList.toggle('is-bloomed');
}

for(var i = 0, l = circle.length; i < l; i++) {
  circle[i].addEventListener('click', socialBloom);
}