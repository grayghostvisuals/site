// ============================================================
// PolyClouds
// forked pen http://codepen.io/grayghostvisuals/pen/qdpPqo
// ============================================================

function HSLA(h, s, l, a) {
  this.h = h;
  this.s = s;
  this.l = l;
  this.a = a === 0 ? 0 : (a ? a : 1);
}

HSLA.prototype = {
  clone : function() {
    return new HSLA(this.h, this.s, this.l, this.a);
  },

  toString : function() {
    var h = Math.round(this.h),
        s = Math.round(this.s),
        l = Math.round(this.l);

    return "hsla(" + h + ", " + s + "%, " + l + "%, " + this.a + ")";
  }
}

let canvas = document.createElement('canvas'),
    width,
    height;

function canvasStage() {
  // Make canvas width && height equal to window's inner width / height
  // rather than setting an exact size of canvas.
  canvas.width = width = window.innerWidth;
  canvas.height = height = window.innerHeight;
}

canvasStage();

var body = document.querySelector('.intro-deck');

body.appendChild(canvas);

var ctx       = canvas.getContext('2d'),
    framerate = 6;

function Node () {
  this.x      = this.y = 0;
  this.vx     = this.vy = 0;
  this.top    = null;
  this.bottom = null;
  this.left   = null;
  this.right  = null;
}

var color            = new HSLA(200, 80, 20, 0),
    friction         = 0.999,
    ranVel           = 0.3,
    ny,
    nx               = ny = 15,
    constraintLength = 20, //22
    constraintForce  = 0.5,
    boundaryForce    = 0.004,
    dx               = 0.5 * (width - (nx * constraintLength)),
    dy               = 0.125 * (height - (nx * constraintLength));

function Cloud() {
  this.nodes = [];
  for(var j = 0; j < ny; j++) {
    for(var i = 0; i < nx; i++) {
      var node = new Node();
      node.x = i * constraintLength + dx;
      node.y = j * constraintLength + dy;
      var id = this.nodes.length;
      if(i > 0) {
        node.left = this.nodes[id - 1];
        node.left.right = node;
      }
      if(j > 0) {
        node.top = this.nodes[id - nx];
        node.top.bottom = node;
      }

      node.vx += 0.1 * (Math.random() * 2 - 1);
      node.vy += 0.1 * (Math.random() * 2 - 1);
      node.color = color.clone();
      node.color.l += Math.random() * (60 - color.l);
      node.color.a = 0.5;

      this.nodes[id] = node;
    }
  }
}

Cloud.prototype = {

  update : function () {
    var n = this.nodes.length;
    for(var i = 0; i < n; i++) {
      var node = this.nodes[i];
      if(node.bottom) this.applyConstraint(node, node.bottom);
      if(node.right) this.applyConstraint(node, node.right);
      node.vx += ranVel * (Math.random() * 2 - 1);
      node.vy += ranVel * (Math.random() * 2 - 1);
      node.vx *= friction;
      node.vy *= friction;
      node.x += node.vx;
      node.y += node.vy;

      if(node.x < 0)
        node.vx += boundaryForce;
      else if(node.x > width)
        node.vx -= boundaryForce;

      if(node.y < 0)
        node.vy += boundaryForce;
      else if(node.y > height)
        node.vy -= boundaryForce;
    }
  },

  applyConstraint : function (a, b) {
    var dx    = b.x - a.x,
        dy    = b.y - a.y,
        dist  = Math.sqrt(dx * dx + dy * dy),
        delta = constraintLength - dist,
        ratio = 0.5 * delta / dist;

    a.x -= constraintForce * dx * ratio;
    a.y -= constraintForce * dy * ratio;
    b.x += constraintForce * dx * ratio;
    b.y += constraintForce * dy * ratio;
  },

  draw : function () {
    var n = this.nodes.length;

    for(var i = 0; i < n; i++) {
      var node = this.nodes[i];
      if(node.top && node.left) {
        ctx.fillStyle = node.color.toString();
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(node.left.x, node.left.y);
        ctx.lineTo(node.left.top.x, node.left.top.y);
        ctx.lineTo(node.top.x, node.top.y);
        ctx.lineTo(node.x, node.y);
        ctx.fill();
      }
    }
  }
}

var cloud1 = new Cloud(),
    cloud2 = new Cloud(),
    cloud3 = new Cloud();

function update() {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = color.toString();
  ctx.fillRect(0, 0, width, height);
  cloud1.update();
  cloud2.update();
  cloud3.update();
  cloud1.draw();
  cloud2.draw();
  cloud3.draw();
  setTimeout(update.bind(this), framerate);
}


window.addEventListener('resize', function(){
  canvasStage();
}, false);

update();
