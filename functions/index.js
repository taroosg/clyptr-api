// http://localhost:5000/mysterytour-216007/us-central1/item/

// https://us-central1-mysterytour-216007.cloudfunctions.net/item/
const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const itemRouter = require('./api/routes/itemRouter');

const app = express();
app.use(cors({ origin: true }));

// register routes
app.use('/api/v1', itemRouter);

module.exports.item = functions.https.onRequest(itemRouter);