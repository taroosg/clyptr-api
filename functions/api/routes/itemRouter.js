const express = require('express');
const db = require('../model/firebase');
const cors = require('cors');

const itemRouter = express.Router();
itemRouter.use(cors());
// itemRouter.use((req, res, next) => {
//   if (確認の条件)) {
//     next();
//   } else {
//     throw new Error('Bad Key');
//   }
// });

// Read All Item
itemRouter.get('/', async (req, res, next) => {
  try {
    const itemSnapshot = await db.collection('latlng').get();
    // const items = [];
    itemList = itemSnapshot.docs.map(x => {
      return {
        id: x.id,
        data: x.data()
      };
    })
    // itemSnapshot.forEach(doc => {
    //   items.push({
    //     id: doc.id,
    //     data: doc.data()
    //   });
    // });
    res.json(itemList);
  } catch (e) {
    next(e);
  }
});

// Read an Item
itemRouter.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) {
      throw new Error('id is blank');
    }
    const item = await db
      .collection('latlng')
      .doc(id)
      .get();
    if (!item.exists) {
      throw new Error('item does not exists');
    }
    res.json({
      id: item.id,
      data: item.data()
    });
  } catch (e) {
    next(e);
  }
});

// Create Item
itemRouter.post('/', async (req, res, next) => {
  try {
    const text = req.body.text;
    if (!text) {
      throw new Error('Text is blank');
    }
    const data = { text };
    const ref = await db.collection('latlng').add(data);
    res.json({
      id: ref.id,
      data
    });
  } catch (e) {
    next(e);
  }
});

// Update item
itemRouter.put('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const text = req.body.text;

    if (!id) {
      throw new Error('id is blank');
    }
    if (!text) {
      throw new Error('text is blank');
    }

    const data = { text };
    const ref = await db
      .collection('latlng')
      .doc(id)
      .update({
        ...data
      });
    res.json({
      id,
      data
    });
  } catch (e) {
    next(e);
  }
});

// Delete Item
itemRouter.delete('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) {
      throw new Error('id is blank');
    }
    await db
      .collection('latlng')
      .doc(id)
      .delete();
    res.json({
      id
    });
  } catch (e) {
    next(e);
  }
});

// Error Handling
itemRouter.use((req, res, next) => {
  res.status(404).json({
    error: 'Route Not Found'
  });
});

itemRouter.use((e, req, res, next) => {
  res.status(500).json({
    error: e.name + ': ' + e.message
  });
});

module.exports = itemRouter;