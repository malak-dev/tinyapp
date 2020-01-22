
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

app.get('/', (req, res) => {
  res.redirect('/urls');
});


// add urls_new page
app.get('/urls/new', (req, res) => {
  const templateVars = {
    user: users[req.session.userId],
  };
  res.render('urls_new', templateVars);
});


// add a new url
app.post('/urls', (req, res) => {
  const id = generateRandomString();
  urlDatabase[id] = { longURL: req.body.longURL, userID: req.session.userId };
  res.redirect('/urls');
});

// add urls page
app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlsForUser(req.session.userId),
    user: users[req.session.userId],
  };
  res.render('urls_index', templateVars);
});

// update the url
app.get('/urls/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL]
    && req.session.userId === urlDatabase[req.params.shortURL].userID) {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user: users[req.session.userId],
    };
    res.render('urls_show', templateVars);
  } else {
    res.send('you have to login');
  }
});


app.get('/u/:shortURL', (req, res) => {
  const { longURL } = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// delete the url
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
    res.send('You cannot edit this URL');
  }
});


// add register page
app.get('/register', (req, res) => {
  const templateVars = { user: null };

  res.render('register', templateVars);
});


// check if the user is in the database
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


// login page
app.get('/login', (req, res) => {
  const templateVars = { user: users[req.session.userId] };
  res.render('login', templateVars);
});


// check if the user is registered or not
app.post('/login', (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  if (user) {
    if (bcrypt.compareSync(req.body.password, user.password)) {
      req.session.userId = user.id;
      res.redirect('/urls');
    }
  } else {
    res.status(400).send('you have to register');
    return;
  }
  res.send('Error,check your email or your password ');
});

// logout and redirect to urls page
app.post('/logout', (req, res) => {
  delete req.session.userId;
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
