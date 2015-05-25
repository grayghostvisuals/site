// https://github.com/filamentgroup/font-loading
(function(w){
  if(w.document.documentElement.className.indexOf('fonts-loaded') > -1){
    return;
  }

  var fontA = new w.FontFaceObserver('AvenirLTW01-45BookObliq'),
      fontB = new w.FontFaceObserver('Ciutadella W04 SmBold'),
      fontC = new w.FontFaceObserver('Avenir LT W01_45 Book'),
      fontD = new w.FontFaceObserver('Ciutadella W04 Lt');

  w.Promise
    .all([fontA.check(), fontB.check(), fontC.check(), fontD.check()])
    .then(function(){
      w.document.documentElement.className += ' ffo-loaded';
    });
}(this));