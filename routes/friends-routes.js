const express = require('express');

const User = require('../models/user-model');

const friendsRoutes = express.Router();

friendsRoutes.get('/api/all-users', (req, res, next) => {
  var userNames = [];

  User.find({}, (err, allUsers) => {
    res.status(200).json(allUsers);
  });
});

friendsRoutes.get('/api/find-user/:username', (req, res, next) => {

  User.findOne({ username: req.params.username }, (err, foundUser) => {
    res.status(200).json(foundUser);
  });
});

friendsRoutes.post('/api/add-friend', (req, res, next) => {

  var friendRequestedId = req.body._id;
  var requesterId = req.user._id;
  var requestsArray = [];
  var foundId;

  User.findById(friendRequestedId, (err, theUser) => {
    theUser.notifications.forEach((oneNotification) => {
      requestsArray.push(JSON.stringify(oneNotification.friendRequest));
      requestsArray.push(JSON.stringify(oneNotification.requestSent));
      console.log("request array" + requestsArray);
    });
    foundId = requestsArray.indexOf(JSON.stringify(requesterId));
    console.log(foundId);

    if (foundId == -1) {
      theUser.notifications.push({ friendRequest: requesterId });
      req.user.notifications.push({ requestSent: friendRequestedId });
    }

    theUser.save((err) => {
      if (err) {
        res.status(500).json({ message: 'Saving user failed' });
      }
    });

    req.user.save((err) => {
      res.status(200).json(req.user);
    });
  });
});

module.exports = friendsRoutes;
