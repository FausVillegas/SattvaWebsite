import { validationResult } from 'express-validator';

import { createTransport } from 'nodemailer';
import { config } from 'dotenv';
config();
import { randomBytes } from 'crypto';

import hc from 'bcryptjs';
const { hash, compare } = hc;
import sd from 'jsonwebtoken';
const { sign, decode } = sd;

import User from '../models/user.js';

const transporter = createTransport({
    service: 'Gmail', 
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  transporter.verify((error, success) => {
    if (error) {
        console.error('Error de verificación del transporter:', error);
    } else {
        console.log('Servidor listo para enviar correos');
    }
});

export async function sendPasswordResetEmail(req, res, next) {
    const { email } = req.body;
    
    try {
        // Verifica si el usuario existe
        const user = await User.find(email);

        if (user[0].length !== 1) {
            const error = new Error('A user with this email could not be found')
            error.statusCode = 401;
            throw error;
        }

        const storedUser = user[0][0];

        // Genera un token de restablecimiento
        const resetToken = randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // Token válido por 1 hora

        // Guarda el token y su expiración en el usuario
        storedUser.resetPasswordToken = resetToken;
        storedUser.resetPasswordExpiry = resetTokenExpiry;

        await User.saveResetToken(storedUser.id, resetToken, resetTokenExpiry); 

        // URL de restablecimiento de contraseña
        const resetUrl = `http://localhost:4200/reset-password?token=${resetToken}`;
        
        // Configura el correo
        const mailOptions = {
            from: process.env.MAIL_USERNAME,
            to: email,
            subject: 'Restablecimiento de Contraseña',
            html: `
                <p>Has solicitado restablecer tu contraseña.</p>
                <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
                <a href="${resetUrl}">Restablecer Contraseña</a>
                <p>Si no solicitaste este correo, ignóralo.</p>
            `,
        };

        // Envía el correo
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Correo de restablecimiento enviado' });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

// Restablecer la contraseña
export async function resetPassword(req, res) {
    console.log("Funciona resetPassword");
    const { token, newPassword } = req.body;
    try {
        const [user] = await User.findByResetToken(token);
        if (user.length === 0 || user[0].resetPasswordExpiry < Date.now()) {
            return res.status(400).json({ message: 'Token inválido o expirado' });
        }

        const hashedPassword = await hash(newPassword, 12);
        await User.updatePassword(user[0].id, hashedPassword);

        res.status(200).json({ message: 'Contraseña restablecida con éxito' });
    } catch (err) {
        console.error('Error al restablecer la contraseña:', err);
        res.status(500).json({ error: err.message });
    }
}

export async function signup(req, res, next) {
    const errors = validationResult(req);
    
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    
    const user = await User.find(email);        
    if (user[0].length > 0) {
        return res.status(400).json({ message: 'El usuario con el email '+email+' ya existe' });
    } else if (!errors.isEmpty()) {
        return res.status(500).json({ error: errors });
    }

    try {
        const hashedPassword = await hash(password, 12);

        const userDetails = {
            name: name,
            email: email,
            password: hashedPassword,
        }

        const result = await User.save(userDetails);

        res.status(201).json({ message: 'User registered' })
    } catch (err) {
        if (!err.statusCode) {err.statusCode = 500;}
        next(err);
    }
}

export async function login(req, res, next) {
    const email = req.body.email;
    const password = req.body.password;

    try {
        const user = await User.find(email);

        if (user[0].length !== 1) {
            const error = new Error('A user with this email could not be found')
            error.statusCode = 401;
            throw error;
        }

        const storedUser = user[0][0];

        const isEqual = await compare(password, storedUser.password);

        if (!isEqual) {
            const error = new Error('Wrong password!');
            error.statusCode = 401;
            throw error;
        }

        const token = sign(
            {
                userId: storedUser.id,
                name: storedUser.name,
                email: storedUser.email,
                role: storedUser.role,
                phone: storedUser.phone,
                address: storedUser.address
            },
            'secretfortoken1205',
            { expiresIn: '1h' }
        );

        res.status(200).json({ token: token, userId: storedUser.id, role: storedUser.role })
    } catch (err) {
        if (!err.statusCode) {err.statusCode = 500;}
        next(err);
    }
}

export async function googleLogin(req, res, next) {
    const { token } = req.body;
    const decoded = decode(token);

    try {
        let user = await User.find(decoded.email);
        if (user[0].length === 0) {
            const newUser = {
                google_id: decoded.sub,
                name: decoded.name,
                email: decoded.email
            };
            await User.save(newUser);
            user = await User.find(decoded.email);
        }

        res.status(200).send(user[0][0]);
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

export async function updateProfile(req, res, next) {
    const { email, updatedProfile } = req.body;

    try {
        let [user] = await User.find(email);
        if (user.length === 0) {
            return res.status(400).json({ message: 'El usuario con el email ' + email + ' no se encontró' });
        }
        
        // await User.updateProfile(user[0].id, updatedProfile);

        if(updatedProfile.name) {
            await User.updateName(user[0].id, updatedProfile.name);
        }
        if(updatedProfile.phone) {
            await User.updatePhone(user[0].id, updatedProfile.phone);
        }
        if(updatedProfile.address) {
            await User.updateAddress(user[0].id, updatedProfile.address);
        }

        res.status(200).json({ message: "Perfil actualizado con éxito", email: user[0].email });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}





  