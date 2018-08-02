var app = require('express')();
var bodyParser = require('body-parser');
var cors = require('cors');
var apiv1 = require('./api');

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

apiv1.setUp(app);

app.listen(PORT, function() {
  console.log('Listening on port ' + PORT);
});
