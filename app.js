const express = require('express');
const path = require('path');

const cors = require('cors');
const bodyParser = require('body-parser');

const sequelize = require('./utils/database');
const signupRoute = require('./routes/signup');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/signup', signupRoute);

sequelize
  .sync({ force: true })
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
