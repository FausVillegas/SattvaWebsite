import { validationResult } from 'express-validator';

import bcrypt from 'bcryptjs';
import { existsSync, unlinkSync } from 'fs';
import Product from '../models/product.js';
import User from '../models/user.js';
import path from 'path';
import fs from 'fs';

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
    console.log("Borrando producto "+req.params.id);
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

export async function updateProduct(req, res, next) {
  console.log("Actualizando producto "+req.params.id);
  const productId = req.params.id;
  const updatedData = req.body;
  let imageUrl = req.file ? req.file.path : null;
  try {
    const [product] = await Product.findById(productId);
    if (product.length === 0) {
      throw new Error(`No se encontró ningún producto con el id ${req.params.id}`);
    }
    const oldImageUrl = product[0].image_url;
    
    updatedData.image_url = imageUrl || oldImageUrl;
    
    // console.log("PRODD "+updatedData.title, updatedData.description, updatedData.sale_price, updatedData.category, updatedData.stock, updatedData.image_url, productId);
    
      const [result] = await Product.update(productId, updatedData);

      if (imageUrl && oldImageUrl) {
        fs.unlink(oldImageUrl, (err) => {
          console.error(`Error deleting old image: ${err}`);
        });
      }

      res.status(200).json({ message: 'Producto actualizado correctamente: '+result });
  } catch (err) {
      if (!err.statusCode) {err.statusCode = 500;}
      console.error(err);
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
      notification_url: "https://fc47-181-170-144-157.ngrok-free.app/products/webhook"
    };

    const preference = new Preference(client);
    const result = await preference.create({ body });
    
    res.json({ id: result.id });
  } catch (error) {
    console.error("Error creating preference:", error);
    res.status(500).json({ error: 'Error creating preference' });
  }
};

// export const orderWebhook = async (req, res) => {
//   const paymentId = req.query.id;
//   if(paymentId){
//     try {
//       console.log("fectching payment "+paymentId);
//       const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`
//         }
//       });
      
//       // console.log(data);
//       // if (response.status !== 200) {
//         //   throw Error(data.message)
//         // };
//         try{
//         const data = await response.json();
//         const { items, user_id } = data.metadata;
//         const transaction_amount = data.transaction_amount;
        
//         const [orderResult] = await Order.insertOrder(user_id, transaction_amount);
//         const newOrderId = orderResult.insertId;
        
//         for (const item of items) {
//           const productId = item.product_id;
//           const quantity = item.quantity;
//           await Order.insertOrderProductRelation(newOrderId, productId, quantity);
          
//           // Actualizar el inventario
//           await Order.updateInventory(productId, quantity);
//         }

//         // Enviar correo de confirmación
//         await sendConfirmationEmail(user_id, newOrderId);

//         await Product.deleteItemsFromCart(user_id);

//         res.status(200).json({ response:'Order placed successfully' });
//       } catch (err) {
//         console.error(`Error fetching payment: ${err}`);
//         res.status(response.status).json({ error: 'Error fetching payment' });
//       }
      
//     } catch (error) {
//       console.error('Error processing webhook:', error);
//       res.status(500).json({ error: 'Error processing webhook' });
//     }
//   } else {
//     console.error("Error PaymentId "+paymentId);
//   }
// };

export const orderWebhook = async (req, res) => {
  const paymentId = req.query.id;
  if (!paymentId) {
    console.error("Error: PaymentId no proporcionado");
    return res.status(400).json({ error: 'PaymentId no proporcionado' });
  }

  try {
    console.log("Fetching payment " + paymentId);
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`
      }
    });

    if (response.status !== 200) {
      console.error('Error fetching payment:', response.statusText);
      return res.status(response.status).json({ error: 'Error fetching payment' });
    }

    const data = await response.json();
    const { metadata } = data;

    if (!metadata || !metadata.items || !metadata.user_id) {
      console.error('Error: metadata incompleta en la respuesta');
      return res.status(400).json({ error: 'Datos incompletos en metadata' });
    }

    const { items, user_id } = metadata;
    const transaction_amount = data.transaction_amount;

    // Verificar si la orden ya ha sido procesada
    const [existingOrder] = await Order.findByPaymentId(paymentId);
    if (existingOrder[0]) {
      console.log('Orden ya procesada:', existingOrder[0].id);
      return res.status(200).json({ response: 'Orden ya procesada' });
    }

    // Procesamiento de la orden
    const [orderResult] = await Order.insertOrder(user_id, transaction_amount, paymentId);
    const newOrderId = orderResult.insertId;

    for (const item of items) {
      const productId = item.product_id;
      const quantity = item.quantity;
      await Order.insertOrderProductRelation(newOrderId, productId, quantity);
      await Order.updateInventory(productId, quantity);
    }

    await sendConfirmationEmail(user_id, newOrderId);
    await Order.deleteItemsFromCart(user_id);

    res.status(200).json({ response: 'Order placed successfully' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Error processing webhook' });
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

    if (!user || !user.email) {
      throw new Error('User email is missing');
    }

    const o = await Order.findById(orderId);
    const order = o[0][0];
    if (!order) {
      throw new Error('Order not found');
    }

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
          <p>Localidad: ${user.location}</p>
          <p>Dirección: ${user.address}</p>
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

    const mailOptionsToAdmin = {
      from: process.env.MAIL_USERNAME,
      to: process.env.MAIL_USERNAME,
      subject: 'Aviso de Compra - Sattva',
      html: `
          <p>Compra realizada por </p>
          <p>Detalles del cliente:</p>
          <p>ID: ${user.id} Nombre: ${user.name} Email: ${user.email} Tel: ${user.phone} DNI: ${user.dni}</p>
          <p>Localidad: ${user.location}</p>
          <p>Dircción: ${user.address}</p>
          <p>Orden ID: ${order.id}</p>
          <p>Productos comprados:</p>
          <ul>${productDetails}</ul>
          <p>Total: $${order.total_value}</p>
          <p>Fecha de compra: ${order.order_date}</p>
          <p>Sattva Espacio de Salud y Bienestar</p>
      `,
    };
    await transporter.sendMail(mailOptionsToAdmin);
    console.log('Confirmation email sent to:', process.env.MAIL_USERNAME);

  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
}



