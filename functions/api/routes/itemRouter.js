const express = require('express');
const admin = require('../model/firebase');
const cors = require('cors');
const NodeGeocoder = require('node-geocoder');
const db = admin.firestore();

let options = {
  provider: 'openstreetmap',
  // apiKey: 'AIzaSyA1Xd3oiuXW_0dQxAi46m1GBzqnDnw8Xvo',
};

let geocoder = NodeGeocoder(options);


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
    const itemSnapshot = await db.collection('latlng').orderBy('timestamp', 'desc').get();
    // const items = [];
    items = itemSnapshot.docs.map(x => {
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
    res.json(items);
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

// Read my Item
itemRouter.get('/my/:uid', async (req, res, next) => {
  try {
    const itemSnapshot = await db.collection('latlng')
      .where('user', '==', req.params.uid)
      .orderBy('timestamp', 'desc')
      .get();
    items = itemSnapshot.docs.map(x => {
      return {
        id: x.id,
        data: x.data()
      };
    })
    res.json(items);
  } catch (e) {
    next(e);
  }
});


// Create Item
itemRouter.post('/', async (req, res, next) => {
  try {
    const data = req.body;
    if (!data) {
      throw new Error('Data is blank');
    }

    // 逆ジオコーディング
    const address = await geocoder.reverse({ lat: data.position.lat, lon: data.position.lng })

    // 送信
    const postData = {
      ...data,
      address: address[0].formattedAddress,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    }
    const ref = await db.collection('latlng').add(postData);
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
    const newData = req.body;

    if (!id) {
      throw new Error('id is blank');
    }
    if (!newData) {
      throw new Error('data is blank');
    }

    // const data = { text };
    const ref = await db
      .collection('latlng')
      .doc(id)
      .update({
        ...newData,
        ...{ timestamp: admin.firestore.FieldValue.serverTimestamp() },
      })
    const newItem = await db
      .collection('latlng')
      .doc(id)
      .get();
    if (!newItem.exists) {
      throw new Error('item does not exists');
    }
    res.json({
      id: newItem.id,
      data: newItem.data()
    });
  } catch (e) {
    next(e);
  }
});

// Delete Item
itemRouter.delete('/:id', async (req, res, next) => {
  console.log(req.params.id)
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