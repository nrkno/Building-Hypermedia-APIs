/**
 * Maze+XML server.
 * Designing Hypermedia APIs by Mike Amundsen (2011)
*/

// for express
const express = require('express');
const app = module.exports = express();
const port = process.env.PORT ?? 3000;
const host = process.env.HOST ?? 'localhost';
const errorhandler = require('errorhandler');
const expressLayout = require('express-ejs-layouts')

// for couch
var cradle = require('cradle');
const errorHandler = require('errorhandler');
var db = new(cradle.Connection)().database('maze-data');

// global data
var contentType = 'application/xml';

// Configuration
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(expressLayout);
app.use(express.static(__dirname + '/public'));

const errorOptions = process.NODE_ENV === 'production' ? { dumpExceptions: true, showStack: true } : undefined;
app.use(errorHandler(errorOptions));

// handle collection 
app.get('/maze/', function(req, res){
  res.header('content-type',contentType);
  res.render('collection', {
    title : 'Maze+XML Hypermedia Example',
    site  : 'http://localhost:3000/maze'
  });
});

// handle item
app.get('/maze/:m', function (req, res) {
  const mz = (req.params.m || 'none');

  db.get(mz, function (err, doc) {
    res.header('content-type',contentType);
    res.render('item', {
      site  : 'http://localhost:3000/maze',
      maze  : mz,
      debug : doc
    });
  });
});

// handle exit 
app.get('/maze/:m/999', function (req, res) {
  const mz = (req.params.m || 'none');
  const cz = (req.params.c || '0');

  res.header('content-type', contentType);
  res.render('exit', {
    site  : 'http://localhost:3000/maze',
    maze  : mz,
    cell  : cz,
    total : 0,
    side  : 0,
    debug : '999',
    exit  : '0'
  });
});

// handle cell
app.get('/maze/:m/:c', function (req, res) {
  const mz = (req.params.m || 'none');
  const cz = (req.params.c || '0');

  db.get(mz, function (err, doc) {
    const i = parseInt(cz.split(':')[0], 10);
    const x = 'cell' + i;
    
    const tot = Object.keys(doc.cells).length;
    const ex = (i === tot-1 ? '1' : '0');
    const sq = Math.sqrt(tot);
    
    res.header('content-type', contentType);
    res.render('cell', {
      site  : 'http://localhost:3000/maze',
      maze  : mz,
      cell  : cz,
      total : tot,
      side  : sq,
      ix    : [i-1, i + (sq*-1), i+1, i+sq],
      debug : doc.cells[x],
      exit  : ex
    });
  });
});

// Only listen on $ node app.js
if (require.main === module) {
  app.listen(port, host, () => {
    console.log(`Express server listening on port http://${host}:${port}/`);
  });
}
