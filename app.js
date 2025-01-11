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
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          'https://checkout.razorpay.com',
          'https://cdn.jsdelivr.net',
        ],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:', 'http:'],
        formAction: ["'self'", 'http://13.126.130.202:3000'],
        connectSrc: [
          "'self'",
          'https://api.razorpay.com',
          'https://lumberjack.razorpay.com',
          'https://lumberjack-cx.razorpay.com',
        ],
        fontSrc: ["'self'", 'https:', 'data:'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'self'", 'https://api.razorpay.com'],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    hsts: false, // Disable HSTS here
    contentSecurityPolicy: false, // if you want to disable CSP entirely
  })
);

app.use(morgan('combined', { stream: accessLogStream }));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));

app.use('/signup', signupRoute);
app.use('/login', loginRoute);
app.use('/expense', expenseRoute);
app.use('/password', passwordRoute);
app.use('/report', reportRoute);

app.use((req, res) => {
  res.sendFile(path.join(__dirname, `public/${req.url}`));
});

User.hasMany(Expense, { onDelete: 'CASCADE', foreignKey: 'userId' });
Expense.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(ForgotPasswordRequest);
ForgotPasswordRequest.belongsTo(User, { onDelete: 'CASCADE' });
User.hasMany(DownloadList, { foreignKey: 'userId', onDelete: 'CASCADE' });
DownloadList.belongsTo(User, { foreignKey: 'userId' });

sequelize
  .sync()
  .then(() => {
    app.listen(process.env.PORT || 3000, '0.0.0.0', () => {
      console.log('Server is running on port 3000');
    });
  })
  .catch((err) => {
    console.error('Error starting server:', err);
  });
