function select(s) {
	return document.querySelector(s);
}

function selectAll(s) {
	return document.querySelectorAll(s);
}


function googleExpandoToggle() {
	var expando_card  = select('.google-expando--wrap');

	this.classList.toggle('active');
	this.nextElementSibling.classList.toggle('active');

	if(expando_card.getAttribute('aria-hidden') === 'true') {
		expando_card.setAttribute('aria-hidden', 'false');
	} else {
		expando_card.setAttribute('aria-hidden', 'true');
	}
}


select('.google-expando__icon').addEventListener('click', function() {
	googleExpandoToggle.call(this);
});
