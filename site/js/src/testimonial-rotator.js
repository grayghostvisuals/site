function quotator(selector, state, speed) {
  var quotes      = document.querySelectorAll(selector),
      cycle_speed = speed;

  if(quotes.length !== 'undefined') {
    quotes[0].classList.add(state);
    setInterval(function() {
      cycle(quotes, state);
    }, cycle_speed);
  }
}

function cycle(selector, state) {
  var current = document.querySelectorAll('.'+state),
      next    = current[0].nextElementSibling;

  if(!next) {
    current[0].classList.remove(state);
    selector[0].classList.add(state);
  } else {
    current[0].classList.remove(state);
    next.classList.add(state);
  }
}

quotator('.client-quote', 'current', 9000);