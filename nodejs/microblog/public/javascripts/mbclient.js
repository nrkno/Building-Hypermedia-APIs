/* Designing Hypermedia APIs by Mike Amundsen (2011) */

/*
  simple 'quote-bot'
  - registers a new user account, if needed
  - posts quotes to the microblog site

  assumes the following links & forms:
  - a@rel='users-all'
  - a@rel='user'
  - a@rel='register'
  - a@rel='message-post'

  - form@class='add-user'
  - form@class="add-user".input@name="user"
  - form@class="add-user".input@name="password"
  - form@class="add-user".input@name="email"
  - form@class="add-user".input@name="name"
  - form@class="add-user".textarea@name="description"
  - form@class="add-user".input@name="avatar"
  - form@class="add-user".input@name="website"

  - form@class='message-post'
  - form@class="message-post".textarea@name="message"

*/

let p = null;

window.onload = function () {
  p = thisPage();
  p.init();
};

let thisPage = function () {

  const g = {
    /* state values */
    startUrl: '/microblog/',
    wait: 10,
    status: '',
    url: '',
    body: '',
    idx: 0,
    /* form@class="add-user" */
    user: {
      user: 'robieBot5',
      password: 'robie',
      email: 'robie@example.org',
      name: 'Robie the Robot',
      description: 'a simple quote bot',
      avatar: 'http://amundsen.com/images/robot.jpg',
      website: 'http://robotstxt.org'
    },
    /* form@class="message-post" */
    msg: {
      message: ''
    },
    /* errors for this bot */
    errors: {
      noUsersAllLink: 'Unable to find a@rel="users-all" link',
      noUserLink: 'Unable to find a@rel="user" link',
      noRegisterLink: 'Unable to find a@rel="register" link',
      noMessagePostLink: 'Unable to find a@rel="message-post" link',
      noRegisterForm: 'Unable to find form@class="add-user" form',
      noMessagePostForm: 'Unable to find form@class="message-post" form',
      registerFormError: 'Unable to fill out the form@class="add-user" form',
      messageFormError: 'Unable to fill out the form@class="message-post" form'
    },
    /* some aesop's quotes to post */
    quotes: [
      'Gratitude is the sign of noble souls',
      'Appearances are deceptive',
      'One good turn deserves another',
      'It is best to prepare for the days of necessity',
      'A willful beast must go his own way',
      'He that finds discontentment in one place is not likely to find happiness in another',
      'A man is known by the company he keeps',
      'In quarreling about the shadow we often lose the substance',
      'They are not wise who give to themselves the credit due to others',
      'Even a fool is wise-when it is too late!'
    ]
  };

  function init() {
    g.status = getArg('status') || 'start';
    g.url = getArg('url') || g.startUrl;
    g.body = getArg('body') || '';
    g.idx = getArg('idx') || 0;

    updateUI();
    makeRequest();
  }

  function newQuote() {
    g.idx++;
    nextStep('start');
  }

  function updateUI() {
    const elm = document.getElementById('status');
    if (elm) {
      elm.innerHTML = g.status + '<br />' + g.url + '<br />' + unescape(g.body);
    }
  }

  /* these are the things this bot can do */
  function processResponse(response) {
    const doc = response.responseXML;

    if (response.status === 200) {
      switch (g.status) {
        case 'start':
          findUsersAllLink(doc);
          break;
        case 'get-users-all':
          findMyUserName(doc);
          break;
        case 'get-register-link':
          findRegisterLink(doc);
          break;
        case 'get-register-form':
          findRegisterForm(doc);
          break;
        case 'post-user':
          postUser(doc);
          break;
        case 'get-message-post-link':
          findMessagePostForm(doc);
          break;
        case 'post-message':
          postMessage(doc);
          break;
        case 'completed':
          handleCompleted(doc);
          break;
        default:
          alert('unknown status: [' + g.status + ']');
          return;
      }
    }
    else {
      alert(response.status);
    }
  }

  function findUsersAllLink(doc) {
    const elm = getElementsByRelType('users-all', 'a', doc)[0];
    if (elm) {
      const url = elm.getAttribute('href');
      nextStep('get-users-all', url);
    }
    else {
      alert(g.errors.noUsersAllLink);
    }
  }

  function findMyUserName(doc) {
    let found = false;
    const url = g.startUrl;

    const coll = getElementsByRelType('user', 'a', doc);
    if (coll.length === 0) {
      alert(g.errors.noUserLink);
    }
    else {
      for (let i = 0, x = coll.length; i < x; i++) {
        if (coll[i].firstChild.nodeValue === g.user.user) {
          found = true;
          break;
        }
      }

      if (found === true) {
        g.status = 'get-message-post-link';
      }
      else {
        g.status = 'get-register-link';
      }
      nextStep(g.status, url);
    }
  }

  function findRegisterLink(doc) {
    const elm = getElementsByRelType('register', 'a', doc)[0];
    if (elm) {
      const url = elm.getAttribute('href');
      nextStep('get-register-form', url);
    }
    else {
      alert(g.errors.noRegisterLink);
    }
  }

  function findRegisterForm(doc) {
    let c = 0;
    const args = [];
    let found = false;
    let url;

    const elm = getElementsByClassName('user-add', 'form', doc)[0];

    if (elm) {
      found = true;
    } else {
      alert(g.errors.noRegisterForm);
      return;
    }

    if (found === true) {
      url = elm.getAttribute('action');

      let coll = elm.getElementsByTagName('input');
      for (let i = 0, x = coll.length; i < x; i++) {
        name = coll[i].getAttribute('name');
        if (g.user[name] !== undefined) {
          args[c++] = { 'name': name, 'value': g.user[name] };
        }
      }

      coll = elm.getElementsByTagName('textarea');
      for (let i = 0, x = coll.length; i < x; i++) {
        const name = coll[i].getAttribute('name');
        if (g.user[name] !== undefined) {
          args[c++] = { 'name': name, 'value': g.user[name] };
        }
      }
    }

    if (args.length !== 0) {
      let body = '';
      for (let i = 0, x = args.length; i < x; i++) {
        if (i !== 0) {
          body += '&';
        }
        body += args[i].name + '=' + encodeURIComponent(args[i].value);
      }
      alert(body);
      nextStep('post-user', url, body);
    } else {
      alert(g.errors.registerFormError);
    }
  }

  function postUser() {
    nextStep('get-message-post-link');
  }

  function findMessagePostForm(doc) {
    let c = 0;
    let url;
    const args = [];
    let found = false;

    const elm = getElementsByClassName('message-post', 'form', doc)[0];
    if (elm) {
      found = true;
    } else {
      alert(g.errors.noMessagePostForm);
      return;
    }

    if (found === true) {
      url = elm.getAttribute('action');
      const coll = elm.getElementsByTagName('textarea');
      for (let i = 0, x = coll.length; i < x; i++) {
        name = coll[i].getAttribute('name');
        if (g.msg[name] !== undefined) {
          if (name === 'message') {
            args[c++] = { name, value: g.quotes[g.idx] };
          }
          else {
            args[c++] = { name, value: g.msg[name] };
          }
        }
      }
    }

    if (args.length !== 0) {
      let body = '';
      for (let i = 0, x = args.length; i < x; i++) {
        if (i !== 0) {
          body += '&';
        }
        body += args[i].name + '=' + escape(args[i].value);
      }
      nextStep('post-message', url, body);
    } else {
      alert(g.errors.messageFormError);
    }
  }

  function postMessage() {
    nextStep('completed');
  }

  function handleCompleted() {
    if (g.idx < 9) {
      if (confirm('Succces! Should I wait ' + g.wait + ' seconds to post again?') === true) {
        setTimeout(newQuote, g.wait * 1000);
      }
    }
    else {
      alert('I posted all my quotes!');
    }
  }

  /* utilities */
  function getArg(name) {
    const match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
  }

  function nextStep(status, url, body) {
    let href = window.location.href;
    href = href.substring(0, href.indexOf('?'));

    let adr = href + '?status=' + status;
    adr += '&idx=' + g.idx;

    if (url) { adr += '&url=' + encodeURIComponent(url); }
    if (body) { adr += '&body=' + encodeURIComponent(body); }

    window.location.href = adr;
  }

  function makeRequest() {
    const config = {
      headers: {
        accept: 'application/xhtml+xml'
      }
    };

    if (g.body !== '') {
      config['body'] = g.body;
      config['method'] = 'post';
      config.headers['content-type'] = 'application/x-www-form-urlencoded';
      config.headers['authorization'] = 'Basic ' + Base64.encode(g.user.user + ':' + g.user.password);
    }
    else {
      config['method'] = 'get';
    }

    fetch(g.url, config)
      .then(response => {
        g.url = '';
        g.body = '';
        processResponse(response);
      });
  }

  function getElementsByRelType(relType, tag, elm) {
    const testClass = new RegExp("(^|\\s)" + relType + "(\\s|$)");
    tag = tag || "*";
    const elements = (tag === "*" && elm.all) ? elm.all : elm.getElementsByTagName(tag);
    const returnElements = [];
    const length = elements.length;

    for (let i = 0; i < length; i++) {
      const current = elements[i];
      if (testClass.test(current.getAttribute('rel'))) {
        returnElements.push(current);
      }
    }

    return returnElements;
  }

  function getElementsByClassName(className, tag, elm) {
    const testClass = new RegExp("(^|\\s)" + className + "(\\s|$)");
    tag = tag || "*";
    const elements = (tag === "*" && elm.all) ? elm.all : elm.getElementsByTagName(tag);
    const returnElements = [];

    const length = elements.length;
    for (let i = 0; i < length; i++) {
      const current = elements[i];
      if (testClass.test(current.getAttribute('class'))) {
        returnElements.push(current);
      }
    }

    return returnElements;
  }

  const that = {};
  that.init = init;
  return that;
};
