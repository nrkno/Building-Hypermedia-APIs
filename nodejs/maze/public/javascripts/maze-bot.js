/* 2011-04-15 (mca) : maze-bot.js */
/* Designing Hypermedia APIs by Mike Amundsen (2011) */

const thisPage = function () {

  const g = {
    idx: 1,
    links: [],
    facing: '',
    done: false,
    start: false,
    mediaType: "application/vnd.amundsen.maze+xml",
    startLink: "http://localhost:3000/maze/five-by-five/",

    // simple right-hand wall-following rules:
    // if door-right, face right
    // else-if door-forward, face forward
    // else-if door-left, face left
    // else face back
    rules: {
      'east': ['south', 'east', 'north', 'west'],
      'south': ['west', 'south', 'east', 'north'],
      'west': ['north', 'west', 'south', 'east'],
      'north': ['east', 'north', 'west', 'south']
    }
  };

  function init() {
    attachEvents();
    setup();
  }

  function attachEvents() {
    const elm = document.getElementById('go');
    if (elm) {
      elm.onclick = firstMove;
    }
  }

  function setup() {
    g.done = false;
    g.start = false;

    const elm = document.getElementById('game-play');
    if (elm) {
      elm.innerHTML = '';
    }
  }

  function firstMove() {
    if (g.done === true) {
      setup();
      firstMove();
    }
    else {
      g.idx = 1;
      getDocument(g.startLink);
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

  function getLinkElement(key) {
    let rtn;

    for (let i = 0, x = g.links.length; i < x; i++) {
      if (g.links[i].rel === key) {
        rtn = g.links[i].href;
        break;
      }
    }
    return rtn || '';
  }

  function printLine(msg) {
    const elm = document.getElementById('game-play');
    if (elm) {
      elm.innerHTML = `${g.idx}: ${msg}<br>${elm.innerHTML}`;
      g.idx++;
    }
  }

  function processLinks(response) {
    let rels, href, link, flg, rules;

    flg = false;
    rules = [];
    g.links = [];

    // get all the links in the response
    const xml = response.selectNodes('//link');
    for (let i = 0, x = xml.length; i < x; i++) {
      href = xml[i].getAttribute('href');
      rels = xml[i].getAttribute('rel').split(' ');
      for (let j = 0, y = rels.length; j < y; j++) {
        link = { 'rel': rels[j], 'href': href };
        g.links[g.links.length] = link;
      }
    }

    // is there an exit?
    href = getLinkElement('exit');
    if (href !== '') {
      g.done = true;
      printLine(href + ' *** DONE!');
      alert('Done in only ' + --g.idx + ' moves!');
      return;
    }

    // is there an entrance?
    if (flg === false && g.start === false) {
      href = getLinkElement('start');
      if (href !== '') {
        flg = true;
        g.start = true;
        g.facing = 'north';
        printLine(href);
      }
    }

    // ok, let's "wall-follow"
    if (flg === false) {
      rules = g.rules[g.facing];
      for (let i = 0, x = rules.length; i < x; i++) {
        href = getLinkElement(rules[i]);
        if (href !== '') {
          flg = true;
          g.facing = rules[i];
          printLine(href);
          break;
        }
      }
    }

    // update pointer, handle next move
    if (href !== '') {
      getDocument(href);
    }
  }

  return { init }
};

window.onload = function () {
  const pg = thisPage();
  pg.init();
};