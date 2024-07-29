import db from '../util/database.js';

export default class Product {
    constructor(title, description, sale_price, category, stock, image_url){
        this.title = title;
        this.description = description;s
        this.sale_price = sale_price;
        this.category = category;
        this.stock = stock;
        this.image_url = image_url;
        // this.idSupplier = idSupplier;
    }

    static fetchAll() {
        return db.execute('SELECT * FROM products');
    }

    static save(product) {
        return db.execute(
            'INSERT INTO products (title, description, sale_price, category, stock, image_url) VALUES (?, ?, ?, ?, ?, ?)', 
            [product.title, product.description, product.sale_price, product.category, product.stock, product.image_url]
        );
    }

    static delete(id) {
        return db.execute('DELETE FROM products WHERE id = ?',[id]);
    }

    static findById(id) {
        return db.execute('SELECT * FROM products WHERE id = ?',[id]);
    }

    static update(productId, updatedData) {
        return db.execute('UPDATE products SET title = ?, description = ?, sale_price = ?, category = ?, stock = ?, image_url = ? WHERE id = ?',[updatedData.title, updatedData.description, updatedData.sale_price, updatedData.category, updatedData.stock, updatedData.image_url, productId]);
    }
};