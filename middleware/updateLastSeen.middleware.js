const express = require('express');
const User = require('../models/User');

const lastSeenMiddleware = (req, res, next) => {
    if (req.user) {
        User.findOneAndUpdate(
            { _id: req.user.id },
            {
                last_seen: new Date(),
            },
            { new: true },
            () => {},
        );
    }
    next();
};

module.exports = lastSeenMiddleware;
