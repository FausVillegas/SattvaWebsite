import { Router } from 'express';
const router = Router();
import { body } from 'express-validator';
import { fetchAll, getProductById, postProduct, deleteProduct, createPreference, orderWebhook, updateProduct } from '../controllers/products.js';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

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
        // body('id_supplier').trim().not().isEmpty(),
    ], postProduct
);

router.delete(
    '/:id', isAuthenticated, isAdmin, deleteProduct
);

router.put('/:id', upload('image_url'), updateProduct);

router.post('/create-preference', createPreference);

router.post("/order/webhook", orderWebhook);  

export default router;

