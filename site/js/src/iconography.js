function drawBulb() {
  var tl   = new TimelineMax({ delay: 0.25 }),
      from = { drawSVG: '0' },
      to   = { drawSVG: '100%' };

  var iconographic  = document.querySelectorAll('.ggv-graphic'),
      shell_path    = document.querySelectorAll('.shell'),
      shell_paths   = [shell_path[0].children, shell_path[1].children],
      wire_path     = document.querySelector('#wire').children,
      plug_path     = document.querySelector('#plug').children,
      filament_path = document.querySelector('#filament').children;

  TweenMax.set([iconographic], { visibility: 'visible' });

  tl.staggerFromTo([shell_paths, plug_path], 0.875, from, to, 1)
    .staggerFromTo([wire_path, filament_path], 0.875, from, to, 1);

  return tl;
}

drawBulb();