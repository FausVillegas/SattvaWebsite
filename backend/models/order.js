import db from '../util/database.js';

export default class Order {
    constructor(id, user_id, order_date, total_value){
        this.id = id,
        this.user_id = user_id,
        this.order_date = order_date,
        this.total_value = total_value
    }

    static fetchAll() {
        return db.execute('SELECT * FROM orders');
    }

    static findById(id) {
        return db.execute('SELECT * FROM orders WHERE id = ?',[id]);
    }

    static insertOrder(userId, totalValue, paymentId) {
        return db.execute('INSERT INTO Orders (user_id, order_date, total_value, payment_id) VALUES (?, NOW(), ?, ?)', [userId, totalValue, paymentId]);
    }

    static insertOrderProductRelation(newOrderId, productId, quantity) {
        return db.execute('INSERT INTO OrderProduct (order_id, product_id, quantity) VALUES (?, ?, ?)', [newOrderId, productId, quantity]);
    }

    static getOrderProducts(orderId) {
        return db.execute('SELECT p.id, p.title, p.description, p.sale_price, p.category, op.quantity FROM OrderProduct op JOIN Products p ON op.product_id = p.id WHERE order_id = ?;', [orderId]);
    }

    static updateInventory(productId, quantity) {
        return db.execute('UPDATE Products SET stock = stock - ? WHERE id = ?', [quantity, productId]);
    }

    static deleteItemsFromCart(userId) {
        return db.execute(`DELETE FROM cartitems WHERE user_id = ?`, [userId]);
    }

    static findByPaymentId(paymentId) {
        return db.execute('SELECT * FROM orders WHERE payment_id = ?', [paymentId]);
    }

    static findOrdersByStatus(status) {
        return db.execute('SELECT * FROM orders WHERE status = ?', [status]);
    }
};