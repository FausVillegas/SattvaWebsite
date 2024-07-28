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

    static update(eventData, eventId) {
        return db.execute('UPDATE events SET title = ?, event_datetime = ?, description = ?, price = ?, instructor_id = ?, imageUrl = ? WHERE id = ?',[eventData.title, eventData.event_datetime, eventData.description, eventData.price, eventData.instructor_id, eventData.imageUrl, eventId]);
    }

    static registerForEvent(eventId, userId) {
        return db.execute('INSERT INTO EventRegistrations (event_id, user_id) VALUES (?, ?)', [eventId, userId]);
    }

    static async isUserEnrolled(eventId, userId) {
        const [rows] = await db.execute('SELECT 1 FROM EventRegistrations WHERE event_id = ? AND user_id = ?', [eventId, userId]);
        return rows.length > 0;
    }    
};
