let request  = new XMLHttpRequest(),
    codepens = document.getElementById('codepens');

request.open('GET', 'http://cpv2api.com/pens/showcase/grayghostvisuals', true);

request.onload = function() {
  if (request.status >= 200 && request.status < 400) {
    let data = JSON.parse(request.responseText),
        pen;

    for(var i = 0, l = data.data.length; i < l; i++) {
      pen = document.createElement('li');
      pen.className = 'pen';
      pen.innerHTML = '<a href="' + data.data[i].link + '"><img src="' + data.data[i].images.large + '" class="pen"></a> <p class="pen-title">' + data.data[i].title + '</p>';

      codepens.appendChild(pen);
    }
  } else {
    console.log('server error');
  }
};

request.onerror = function() {
  console.log('connection error');
};

request.send();