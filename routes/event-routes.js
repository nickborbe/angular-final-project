const express = require('express');

const myEvent = require('../models/event-model');
const User = require('../models/user-model');

const eventsRoutes = express.Router();

eventsRoutes.post('/api/create-event', (req, res, next) => {
  if (!req.body.name || !req.body.address || !req.body.guests) {
    res.status(400).json({ message: "Please complete the form to continue"});
    return;
  }

  var organizerFullName = req.user.name + " " + req.user.lastName;
  var guestArray = [];

  req.body.guests.forEach((oneGuest, index) => {
    guestArray.push({ username: oneGuest.id, fullName: oneGuest.itemName });
  });

  const thisEvent = new myEvent({
    name: req.body.name,
    organizer: {
      id: req.user._id,
      fullName: organizerFullName,
    },
    address: req.body.address,
    guests: guestArray,
  });

  thisEvent.save((err) => {
    if (err) {
      res.status(400).json({ message: 'Something went wrong' });
      return;
    }
  });

  req.body.guests.forEach((oneGuest) => {
    User.findOne({ username: oneGuest.id }, (err, theUser) => {
      theUser.events.invited.push(thisEvent._id);

      theUser.save((err) => {
        if (err) {
          res.status(400).json({ message: "Something went wrong" });
        }
      });
    });
  });

  User.findById(req.user._id, (err, theUser) => {
    theUser.events.organized.push(thisEvent._id);

    theUser.save((err) => {
      if (err) {
        res.status(400).json({ message: 'Something went wrong' });
      }
    res.status(200).json(req.user);
    });
  });
});

  eventsRoutes.post('/api/get-organized-events', (req, res, next) => {
    console.log(req.body);
    var eventsInfo = [];

    req.body.forEach((oneOrganizedEvent, index) => {
      myEvent.findOne({ _id: oneOrganizedEvent }, (err, theEvent) => {
        if (err) {
          res.status(500).json({ message: 'something went wrong'});
        }
        eventsInfo.push(theEvent);
        if (index === req.body.length -1) {
          res.status(200).json(eventsInfo);
        }
      });
    });
  });


  eventsRoutes.post('/api/get-invited-events', (req, res, next) => {
    console.log(req.body);
    var eventsInfo = [];

    req.body.forEach((oneInvitedEvent, index) => {
      myEvent.findOne({ _id: oneInvitedEvent }, (err, theEvent) => {
        if (err) {
          res.status(500).jsonw({ message: 'something went wrong'});
        }
        eventsInfo.push(theEvent);
        if (index === req.body.length - 1) {
          res.status(200).json(eventsInfo);
        }
      });
    });
  });


module.exports = eventsRoutes;
