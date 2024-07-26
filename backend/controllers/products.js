import { validationResult } from 'express-validator';

import bcrypt from 'bcryptjs';
import { existsSync, unlinkSync } from 'fs';
import Product from '../models/product.js';
import User from '../models/user.js';
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

import { MercadoPagoConfig, Preference } from 'mercadopago';
import Order from '../models/order.js';

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

export const createPreference = async (req, res) => {
  try {
    const { items, userId } = req.body;
    
    // console.log("ITEMS:", userId);
    // items.forEach(item => console.log(item.sale_price));

    const body = {
      items: items.map(item => ({
        title: item.title,
        quantity: item.quantity,
        unit_price: Number(item.sale_price),
        currency_id: 'ARS'
      })),
      back_urls: {
        success: 'https://www.google.com/',
        failure: 'https://www.google.com/',
        pending: 'https://www.google.com/'
      },
      auto_return: 'approved',
      metadata: { userId: userId, items: items },
      notification_url: "https://fc47-181-170-144-157.ngrok-free.app/products/order/webhook"
    };

    const preference = new Preference(client);
    const result = await preference.create({ body });
    
    res.json({ id: result.id });
  } catch (error) {
    console.error("Error creating preference:", error);
    res.status(500).json({ error: 'Error creating preference' });
  }
};

export const orderWebhook = async (req, res) => {
  const paymentId = req.query.id;
  if(paymentId){
    try {
      console.log("fectching payment "+paymentId);
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`
        }
      });
      
      const data = await response.json();
      console.log(data);
      if (response.status !== 200) {
        throw Error(data.message)
      };
      if (response.ok) {
        const { items, user_id } = data.metadata;
        const transaction_amount = data.transaction_amount;
        
        const [orderResult] = await Order.insertOrder(user_id, transaction_amount);
        const newOrderId = orderResult.insertId;
        
        for (const item of items) {
          const productId = item.product_id;
          const quantity = item.quantity;
          await Order.insertOrderProductRelation(newOrderId, productId, quantity);
          
          // Actualizar el inventario
          // await Order.updateInventory(productId, -quantity);
        }

        // Enviar correo de confirmación
        await sendConfirmationEmail(user_id, newOrderId);

        res.sendStatus(200);
      } else {
        console.error(`Error fetching payment: ${response.status} ${response.statusText}`);
        res.status(response.status).json({ error: 'Error fetching payment' });
      }
      
    } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(500).json({ error: 'Error processing webhook' });
    }
  } else {
    console.error("Error PaymentId "+paymentId);
  }
};

import { createTransport } from 'nodemailer';
const transporter = createTransport({
  service: 'Gmail', 
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

async function sendConfirmationEmail(userId, orderId) {
  try {
    const u = await User.findById(userId);
    const user = u[0][0];
    // console.log("USER ",user);

    if (!user || !user.email) {
      throw new Error('User email is missing');
    }

    const o = await Order.findById(orderId);
    const order = o[0][0];
    if (!order) {
      throw new Error('Order not found');
    }
    // console.log("ORDEN",order);

    const op = await Order.getOrderProducts(orderId);
    const orderProducts = op[0];
    // console.log(orderProducts);
    const productDetails = orderProducts.map(product => `
      <li>${product.title} - Cantidad: ${product.quantity} - Precio: $${product.sale_price}</li>
    `).join('');

    // console.log(process.env.MAIL_USERNAME+" "+user.email+" "+user.name+" "+order.id+" "+productDetails+" "+order.total_value+" "+order.order_date)
    const mailOptions = {
      from: process.env.MAIL_USERNAME,
      to: user.email,
      subject: 'Confirmación de Compra - Sattva',
      html: `
          <p>Estimado ${user.name},</p>
          <p>Gracias por tu compra. Aquí están los detalles de tu orden:</p>
          <p>Orden ID: ${order.id}</p>
          <p>Productos comprados:</p>
          <ul>${productDetails}</ul>
          <p>Total: $${order.total_value}</p>
          <p>Fecha de compra: ${order.order_date}</p>
          <p>Atentamente,</p>
          <p>Sattva Espacio de Salud y Bienestar</p>
      `,
    };
    await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent to:', user.email);
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
}



