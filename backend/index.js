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
import cartRoutes from './routes/cart.js';
import * as errorController from './controllers/error.js';
import { title } from 'process';
import db from './util/database.js';
import SattvaEvent from './models/event.js';
import SattvaClass from './models/class.js';

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
app.use('/cart',cartRoutes);

app.get('/is-enrolled', async (req, res) => {
    const { userId, classEventId, activityType } = req.query;
    try {
        let isEnrolled = false;
        if (activityType === 'event') {
            isEnrolled = await SattvaEvent.isUserEnrolled(classEventId, userId);
        } else {
            isEnrolled = await SattvaClass.isUserEnrolled(classEventId, userId);
        }
        if(isEnrolled)
            res.json('Ya estás inscrito en esta actividad.');
        else
            res.json('');
    } catch (error) {
        res.status(500).json({ error: 'Error al verificar la inscripción' });
    }
});



app.use(errorController.get404);
app.use(errorController.get500);

app.listen(port, () => console.log(`Listening on port ${port}`));

