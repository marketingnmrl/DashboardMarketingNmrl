require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');
const { requireApiAuth, requireWebAuth } = require('./middleware/auth');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/static', express.static(path.join(__dirname, 'static')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use(authRoutes);
app.use('/api', requireApiAuth, apiRoutes);

app.get('/', requireWebAuth, (req, res) => {
  res.render('layout', { authUser: req.authUser || null });
});

module.exports = app;
