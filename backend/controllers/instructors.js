import fs from 'fs';
import path from 'path';
import { validationResult } from 'express-validator';
import Instructor from '../models/instructor.js';

export async function getAllInstructors(req, res, next) {
  try {
    const [allInstructor] = await Instructor.fetchAll();
    // console.log(allInstructor);
    res.status(200).json(allInstructor);
  } catch (err) {
    if (!err.statusCode) {err.statusCode = 500;}
    next(err);
}
}

export async function addInstructor(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return console.error("Error "+errors);
    }

    console.log(req.body);
    const { firstName, lastName, email, dni, salary } = req.body;
    // const { first_name, last_name, email, dni, salary } = req.body;

    try {
        const newInstructor = {
            firstName: firstName, 
            lastName: lastName, 
            email: email, 
            dni: dni, 
            salary: salary
        }
        console.log(newInstructor);

        const result = await Instructor.save(newInstructor);

        res.status(201).json({ message: 'The instructor was added', class: newInstructor })
    } catch (err) {
        if (!err.statusCode) {err.statusCode = 500;}
        console.log("Error creating instructor: "+err);
        next(err);
    }
}

export async function deleteInstructor(req, res, next) {
    try {
        const instructorId = req.params.id;
        const [instructorData] = await Instructor.findById(instructorId);
        if (instructorData.length === 0) {
            throw new Error(`No se encontró ningún instructor con el id ${instructorId}`);
        }

        console.log("Borrando instructor "+instructorId)
        const deleteResponse = await Instructor.delete(instructorId);

        res.status(200).json(deleteResponse);
    } catch (err) {
        if (!err.statusCode) {err.statusCode = 500;}
        console.error(err);
        next(err);
    }
}

export async function updateInstructor (req, res) {
    const instructorId = req.body.id;
    const updatedData = req.body;
    console.log("Actualizando datos ins "+instructorId);
    console.log("Datos "+updatedData.first_name);
    try {
      await Instructor.update(updatedData, instructorId);
      res.status(200).json({ message: 'Instructor actualizado correctamente' });
    } catch (error) {
        if (!error.statusCode) {error.statusCode = 500;}
        console.error(error);
      res.status(500).json({ error: 'Error al actualizar el instructor' });
    }
  };
