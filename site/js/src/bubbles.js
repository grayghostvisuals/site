'use strict';

function randomNumber(start, end) {
	return Math.random() * (end - start);
}

function bubbler() {
	var water = document.querySelectorAll('.ggv-hero')[0],
	    i = 0;

	function generateBubbles() {
		if (i < 60) {
			var el = document.createElement('svg'),
			    circle = document.createElement('circle'),
			    size = randomNumber(1, 35);

			water.appendChild(el);

			el.appendChild(circle);
			el.setAttribute('viewBox', '0 0 100 100');
			el.setAttribute('class', 'bubble');
			el.setAttribute('style', 'width: ' + size + 'px; height: ' + size + 'px; left: ' + randomNumber(1, window.innerWidth / 4) + 'vw;');

			circle.setAttribute('cx', 50);
			circle.setAttribute('cy', 50);
			circle.setAttribute('r', 50);

			i++;
		} else {
			clearInterval(cycle);
		}
	};

	generateBubbles();
	var cycle = setInterval(generateBubbles, 150);
}

bubbler();