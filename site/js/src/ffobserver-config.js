'use strict';

// @docs
// https://github.com/filamentgroup/font-loading
(function (w) {
  if (w.document.documentElement.className.indexOf('fonts-loaded') > -1) {
    return;
  }

  var fontAvenirLT = new w.FontFaceObserver('Avenir LT W01_45 Book'),
      fontCiutadellaLT = new w.FontFaceObserver('Ciutadella W04 Lt'),
      fontCiutadellaSmBold = new w.FontFaceObserver('Ciutadella W04 SmBold'),
      fontCiutadellaMed = new w.FontFaceObserver('Ciutadella W04 Medium'),
      fontCiutadellaBold = new w.FontFaceObserver('Ciutadella W04 Bold');

  w.Promise.all([fontAvenirLT.check(), fontCiutadellaLT.check(), fontCiutadellaSmBold.check(), fontCiutadellaMed.check(), fontCiutadellaBold.check()]).then(function () {
    w.document.documentElement.className += ' ffo-loaded';
  });
})(window);