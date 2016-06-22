'use strict';

(function (w) {

  // Config
  // ============================================================

  var $atomic_html = document.querySelectorAll('pre.language-html code'),
      $atomic_jscode = document.querySelectorAll('pre.language-javascript > code'),
      $atomic_js = document.querySelectorAll('script.atomic-js'),
      atomic_htmlsnippet = [],
      atomic_jsnippet = [];

  // Markup
  // order matters!
  // ============================================================

  for (var i = 0, l = $atomic_html.length; i < l; i++) {
    atomic_htmlsnippet.push($atomic_html[i].innerHTML.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));

    $atomic_html[i].innerHTML = atomic_htmlsnippet[i];
  }

  // JavaScript
  // order matters!
  // ============================================================

  for (var _i = 0, _l = $atomic_js.length; _i < _l; _i++) {
    atomic_jsnippet.push($atomic_js[_i].innerHTML.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
  }

  for (var _i2 = 0, _l2 = $atomic_jscode.length; _i2 < _l2; _i2++) {
    $atomic_jscode[_i2].innerHTML = atomic_jsnippet[_i2];
  }
})(window);