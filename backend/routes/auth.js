// const express = require('express');

// const { body } = require('express-validator');

// const router = express.Router();

// const User = require('../models/user');

// const authController = require('../controllers/auth');

// router.post(
//     '/signup',
//     [
//         body('name').trim().not().isEmpty(),
//         body('email').isEmail().withMessage('Please enter a valid email.')
//         .custom(async (email) => {
//             const user = await User.find(email);
//             if (user[0].length > 0) {
//                 return Promise.reject("Email address already exist");
//             }
//         })
//         .normalizeEmail(),
//         body('password').trim().isLength({ min: 5 }),
//     ], authController.signup
// );

// router.post(
//     '/login', authController.login
// );

// router.post(
//     '/google-login', authController.googleLogin
// );

// // router.post('/request-password-reset', authController.requestPasswordReset);
// router.post(
//     '/reset-password-request', 
//     [
//         body('email').isEmail().withMessage('Please enter a valid email.')
//         .custom(async (email) => {
//             const user = await User.find(email);
//             if (user[0].length === 0) {
//                 return Promise.reject("Email address not exist");
//             }
//         })
//     ],
//     authController.sendPasswordResetEmail
// );

// router.post('/reset-password', authController.resetPassword);

// router.post('/update-profile', authController.updateProfile);

// module.exports = router;

import express from 'express';
import { body } from 'express-validator';

import User from '../models/user.js';
import * as authController from '../controllers/auth.js';
import db from '../util/database.js';

const router = express.Router();

router.post(
    '/signup',
    [
        body('name').trim().not().isEmpty(),
        body('email').isEmail().withMessage('Please enter a valid email.')
        .custom(async (email) => {
            const user = await User.find(email);
            if (user[0].length > 0) {
                return Promise.reject("Email address already exist");
            }
        })
        .normalizeEmail(),
        body('password').trim().isLength({ min: 5 }),
    ], authController.signup
);

router.post(
    '/login', authController.login
);

router.post(
    '/google-login', authController.googleLogin
);

router.post(
    '/reset-password-request', 
    [
        body('email').isEmail().withMessage('Please enter a valid email.')
        .custom(async (email) => {
            const user = await User.find(email);
            if (user[0].length === 0) {
                return Promise.reject("Email address not exist");
            }
        })
    ],
    authController.sendPasswordResetEmail
);

router.post('/reset-password', authController.resetPassword);

router.post('/update-profile', authController.updateProfile);

router.get("/user-registrations/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;
        
        const [events] = await db.query(
            `SELECT e.id, e.title, e.event_datetime, e.description, e.price, e.imageUrl 
             FROM Events e
             JOIN EventRegistrations er ON e.id = er.event_id
             WHERE er.user_id = ?`, [userId]
        );

        const [classes] = await db.query(
            `SELECT c.id, c.title, c.description, c.imageUrl, c.monthly_fee 
             FROM Classes c
             JOIN Enrollment en ON c.id = en.class_id
             WHERE en.user_id = ?`, [userId]
        );

        res.json({ events, classes });
    } catch (error) {
        res.status(500).json({ error: "Error fetching user registrations" });
    }
});


export default router;


// import express from 'express';
// import { body } from 'express-validator';
// import User from '../models/user';
// import authController from '../controllers/auth';

// const router = express.Router();

// router.post(
//     '/signup',
//     [
//         body('name').trim().not().isEmpty(),
//         body('email').isEmail().withMessage('Please enter a valid email.')
//         .custom(async (email) => {
//             const user = await User.find(email);
//             if (user[0].length > 0) {
//                 return Promise.reject("Email address already exists");
//             }
//         })
//         .normalizeEmail(),
//         body('password').trim().isLength({ min: 5 }),
//     ], authController.signup
// );

// router.post(
//     '/login', authController.login
// );

// router.post(
//     '/google-login', authController.googleLogin
// );

// router.post(
//     '/reset-password-request', 
//     [
//         body('email').isEmail().withMessage('Please enter a valid email.')
//         .custom(async (email) => {
//             const user = await User.find(email);
//             if (user[0].length === 0) {
//                 return Promise.reject("Email address does not exist");
//             }
//         })
//     ],
//     authController.sendPasswordResetEmail
// );

// router.post('/reset-password', authController.resetPassword);

// router.post('/update-profile', authController.updateProfile);

// export default router;
