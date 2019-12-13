const getUserByEmail = function (email, users) {
  for (const userId in users) {
    const currentUser = users[userId]
    if (currentUser.email === email) {
      return currentUser;
    }
  } return null;
};
module.exports = getUserByEmail;