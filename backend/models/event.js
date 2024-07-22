// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');

// const Event = sequelize.define('Event', {
//     title: {
//         type: DataTypes.STRING,
//         allowNull: false
//     },
//     description: {
//         type: DataTypes.STRING,
//         allowNull: false
//     },
//     imageUrl: {
//         type: DataTypes.STRING,
//         allowNull: false
//     },
//     datetime: {
//         type: DataTypes.DATE,
//         allowNull: false
//     }
// }, {
//     timestamps: false
// });

// module.exports = Event;

import db from '../util/database.js';

export default class SattvaEvent {
    constructor(title, description, instructor_id, imageUrl, dateTime, price){
        this.title = title;
        this.description = description;
        this.instructor_id = instructor_id;
        this.imageUrl = imageUrl;
        this.dateTime = dateTime;
        this.price = price;
    }

    static fetchAll() {
        return db.execute('SELECT * FROM events');
    }

    static save(eventData) {
        return db.execute(
            'INSERT INTO events (title, description, imageUrl, instructor_id, event_datetime, price) VALUES (?, ?, ?, ?, ?, ?)', 
            [eventData.title, eventData.description, eventData.imageUrl, eventData.instructor_id, eventData.dateTime, eventData.price]
        );
    }

    static delete(id) {
        return db.execute('DELETE FROM events WHERE id = ?',[id]);
    }

    static findById(id) {
        return db.execute('SELECT * FROM events WHERE id = ?',[id]);
    }

    static updateClass(classData) {
        return db.execute('SELECT * FROM events WHERE id = ?',[id]);
    }

    static registerForEvent(eventId, userId) {
        return db.execute('INSERT INTO EventRegistrations (event_id, user_id) VALUES (?, ?)', [eventId, userId]);
    }
};
