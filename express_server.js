
const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
app.use(cookieParser())
const PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
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
  res.render("urls_new");
});
app.post("/urls", (req, res) => {
  console.log(generateRandomString());
  let id = generateRandomString()
  urlDatabase[id] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect('/urls');
});
app.get("/urls", (req, res) => {
  
  let templateVars = { urls: urlDatabase, 
    user: users[req.cookies['user_id']]
};
  res.render("urls_index", templateVars);
});
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies['user_id']]
  };
  app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL]
    res.redirect(longURL);
  });
  console.log(req.params)
  res.render("urls_show", templateVars);
});
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
})
app.post('/urls/:shortURL', (req, res) => {

  shortURL = req.params.shortURL
  console.log(shortURL)
  let longURL = req.body.longURL;
  console.log(req.body);
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
})

app.get('/register', (req, res) => {
  res.render('register');

})
app.post('/register', (req, res) => {

  let id = generateRandomString();
  const user = {
    id: id,
    email: req.body.email,
    password: req.body.password
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
  res.render('login');
})
app.post('/login', (req, res) => {
  console.log(req.body)
  let cheacEmail = findUser(req.body.email)
  if (!cheacEmail) {
    let checkPassword = findUser(req.body.password);
    if (!checkPassword) {
      res.cookie('user_id', generateRandomString())
      res.redirect('/urls')
    }
  } else {
    res.status(400);
    res.send("user is already exist");
    return
  }
  res.redirect('/urls');

})
app.post('/logout', (req, res) => {
  res.clearCookie('user_id')
  res.redirect('/urls');
})
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});