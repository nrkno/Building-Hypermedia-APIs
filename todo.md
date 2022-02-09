# Remaining tasks

- Chapter 2
  - [x] Modernize example application
  - [x] Modernize client js in `public/`
  - [ ] Add Open API
  - [x] Update site urls to use host and port values
  - [x] Use fetch api instead ajax (remove file)
- Chapter 3
  - [ ] Modernize `collection.js`
  - [ ] Add Open API
  - [x] Update site urls to use host and port values
  - [ ] Use fetch api instead ajax (remove file)
- Chapter 4
  - [ ] Modernize example application
  - [ ] Add Open API
  - [ ] Update site urls to use host and port values
  - [ ] Use fetch api instead ajax (remove file)

## Code

`filterData` i `/nodejs/collection/public/collection.js`:

```js
  function filterData(href, rel) {
    const a = document.querySelector(`a[rel="${rel}"]`);
    const args = (a.getAttribute('args') || '');
    const data = JSON.parse(unescape(args));

    let url = new URL(window.location.pathname, document.baseURI);
    url.searchParams.set("filter", new URL(href, document.baseURI).pathname.substring(1));
    for (const argument of data) {
      url.searchParams.append(argument.name, prompt(argument.prompt));
    }

    window.location = url;

    // const newUrl = url => {
    //   if (url.indexOf('?') != -1) {
    //     url = url.substring(0, url.indexOf('?'));
    //   }
    // }

    // let url = newUrl(window.location.href);
    // const args = (a.getAttribute('args') || '');
    // if (args === '') {
    //   window.location = url + "?filter=" + encodeURIComponent(href.replace('http://localhost:3000', ''));
    // } else {
    //   const data = JSON.parse(unescape(args));
    //   for (let i = 0, x = data.length; i < x; i++) {
    //     data[i].value = prompt(data[i].name);
    //   }

    //   url = url + "?filter=" + encodeURIComponent(href.replace('http://localhost:3000', '') + '?');

    //   for (let i = 0, x = data.length; i < x; i++) {
    //     if (i > 0) {
    //       url += encodeURIComponent('&');
    //     }
    //     url += encodeURIComponent(data[i].name + '=' + data[i].value);
    //   }
    //   window.location = url;
    // }
  }
```
