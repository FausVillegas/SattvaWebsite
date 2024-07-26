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

    static insertOrder(userId, totalValue) {
        return db.execute('INSERT INTO Orders (user_id, order_date, total_value) VALUES (?, NOW(), ?)', [userId, totalValue]);
    }

    static insertOrderProductRelation(newOrderId, productId, quantity) {
        return db.execute('INSERT INTO OrderProduct (order_id, product_id, quantity) VALUES (?, ?, ?)', [newOrderId, productId, quantity]);
    }

    static getOrderProducts(orderId) {
        return db.execute('SELECT p.id, p.title, p.description, p.sale_price, p.category, op.quantity FROM OrderProduct op JOIN Products p ON op.product_id = p.id WHERE order_id = ?;', [orderId]);
    }
};