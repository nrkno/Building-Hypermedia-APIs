/* 2011-05-14 (mca) : maze-game.js */
/* Designing Hypermedia APIs by Mike Amundsen (2011) */

const thisPage = function () {

  const g = {
    moves: 0,
    links: [],
    mediaType: "application/vnd.amundsen.maze+xml",
    startLink: "http://localhost:3000/maze/five-by-five/",
    sorryMsg: 'Sorry, I don\'t understand what you want to do.',
    successMsg: 'Congratulations! you\'ve made it out of the maze!'
  };

  function init() {
    attachEvents();
    getDocument(g.startLink);
    setFocus();
  }

  function attachEvents() {
    const elm = document.getElementsByName('interface')[0];
    if (elm) {
      elm.onsubmit = function () { return move(); };
    }
  }

  function getDocument(url) {
    fetch(url, {
      headers: {
        'accept': g.mediaType
      }
    })
      .then(response => response.text())
      .then(str => new window.DOMParser().parseFromString(str, 'text/xml'))
      .then(xml => processLinks(xml))
  }

  function setFocus() {
    const elm = document.getElementsByName('move')[0];
    if (elm) {
      elm.value = '';
      elm.focus();
    }
  }

  function move() {
    const elm = document.getElementsByName('move')[0];
    if (elm) {
      const mv = elm.value;
      if (mv === 'clear') {
        reload();
      }
      else {
        const href = getLinkElement(mv);
        if (href) {
          updateHistory(mv);
          getDocument(href);
        }
        else {
          alert(g.sorryMsg);
        }
      }
      setFocus();
    }
    return false;
  }

  function reload() {
    history.go(0);
  }

  function getLinkElement(key) {
    for (let i = 0, x = g.links.length; i < x; i++) {
      if (g.links[i].rel === key) {
        return g.links[i].href;
      }
    }
    return '';
  }

  function updateHistory(mv) {
    const elm = document.getElementById('history');
    if (elm) {
      let txt = elm.innerHTML;
      g.moves++;
      if (mv === 'exit') {
        txt = g.moves + ': ' + g.successMsg + '<br />' + txt;
      }
      else {
        txt = g.moves + ':' + mv + '<br />' + txt;
      }
      elm.innerHTML = txt;
    }
  }

  function processLinks(response) {
    let link, rels, href;

    g.links = [];
    const xml = response.selectNodes('//link');
    for (let i = 0, x = xml.length; i < x; i++) {
      href = xml[i].getAttribute('href');
      rels = xml[i].getAttribute('rel').split(' ');
      for (let j = 0, y = rels.length; j < y; j++) {
        link = { 'rel': rels[j], 'href': href };
        g.links[g.links.length] = link;
      }
    }
    showOptions();
  }

  function showOptions() {
    const elm = document.getElementsByClassName('options')[0];
    if (elm) {
      let txt = '';
      for (let i = 0, x = g.links.length; i < x; i++) {
        if (i > 0) {
          txt += ', ';
        }
        if (g.links[i].rel === 'collection') {
          txt += 'clear';
        }
        else {
          txt += g.links[i].rel;
        }
      }
      elm.innerHTML = txt;
    }
  }

  // publish methods  
  return { init };
};

window.onload = function () {
  const pg = thisPage();
  pg.init();
};
