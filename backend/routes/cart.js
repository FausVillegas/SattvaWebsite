import { Router } from 'express';
import db from '../util/database.js';

const router = Router();

router.post("/", async (req, res) => {
    const { userId, productId, quantity } = req.body;
    try {
        const connection = await db.getConnection();
        await connection.beginTransaction();
        
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
        res.status(500).json({ error: "Error adding item to cart" });
    }
});


router.get("/:userId", async (req, res) => {
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

router.delete("/:userId/:productId", async (req, res) => {
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

router.put('/:userId/:productId', async (req, res) => {
    const userId = req.params.userId;
    const productId = req.params.productId;
    const { quantity } = req.body;
    try {
        // Find the cart item by user ID and product ID
        const [cartItem] = await db.query('SELECT * FROM cartitems WHERE user_id = ? AND product_id = ?',[userId, productId]);
        
        if (!cartItem) {
            return res.status(404).json({ message: "Item not found in cart" });
        }
  
      // Update the quantity
      cartItem[0].quantity = quantity;
      const result = await db.query('UPDATE cartitems SET quantity = ? WHERE user_id = ? AND product_id = ?',[cartItem[0].quantity, cartItem[0].user_id, cartItem[0].product_id]);
      console.log("UESR ID"+cartItem[0].quantity, cartItem[0].user_id, cartItem[0].product_id);
    
      res.json({ message: "Item quantity updated", cartItem });
    } catch (error) {
        console.error(error);
      res.status(500).json({ message: "Server error", error });
    }
  });

export default router;
