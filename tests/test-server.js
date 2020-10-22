const express = require('express');
const app = express();


let routes  = require('./../index')('./tests/');
routes.get('/', 'samples#index');

routes.resource('resources');

app.use('/', routes.draw());

app.use(function (err, req, res, next) {
  res.status(500).json(err)
})

app.listen(3000, () => { console.log('Example running') });
