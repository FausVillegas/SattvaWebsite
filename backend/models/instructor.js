import db from '../util/database.js';

export default class Instructor {
    constructor(first_name, last_name, email, dni, salary){
        this.first_name = first_name;
        this.last_name = last_name;
        this.email = email;
        this.dni = dni;
        this.salary = salary;
    }

    static fetchAll() {
        return db.execute('SELECT * FROM instructors');
    }

    static save(instructor) {
        return db.execute(
            'INSERT INTO instructors (first_name, last_name, email, dni, salary) VALUES (?, ?, ?, ?, ?)', 
            [instructor.firstName, instructor.lastName, instructor.email, instructor.dni, instructor.salary]
        );
    }

    static delete(id) {
        return db.execute('DELETE FROM instructors WHERE id = ?',[id]);
    }

    static findById(id) {
        return db.execute('SELECT * FROM instructors WHERE id = ?',[id]);
    }

    static update(instructorData, instructorId) {
        return db.execute('UPDATE instructors SET first_name = ?, last_name = ?, email = ?, dni = ?, salary = ? WHERE id = ?',[instructorData.first_name, instructorData.last_name, instructorData.email, instructorData.dni, instructorData.salary, instructorId]);
    }
};