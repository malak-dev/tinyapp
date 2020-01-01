
const express = require('express');
const cookieSession = require('cookie-session');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const {
  getUserByEmail, generateRandomString, urlDatabase, urlsForUser,
} = require('./helpers');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['Iliketocookpotatoesinthedark', 'Lifeishardwhenthepotatoesarenotfreshandmushy'],
}));

app.set('view engine', 'ejs');
const users = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: bcrypt.hashSync('purple-monkey-dinosaur', 10),
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: bcrypt.hashSync('dishwasher-funk', 10),
  },
};


app.get('/urls/new', (req, res) => {
  const templateVars = {
    user: users[req.session.userId],
  };
  res.render('urls_new', templateVars);
});
app.post('/urls', (req, res) => {
  const id = generateRandomString();
  urlDatabase[id] = { longURL: req.body.longURL, userID: req.session.userId };
  res.redirect('/login');
});
app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlsForUser(req.session.userId),
    user: users[req.session.userId],
  };
  res.render('urls_index', templateVars);
});
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.userId],
  };
  res.render('urls_show', templateVars);
});
app.get('/u/:shortURL', (req, res) => {
  const templateVars = {
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.session.userId],
  };
  res.redirect(templateVars);
});


app.post('/urls/:shortURL/delete', (req, res) => {
  if (req.session.userId === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.send('you can not delete this url');
  }
});
app.post('/urls/:shortURL', (req, res) => {
  if (req.session.userId === urlDatabase[req.params.shortURL].userID) {
    const { shortURL } = req.params;
    const { longURL } = req.body;
    urlDatabase[shortURL].longURL = longURL;
    res.redirect('/urls');
  } else {
    res.send('you can not delete this url');
  }
});

app.get('/register', (req, res) => {
  const templateVars = { user: null };

  res.render('register', templateVars);
});
app.post('/register', (req, res) => {
  const id = generateRandomString();
  const user = {
    id,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10),
  };
  req.session.userId = id;
  if (!req.body.email || !req.body.password) {
    res.status(400);
    return res.send('please valid the email or the password');
  }
  const newUser = getUserByEmail(req.body.email, users);
  if (!newUser) {
    users[id] = user;
    req.session.userId = id;
    res.redirect('/urls');
  } else {
    return res.status(400).send('user is already exist');
  }
  users[id] = user;
});
app.get('/login', (req, res) => {
  const templateVars = { user: users[req.session.userId] };
  res.render('login', templateVars);
});
app.post('/login', (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  if (user) {
    if (bcrypt.compareSync(req.body.password, user.password)) {
      req.session.userId = user.id;
      res.redirect('/urls');
    }
  } else {
    res.status(400);
    res.send('validate your email or your password');
    return;
  }
  res.redirect('/urls');
});
app.post('/logout', (req, res) => {
  delete req.session.userId;
  res.redirect('/urls');
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
