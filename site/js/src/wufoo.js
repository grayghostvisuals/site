'use strict';

var z1fenvx51p7ve3h;(function (d, t) {
	var s = d.createElement(t),
	    options = {
		'userName': 'grayghostvisuals',
		'formHash': 'z1fenvx51p7ve3h',
		'autoResize': true,
		'height': '635',
		'async': true,
		'host': 'wufoo.com',
		'header': 'show',
		'ssl': false
	};
	s.src = ('https:' == d.location.protocol ? 'https://' : 'http://') + 'www.wufoo.com/scripts/embed/form.js';
	s.onload = s.onreadystatechange = function () {
		var rs = this.readyState;if (rs) if (rs != 'complete') if (rs != 'loaded') return;
		try {
			z1fenvx51p7ve3h = new WufooForm();z1fenvx51p7ve3h.initialize(options);z1fenvx51p7ve3h.display();
		} catch (e) {}
	};
	var scr = d.getElementsByTagName(t)[0],
	    par = scr.parentNode;par.insertBefore(s, scr);
})(document, 'script');