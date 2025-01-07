require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');

const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');

const sequelize = require('./utils/database');
const signupRoute = require('./routes/signup');
const loginRoute = require('./routes/login');
const expenseRoute = require('./routes/expense');
const passwordRoute = require('./routes/forgetpassword');
const reportRoute = require('./routes/report');

const User = require('./model/User');
const Expense = require('./model/Expense');
const ForgotPasswordRequest = require('./model/ForgetPasswordRequest');
const DownloadList = require('./model/FileDownloaded');

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flag: 'a' }
);

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", 'https:', 'data:'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(morgan('combined', { stream: accessLogStream }));

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/signup', signupRoute);
app.use('/login', loginRoute);
app.use('/expense', expenseRoute);
app.use('/password', passwordRoute);
app.use('/report', reportRoute);

User.hasMany(Expense, { onDelete: 'CASCADE', foreignKey: 'userId' });
Expense.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(ForgotPasswordRequest);
ForgotPasswordRequest.belongsTo(User, {
  onDelete: 'CASCADE',
});
User.hasMany(DownloadList, { foreignKey: 'userId', onDelete: 'CASCADE' });
DownloadList.belongsTo(User, { foreignKey: 'userId' });

sequelize
  .sync()
  .then((result) => {
    app.listen(process.env.PORT || 3000);
  })
  .catch((err) => {
    console.log(err);
  });
