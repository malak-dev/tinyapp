const { assert } = require('chai');

const getUserByEmail = require('../helpers.js');

const testUsers = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur',
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk',
  },
};

describe('getUserByEmail', () => {
  it('should return a user with valid email', () => {
    const user = getUserByEmail('user@example.com', testUsers);
    const expectedOutput = 'user@example.com';
    assert.strictEqual(user.email, expectedOutput);
  });
});
describe('getUserByEmail', () => {
  it('should return a user with valid email', () => {
    const user = getUserByEmail('user@example.c', testUsers);
    const expectedOutput = null;
    assert.equal(user, expectedOutput);
  });
});
