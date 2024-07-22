// require('dotenv').config();

// const express = require('express');
// const bodyParser = require('body-parser');
// const authRoutes = require('./routes/auth');
// const productsRoutes = require('./routes/products');
// const classesRoutes = require('./routes/classes');
// const eventsRoutes = require('./routes/events');
// const instructorsRoutes = require('./routes/instructors');
// const errorController = require('./controllers/error');
// const cors = require('cors');
// const path = require('path');

// // import paymentRoutes from './routes/payment.js';

// const paymentRoutes = require('./routes/payment');
// const morgan = require('morgan');

// const app = express();
// const ports = process.env.PORT || 3000;

// const corsOptions = {
//     origin: 'http://localhost:4200', // frontend
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//     allowedHeaders: ['Content-Type', 'Authorization']
// };

// app.use(cors(corsOptions));
// app.use(bodyParser.json());
// app.use(express.json());

// app.use(morgan('dev'));

// app.use('/uploads', express.static('uploads'));

// app.use('/auth', authRoutes);

// app.use('/products', productsRoutes);

// app.use('/classes', classesRoutes);

// app.use('/events', eventsRoutes);

// app.use('/instructors', instructorsRoutes);

// app.use('/payment', paymentRoutes);

// // app.use('/schedules', schedulesRoutes);

// app.use(errorController.get404);
// app.use(errorController.get500);

// app.listen(ports, () => console.log(`Listening on port ${ports}`));

// sequelize.sync().then(() => {
//     app.listen(ports, () => {
//         console.log(`Server is running on port ${ports}`);
//     });
// }).catch(err => {
//     console.log('Unable to connect to the database:', err);
// });


// import 'dotenv/config';
// import express from 'express';
// import bodyParser from 'body-parser';
// import cors from 'cors';
// import morgan from 'morgan';
// import path from 'path';

// import authRoutes from './routes/auth.js';
// import productsRoutes from './routes/products.js';
// import classesRoutes from './routes/classes.js';
// import eventsRoutes from './routes/events.js';
// import instructorsRoutes from './routes/instructors.js';
// import paymentRoutes from './routes/payment.js';
// import { get404, get500 } from './controllers/error.js';

// const app = express();
// const ports = process.env.PORT || 3000;

// const corsOptions = {
//   origin: 'http://localhost:4200',
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//   allowedHeaders: ['Content-Type', 'Authorization']
// };

// app.use(cors(corsOptions));
// app.use(bodyParser.json());
// app.use(express.json());
// app.use(morgan('dev'));

// app.use('/uploads', express.static('uploads'));
// app.use('/auth', authRoutes);
// app.use('/products', productsRoutes);
// app.use('/classes', classesRoutes);
// app.use('/events', eventsRoutes);
// app.use('/instructors', instructorsRoutes);
// app.use('/payment', paymentRoutes);

// app.use(get404);
// app.use(get500);

// app.listen(ports, () => console.log(`Listening on port ${ports}`));

import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import morgan from 'morgan';

import authRoutes from './routes/auth.js';
import productsRoutes from './routes/products.js';
import classesRoutes from './routes/classes.js';
import eventsRoutes from './routes/events.js';
import instructorsRoutes from './routes/instructors.js';
import paymentRoutes from './routes/payment.js';
import * as errorController from './controllers/error.js';
import { title } from 'process';
import db from './util/database.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
    origin: 'http://localhost:4200', // frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.json());

app.use(morgan('dev'));

app.get("/", (req, res) => {
    res.send("backend server open");
});

app.use('/uploads', express.static('uploads'));

app.use('/auth', authRoutes);
app.use('/products', productsRoutes);
app.use('/classes', classesRoutes);
app.use('/events', eventsRoutes);
app.use('/instructors', instructorsRoutes);
app.use('/payment', paymentRoutes);

app.post("/cart", async (req, res) => {
    const { userId, productId, quantity } = req.body;
    try {
        // const connection = await db.getConnection();
        // await connection.beginTransaction();
        
        const [existingItem] = await db.query(
            `SELECT quantity FROM CartItems WHERE user_id = ? AND product_id = ?`, 
            [userId, productId]
        );

        if (existingItem.length > 0) {
            await db.query(
                `UPDATE CartItems SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?`,
                [quantity, userId, productId]
            );
        } else {
            await db.query(
                `INSERT INTO CartItems (user_id, product_id, quantity) VALUES (?, ?, ?)`,
                [userId, productId, quantity]
            );
        }

        res.status(200).json({ message: "Item added to cart" });
    } catch (error) {
        if (connection) await connection.rollback();
        res.status(500).json({ error: "Error adding item to cart" });
    }
});


app.get("/cart/:userId", async (req, res) => {
    const userId = req.params.userId;
    try {
        const [cartItems] = await db.query(
            `SELECT ci.product_id, ci.quantity, title, sale_price, image_url 
             FROM CartItems ci
             JOIN Products p ON ci.product_id = p.id
             WHERE ci.user_id = ?`, [userId]
        );
        res.status(200).json(cartItems);
    } catch (error) {
        res.status(500).json({ error: "Error fetching cart items" });
    }
});

app.delete("/cart/:userId/:productId", async (req, res) => {
    const { userId, productId } = req.params;
    try {
        await db.query(
            `DELETE FROM CartItems WHERE user_id = ? AND product_id = ?`, 
            [userId, productId]
        );
        res.status(200).json({ message: "Item removed from cart" });
    } catch (error) {
        res.status(500).json({ error: "Error removing item from cart" });
    }
});


app.use(errorController.get404);
app.use(errorController.get500);

app.listen(port, () => console.log(`Listening on port ${port}`));

