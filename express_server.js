
const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
app.use(cookieParser())
const PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const bcrypt = require('bcrypt');
app.set("view engine", "ejs");

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: generateRandomString() },
  "9sm5xK": { longURL: "http://www.google.com", userID: generateRandomString() }
};
console.log(urlDatabase);
function generateRandomString() {
  let firstPart = (Math.random() * 46656) | 0;
  let secondPart = (Math.random() * 46656) | 0;
  firstPart = ("000" + firstPart.toString(36)).slice(-3);
  secondPart = ("000" + secondPart.toString(36)).slice(-3);
  return firstPart + secondPart;
}
function findUser(email) {
  for (const userId in users) {
    const currentUser = users[userId]
    if (currentUser.email === email) {
      return currentUser;
    }
  } return null;
};
function urlsForUser(id) {
  let arr = {};
  for (const userId in urlDatabase) {
    const currentUser = urlDatabase[userId]
    console.log(currentUser)
    if (currentUser.userID === id) {
      arr[userId] = currentUser;
    }
  } return arr;
};
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.cookies['user_id']]
  }
  res.render("urls_new", templateVars);
  //res.redirect('/login')
});
app.post("/urls", (req, res) => {
  let id = generateRandomString()
  urlDatabase[id] = { longURL: req.body.longURL, userID: req.cookies['user_id'] };
  res.redirect('/urls');
});
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlsForUser(req.cookies['user_id']),
    user: users[req.cookies['user_id']]
  };

  res.render("urls_index", templateVars);
});
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.cookies['user_id']]
  }
  res.render("urls_show", templateVars);
});
app.get("/u/:shortURL", (req, res) => {

  const templateVars = {
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies['user_id']]
  }
  res.redirect(templateVars);
});


app.post('/urls/:shortURL/delete', (req, res) => {
  if (req.cookies['user_id'] === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  }
  else {
    res.send("you can not delete this url");
  }
})
app.post('/urls/:shortURL', (req, res) => {
  if (req.cookies['user_id'] === urlDatabase[req.params.shortURL].userID) {
    shortURL = req.params.shortURL;
    let longURL = req.body.longURL;
    urlDatabase[shortURL].longURL = longURL
    res.redirect('/urls');
  }
  else {
    res.send("you can not delete this url");
  }
})

app.get('/register', (req, res) => {
  let templateVars = { user: null }

  res.render('register', templateVars);

})
app.post('/register', (req, res) => {

  let id = generateRandomString();
  const user = {
    id: id,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password,10)
  }
  res.cookie('user_id', id)
  if (!req.body.email || !req.body.password) {
    res.status(400);
    res.send("please valid the email or the password");
    return
  }
  const newUser = findUser(req.body.email);
  if (!newUser) {
    users[id] = user;
    res.redirect('/urls')
  } else {
    res.status(400);
    res.send("user is already exist");
    return
  }
  users[id] = user;
  console.log(users);
})
app.get('/login', (req, res) => {
  let templateVars = { user: users[req.cookies['user_id']] }
  res.render('login', templateVars);
})
app.post('/login', (req, res) => {
  console.log(req.body)
  let user = findUser(req.body.email)
  console.log(user);
  if (user) {
    if(bcrypt.compareSync(user.password ,req.body.password)){
      res.cookie('user_id', user.id)
      res.redirect('/urls')
    }
  } else {
    res.status(400);
    res.send("validate your email or your password");
    return
  }
  res.redirect('/urls')
})
app.post('/logout', (req, res) => {
  res.clearCookie('user_id')
  res.redirect('/urls');
})
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});