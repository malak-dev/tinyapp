const getUserByEmail = function (email, users) {
  for (const userId in users) {
    const currentUser = users[userId];
    if (currentUser.email === email) {
      return currentUser;
    }
  }
};
const generateRandomString = function () {
  let firstPart = (Math.random() * 46656) | 0;
  let secondPart = (Math.random() * 46656) | 0;
  firstPart = (`000${firstPart.toString(36)}`).slice(-3);
  secondPart = (`000${secondPart.toString(36)}`).slice(-3);
  return firstPart + secondPart;
};
const urlDatabase = {
  b2xVn2: { longURL: 'http://www.lighthouselabs.ca', userID: generateRandomString() },
  sm5xK: { longURL: 'http://www.google.com', userID: generateRandomString() },
};
const urlsForUser = function (id) {
  const arr = {};
  for (const userId in urlDatabase) {
    const currentUser = urlDatabase[userId];
    if (currentUser.userID === id) {
      arr[userId] = currentUser;
    }
  } return arr;
};
module.exports = {
  getUserByEmail, generateRandomString, urlDatabase, urlsForUser,
};
