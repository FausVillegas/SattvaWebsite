// SDK de Mercado Pago
import { MercadoPagoConfig, Preference } from 'mercadopago';
import SattvaEvent from '../models/event.js';
import SattvaClass from '../models/class.js';
import { Router } from 'express';

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
const router = Router();

router.post("/create-preference", async (req,res) => {
    try {
        const body = {
            items: [
                {
                    title: req.body.title,
                    quantity: Number(req.body.quantity),
                    unit_price: Number(req.body.price),
                    currency_id: "ARS",
                }
            ],
            back_urls: {
                success: "https://www.youtube.com/",
                failure: "https://www.youtube.com/",
                pending: "https://www.youtube.com/",
            },
            auto_return: "approved",
            metadata: {
                userId: req.body.userId, // Get user ID from request body
                classEventId: req.body.classEventId, // Get event ID from request body
                activityType: req.body.activityType 
            },
            notification_url: "https://fc7d-181-170-144-157.ngrok-free.app/payment/webhook"
        }

        const preference = new Preference(client);
        const result = await preference.create({body});

        res.json({
            id: result.id,
        });
    } catch(error) {
        res.status(500).json({
            error: "Error al crear la preferencia"
        });
    }
});

router.post("/webhook", async (req, res) => {
    // try {
    //     const payment = req.body;
    //     console.log(payment.metadata);
    //     if (payment.type === 'payment' && payment.data.status === 'approved') {
    //         const { userId, classEventId, activityType } = payment.data.metadata;

    //         if(activityType === 'event')
    //             await SattvaEvent.registerForEvent(classEventId, userId);
    //         else
    //             await SattvaClass.registerForClass(classEventId, userId);
    //     }

    //     res.status(200).send('OK');
    // } catch (error) {
    //     res.status(500).send('Error processing webhook');
    // }

    const paymentId = req.query.id;
    try {
        const respose = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`
            }
        });

        if(respose.ok) {
            const data = await respose.json();
            const { user_id, activity_type, class_event_id } = data.metadata;
            console.log(activity_type);
            if(activity_type === 'event')
                await SattvaEvent.registerForEvent(class_event_id, user_id);
            else
                await SattvaClass.registerForClass(class_event_id, user_id);
        }

        res.sendStatus(200);
    } catch(error) {
        console.log("Error: "+error);
        res.sendStatus(500);
    }
});

// import { Router } from 'express';
// import { createOrder } from '../controllers/payment.js';

// const router = Router();

// router.get('/create-order',createOrder)

// router.get('/success', (req, res) => res.send('success'))

// router.get('/webhook', (req, res) => res.send('webhook'))

export default router;
