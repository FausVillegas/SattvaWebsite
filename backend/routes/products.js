import { Router } from 'express';
const router = Router();
import { body } from 'express-validator';
import { fetchAll, getProductById, postProduct, deleteProduct, createPreference, orderWebhook, updateProduct } from '../controllers/products.js';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import Order from '../models/order.js';

router.get('/', fetchAll);

router.get('/:id', getProductById);

router.post(
    '/',
    upload('image_url'),
    [
        isAuthenticated, isAdmin,
        body('title').trim().not().isEmpty(),
        body('description').trim().not().isEmpty(),
        body('sale_price').trim().not().isEmpty(),
        body('category').trim().not().isEmpty(),
        body('stock').trim().not().isEmpty(),
    ], postProduct
);

router.delete(
    '/:id', isAuthenticated, isAdmin, deleteProduct
);

router.put('/:id', upload('image_url'), updateProduct);

router.post('/create-preference', createPreference);

router.post("/webhook", orderWebhook);  

// router.get('/orders/:status', async (req, res) => {
//     console.log("AAAAAa");
//     const status = req.params.status === 'true'; // Convert the string to a boolean
//     try {
//         const orders = await Order.findStatusFalse(status);
//         res.status(200).json(orders);
//     } catch (err) {
//         console.error(err);
//         res.status(500).send(err);
//     }
// });

router.get('/orders/by-status', async (req, res) => {
    try {
        const { status } = req.query;
        const o = await Order.findOrdersByStatus(status);
        const orders = o[0];
        for (let i = 0; i < orders.length; i++) {
            let products = await Order.getOrderProducts(orders[i].id);
            orders[i].products = products[0];
            orders[i].order_date = orders[i].order_date.toString();
        }
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener las órdenes' });
    }
});

export default router;

