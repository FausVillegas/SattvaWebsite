import db from '../util/database.js';

export default class User {
    constructor(id, name, email, password, role, phone, address, google_id){
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.phone = phone;
        this.address = address;
        this.google_id = google_id;
    }

    static updateProfile(userId, updatedProfile) {
        return db.execute(
            'UPDATE users SET name = ?, phone = ?, location = ?, address = ?, dni = ? WHERE id = ?',
            [updatedProfile.name, updatedProfile.phone, updatedProfile.location, updatedProfile.address, updatedProfile.dni, userId]
        );
    }

    static updateName(userId, name) {
        return db.execute(
            'UPDATE users SET name = ? WHERE id = ?',
            [name, userId]
        );
    }

    static updatePhone(userId, phone) {
        return db.execute(
            'UPDATE users SET phone = ? WHERE id = ?',
            [phone, userId]
        );
    }

    static updateAddress(userId, address) {
        return db.execute(
            'UPDATE users SET address = ? WHERE id = ?',
            [address, userId]
        );
    }
    
    static findById(id) {
        return db.execute('SELECT * FROM users WHERE id = ?',[id]);
    }

    static find(email){
        return db.execute('SELECT * FROM users WHERE email = ?', [email]);
    }

    static save(user) {
        if(!user.google_id) {
            return db.execute(
                'INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [user.name, user.email, user.password]
            );
        } else {
            return db.execute(
                'INSERT INTO users (name, email, password, google_id) VALUES (?, ?, ?, ?)', [user.name, user.email, Math.random().toString(36).substring(0, 50), user.google_id]
            );
        }
    }

    static saveResetToken(userId, resetToken, resetTokenExpiry) {
        return db.execute(
            'UPDATE users SET reset_password_token = ?, reset_password_expiry = ? WHERE id = ?',
            [resetToken, resetTokenExpiry, userId]
        );
    }

    static findByResetToken(token) {
        return db.execute(
            'SELECT * FROM users WHERE reset_password_token = ?', [token]
        );
    }

    static updatePassword(userId, password) {
        return db.execute(
            'UPDATE users SET password = ?, reset_password_token = NULL, reset_password_expiry = NULL WHERE id = ?',
            [password, userId]
        );
    }
};