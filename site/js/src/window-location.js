'use strict';

if (window.location.pathname === '/work.html') {
	var testimonials_link = document.getElementById('ggv-testimonials');

	testimonials_link.addEventListener('click', function (event) {
		event.preventDefault;

		var href = this.getAttribute('href'),
		    link_url = window.location.origin + '/' + href;

		window.location.href = link_url;
	});
}