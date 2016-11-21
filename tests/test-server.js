const express = require('express');
const app = express();

let routes  = new (require('./../index'))('./tests/');
routes.get('/', 'samples#index');

app.use('/', routes.draw());

app.listen(3000, () => { console.log('Example running') });
