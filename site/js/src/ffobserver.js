// https://github.com/filamentgroup/font-loading
(function(w){
  if(w.document.documentElement.className.indexOf('fonts-loaded') > -1){
    return;
  }

  var fontA = new w.FontFaceObserver('Avenir LT W01_45 Book'),
      fontB = new w.FontFaceObserver('Ciutadella W04 Lt'),
      fontC = new w.FontFaceObserver('Ciutadella W04 SmBold'),
      fontD = new w.FontFaceObserver('Ciutadella W04 Medium'),
      fontE = new w.FontFaceObserver('Ciutadella W04 Bold');

  w.Promise
    .all([fontA.check(), fontB.check(), fontC.check(), fontD.check(), fontE.check()])
    .then(function(){
      w.document.documentElement.className += ' ffo-loaded';
    });
}(this));