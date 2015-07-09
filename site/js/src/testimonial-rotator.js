var quotes = document.querySelectorAll('.client-quote');

function setupRotator() {
  if(quotes.length > 1) {
    quotes[0].classList.add('current');
    setInterval('cycleQuotes()', 9000);
  }
}

function cycleQuotes() {
  var current = document.querySelectorAll('.current'),
      next    = current[0].nextElementSibling;

  if(!next) {
    current[0].classList.remove('current');
    quotes[0].classList.add('current');
  } else {
    current[0].classList.remove('current');
    next.classList.add('current');
  }
}

setupRotator();