import { existsSync, unlinkSync } from 'fs';
import SattvaEvent from '../models/event.js';
import path from 'path';
import { validationResult } from 'express-validator';

export async function getAllEvents(req, res, next) {
    try {
        const [allEvents] = await SattvaEvent.fetchAll();
        res.status(200).json(allEvents);
    } catch (err) {
        if (!err.statusCode) { err.statusCode = 500; }
        next(err);
    }
}

export async function addEvent(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return console.error("Error " + errors);
    }

    const { title, description, instructor_id, dateTime, price } = req.body;

    const imageUrl = req.file ? req.file.path : null;
    try {
        const newEvent = {
            title: title,
            description: description,
            instructor_id: instructor_id,
            dateTime: dateTime,
            price: price,
            imageUrl: imageUrl
        }

        const result = await SattvaEvent.save(newEvent);

        res.status(201).json({ message: 'The event was added', class: newEvent })
    } catch (err) {
        if (!err.statusCode) { err.statusCode = 500; }
        next(err);
    }
}

export async function deleteEvent(req, res, next) {
    console.log("Borrando evento " + req.params.id)
    try {
        const [eventData] = await SattvaEvent.findById(req.params.id);
        if (eventData.length === 0) {
            throw new Error(`No se encontró ningún evento con el id ${req.params.id}`);
        }
        const { id: eventId, imageUrl } = eventData[0];

        if (existsSync(imageUrl)) {
            unlinkSync(imageUrl);
        }

        const deleteResponse = await SattvaEvent.delete(eventId);

        res.status(200).json(deleteResponse);
    } catch (err) {
        if (!err.statusCode) { err.statusCode = 500; }
        next(err);
    }
}

export async function registerForEvent(req, res, next) {
    const { eventId } = req.params;
    const { userId } = req.body;

    try {
        await SattvaEvent.registerForEvent(eventId, userId);
        res.status(201).json({ message: 'Inscripción exitosa' });
    } catch (err) {
        if (!err.statusCode) { err.statusCode = 500; }
        next(err);
    }
}

// import mercadopago from 'mercadopago';

// // // Configura MercadoPago con tu Access Token
// // mercadopago.configure({
// //   access_token: process.env.MP_ACCESS_TOKEN
// // });

// mercadopago.configurations.setAccessToken(process.env.MP_ACCESS_TOKEN);

// export async function registerAndPay(req, res, next) {
//   const { eventId } = req.params;
//   const { userId, price, title } = req.body;

//   try {
//     const preference = {
//       items: [{
//         title: title,
//         unit_price: parseFloat(price),
//         quantity: 1,
//         currency_id: 'ARS'
//       }],
//       back_urls: {
//         success: 'http://localhost:4200/success',
//         failure: 'http://localhost:4200/failure',
//         pending: 'http://localhost:4200/pending'
//       },
//       auto_return: 'approved',
//       external_reference: `${eventId}_${userId}`
//     };

//     const response = await preferences.create(preference);
//     res.status(201).json({ paymentUrl: response.body.init_point });
//   } catch (err) {
//     if (!err.statusCode) { err.statusCode = 500; }
//     next(err);
//   }
// }

