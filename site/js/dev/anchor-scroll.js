(function() {
	var hero           = document.querySelector('.ggv-banner'),
			hero_height    = hero.clientHeight,
			el             = document.querySelector('main'),
			elChild        = document.createElement('a'),
			content_height = el.clientHeight,
			scrollTop      = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;

	elChild.innerHTML = 'Back To Top';
	elChild.classList.add('topsider');
	elChild.setAttribute('href', '#top');

	el.style.position = 'relative';

	elChild.style.position = 'fixed';
	elChild.style.zIndex = '9999';
	elChild.style.right = 0;
	elChild.style.bottom = 0;
	elChild.style.backgroundColor = 'transparent';
	elChild.style.textDecoration = 'none';
	elChild.style.color = 'white';
	elChild.style.padding = '6px 6px';

	window.addEventListener('scroll', function(e) {

		if(window.pageYOffset > hero_height) {
			el.appendChild(elChild);
			elChild.style.opacity = 1;
		} else {
			elChild.style.opacity = 0;
		}

		if(window.pageYOffset == (document.documentElement.scrollHeight - window.innerHeight)) {
			elChild.style.opacity = 0;
		}

	});

	elChild.addEventListener('click', function(event) {
		elChild.style.opacity = 0;
		scroller(event);
	});

})();


var controller = new ScrollMagic.Controller({
	globalSceneOptions: {
		triggerHook: .025,
		reverse: true
	}
});


let scenes = {};

for(var key in scenes) {
	if (!scenes.hasOwnProperty(key)) continue;

	var obj = scenes[key];

	for (var prop in obj) {
		if(!obj.hasOwnProperty(prop)) continue;

		new ScrollMagic.Scene({ triggerElement: '#' + prop })
			.setClassToggle('#' + obj[prop], 'active')
			.addTo(controller);
	}
}


controller.scrollTo(function(target) {
	TweenMax.to(window, 0.5, {
		scrollTo : {
			y : target,
			autoKill : true
		},
		ease : Cubic.easeInOut
	});
});


let anchor_nav = document.querySelector('.anchor-nav');

function scroller(e) {
	var target = e.target,
			id     = target.getAttribute('href');

	if(id !== null) {
		if(id.length > 0) {
			e.preventDefault();
			controller.scrollTo(id);

			if(window.history && window.history.pushState) {
				history.pushState("", document.title, id);
			}
		}
	}
}


anchor_nav.addEventListener('click', function(e) {
	scroller(e)
});
