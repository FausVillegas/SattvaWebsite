import db from '../util/database.js';

export default class SattvaClass {
    constructor(title, description, instructor_id, imageUrl, monthlyFee){
        this.title = title;
        this.description = description;s
        this.instructor_id = instructor_id;
        this.imageUrl = imageUrl;
        this.monthlyFee = monthlyFee;
    }

    static fetchAll() {
        return db.execute('SELECT * FROM classes');
    }

    static save(classData) {
        return db.execute(
            'INSERT INTO classes (title, description, imageUrl, instructor_id, monthly_fee) VALUES (?, ?, ?, ?, ?)', 
            [classData.title, classData.description, classData.imageUrl, classData.instructor_id, classData.monthlyFee]
        );
    }

    static delete(id) {
        return db.execute('DELETE FROM classes WHERE id = ?',[id]);
    }

    static findById(id) {
        return db.execute('SELECT * FROM classes WHERE id = ?',[id]);
    }

    static update(classData, classId) {
        return db.execute('UPDATE classes SET title = ?, description = ?, monthly_fee = ?, instructor_id = ?, imageUrl = ? WHERE id = ?',[classData.title, classData.description, classData.monthly_fee, classData.instructor_id, classData.imageUrl, classId]);
    }

    static updateSchedule(schedule) {
        return db.execute('UPDATE schedules SET day_of_week = ?, time = ? WHERE id = ?',[schedule.day_of_week, schedule.time, schedule.id]);
    }

    static saveSchedule(schedule) {
        return db.execute('INSERT INTO Schedules (day_of_week, time) VALUES (?, ?)', [schedule.day_of_week, schedule.time]);
    }

    static deleteSchedule(id) {
        return db.execute('DELETE FROM schedules WHERE id = ?',[id]);
    }

    static saveClassSchedule(classId, scheduleId) {
        return db.execute('INSERT INTO ClassSchedule (class_id, schedule_id) VALUES (?, ?)', [classId, scheduleId]);
    }

    static findClassSchedules(classId) {
        return db.execute('SELECT s.id, s.day_of_week, s.time FROM classschedule cs JOIN schedules s ON cs.schedule_id = s.id WHERE cs.class_id = ?', [classId]);
    }

    static registerForClass(classId, userId) {
        return db.execute('INSERT INTO FeePayments (user_id, class_id) VALUES (?, ?)', [userId, classId]);
    }

    static async isUserEnrolled(classId, userId) {
        const [rows] = await db.execute('SELECT 1 FROM Enrollment WHERE class_id = ? AND user_id = ? AND payment_status = 1', [classId, userId]);
        return rows.length > 0;
    }    
};