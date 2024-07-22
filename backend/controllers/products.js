import { validationResult } from 'express-validator';

import bcrypt from 'bcryptjs';
import { existsSync, unlinkSync } from 'fs';
import Product from '../models/product.js';
import path from 'path';

export async function fetchAll(req, res, next) {
    try {
        const [allProducts] = await Product.fetchAll();
        res.status(200).json(allProducts);
    } catch (err) {
        if (!err.statusCode) {err.statusCode = 500;}
        next(err);
    }
}

export async function postProduct(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return console.error("Error "+errors);
    }
    
    const { title, description, sale_price, category, stock } = req.body;
    const image_url = req.file.path;

    // console.info("Controllers/Products.js"+req.body);
    // console.info(idSupplier);

    try {
        const product = {
            title: title, 
            description: description,
            sale_price: sale_price, 
            category: category,
            stock: stock,
            image_url: image_url,
            // idSupplier: idSupplier,
        }

        const result = await Product.save(product);

        res.status(201).json({ message: 'The product was added', product: product })
    } catch (err) {
        if (!err.statusCode) {err.statusCode = 500;}
        next(err);
    }
}


export async function deleteProduct(req, res, next) {
    console.log("Borrando producto "+req.params.id)
    try {
        const [product] = await Product.findById(req.params.id);
        if (product.length === 0) {
            throw new Error(`No se encontró ningún producto con el id ${req.params.id}`);
        }
        const { id: productId, image_url } = product[0];

        if (existsSync(image_url)) {
            unlinkSync(image_url);
        }

        const deleteResponse = await Product.delete(productId);

        res.status(200).json(deleteResponse);
    } catch (err) {
        if (!err.statusCode) {err.statusCode = 500;}
        next(err);
    }
}

export async function getProductById(req, res, next) {
    try {
      const [product] = await Product.findById(req.params.id);
      if (product.length === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.status(200).json(product[0]);
    } catch (error) {
      next(error);
    }
  }