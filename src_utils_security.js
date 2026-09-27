const crypto = require('node:crypto');

function hashToken(token) {
  return crypto.createHash('sha256').update(token.trim()).digest('hex');
}

function createVotingToken() {
  return crypto.randomBytes(8).toString('hex').toUpperCase();
}

function createReceiptCode() {
  return crypto.randomUUID().toUpperCase();
}

module.exports = { hashToken, createVotingToken, createReceiptCode };
