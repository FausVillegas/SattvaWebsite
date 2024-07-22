import db from '../util/database.js';

export default class Instructor {
    constructor(firstName, lastName, email, dni, salary){
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.dni = dni;
        this.salary = salary;
    }

    static fetchAll() {
        return db.execute('SELECT * FROM instructors');
    }

    static save(instructor) {
        return db.execute(
            'INSERT INTO instructors (first_name, last_name, email, dni, salary) VALUES (?, ?, ?, ?, ?, ?)', 
            [instructor.firstName, instructor.lastName, instructor.email, instructor.dni, instructor.salary]
        );
    }

    static delete(id) {
        return db.execute('DELETE FROM instructors WHERE id = ?',[id]);
    }

    static findById(id) {
        return db.execute('SELECT * FROM instructors WHERE id = ?',[id]);
    }

    static updateInstructor(instructorData) {
        return db.execute('SELECT * FROM instructors WHERE id = ?',[id]);
    }
};