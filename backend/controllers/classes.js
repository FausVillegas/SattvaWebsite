const db = require('../config/database');
const fs = require('fs')
const SattvaClass = require('../models/class');
const path = require('path');
const { validationResult } = require('express-validator');

exports.getAllClasses = async (req, res, next) => {
  try {
    const [allClasses] = await SattvaClass.fetchAll();
    res.status(200).json(allClasses);
  } catch (err) {
    if (!err.statusCode) {err.statusCode = 500;}
    next(err);
}
};

exports.addClass = async (req, res, next) => {
  const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return console.error("Error "+errors);
    }

    const { title, description, instructor_id, monthlyFee } = req.body;
    const imageUrl = req.file.path;

    try {
        const newClass = {
            title: title, 
            description: description,
            instructor_id: instructor_id,
            monthlyFee: monthlyFee,
            imageUrl: imageUrl
        }

        const result = await SattvaClass.save(newClass);

        res.status(201).json({ message: 'The class was added', class: newClass })
    } catch (err) {
        if (!err.statusCode) {err.statusCode = 500;}
        next(err);
    }
};

// exports.addClass = (req, res) => {
//   const { title, description, instructor_id } = req.body;
//   const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
  
//   if (!title || !description || !imageUrl || !instructor_id) {
//       return res.status(400).json({ error: 'All fields are required' });
//   }
  
//   SattvaClass.save();

//   const query = 'INSERT INTO Classes (title, description, imageUrl, instructor_id) VALUES (?, ?, ?, ?)';
//   db.query(query, [title, description, imageUrl, instructor_id], (err, results) => {
//       if (err) {
//           return res.status(500).json({ error: err.message });
//       }
//       res.status(201).json({ message: 'Class added successfully', classId: results.insertId });
//   });
// };

// exports.deleteClass = (req, res) => {
//   const { id } = req.params;
//   const sql = 'DELETE FROM Classes WHERE id = ?';
//   db.query(sql, id, (err) => {
//     if (err) throw err;
//     res.status(204).send();
//   });
// };

exports.deleteClass = async (req, res, next) => {
  console.log("Borrando clase "+req.params.id)
    try {
        const [classData] = await SattvaClass.findById(req.params.id);
        
        if (classData.length === 0) {
            throw new Error(`No se encontró ningúna clase con el id ${req.params.id}`);
        }
        
        const { id: classId, imageUrl } = classData[0];

        if (fs.existsSync(imageUrl)) {
            fs.unlinkSync(imageUrl);
        }

        const deleteResponse = await SattvaClass.delete(classId);

        res.status(200).json(deleteResponse);
    } catch (err) {
        if (!err.statusCode) {err.statusCode = 500;}
        next(err);
    }
};