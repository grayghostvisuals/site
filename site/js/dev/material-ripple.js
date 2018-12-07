let materialRipple = (function(e) {
	let circle = document.querySelectorAll('.material-ripple'),
			// circle = document.getElementById('js-ripple'),
			ripple = document.querySelectorAll('.js-ripple');

	console.log('the circle is' + circle.length);
	console.log('the ripple is' + ripple.length);

	function rippleAnimation(event, timing) {
		let tl           = new TimelineMax(),
				x            = event.offsetX,
				y            = event.offsetY,
				w            = event.target.offsetWidth,
				h            = event.target.offsetHeight,
				offsetX      = Math.abs( (w / 2) - x ),
				offsetY      = Math.abs( (h / 2) - y ),
				deltaX       = (w / 2) + offsetX,
				deltaY       = (h / 2) + offsetY,
				scale_ratio  = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));

		tl.fromTo(ripple, timing, {
			x: x,
			y: y,
			transformOrigin: '50% 50%',
			scale: 0,
			opacity: 1,
			ease: Linear.easeInOut
		}, {
			scale: scale_ratio,
			opacity: 0
		});

		return tl;
	}

	return {
		init: function(target, timing) {
			// let button = document.getElementById(target);
			let button = document.querySelectorAll(target);
			console.log('the button is' + button.length);

			if(button) {
				button.forEach(function(element) {
					element.addEventListener('click', function(event) {
						rippleAnimation.call(this, event, timing);
					});
				}, false);
			}
		}
	};
	})();

	// materialRipple.init('js-ripple-btn', 0.575);
	materialRipple.init('.material-button', 0.575);
