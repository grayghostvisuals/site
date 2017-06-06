// Init controller
var controller = new ScrollMagic.Controller({
	globalSceneOptions: {
		// duration: $('section').height(),
		triggerHook: .025,
		reverse: true
	}
});


/*
object to hold href values of links inside our nav with
the class '.anchor-nav'

scene_object = {
'[scene-name]' : {
	'[target-scene-id]' : '[anchor-href-value]'
}
}
*/
var scenes = {}

for(var key in scenes) {
// skip loop if the property is from prototype
if (!scenes.hasOwnProperty(key)) continue;

var obj = scenes[key];

for (var prop in obj) {
	// skip loop if the property is from prototype
	if(!obj.hasOwnProperty(prop)) continue;

	new ScrollMagic.Scene({ triggerElement: '#' + prop })
			.setClassToggle('#' + obj[prop], 'active')
			.addTo(controller);
}
}


// Change behaviour of controller
// to animate scroll instead of jump
controller.scrollTo(function(target) {

TweenMax.to(window, 0.5, {
	scrollTo : {
		y : target,
		autoKill : true // Allow scroll position to change outside itself
	},
	ease : Cubic.easeInOut
});

});


//  Bind scroll to anchor links using Vanilla JavaScript
var anchor_nav = document.querySelector('.anchor-nav');

anchor_nav.addEventListener('click', function(e) {
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
});
