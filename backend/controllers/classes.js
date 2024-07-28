import { existsSync, unlinkSync } from 'fs';
import SattvaClass from '../models/class.js';
import path from 'path';
import { validationResult } from 'express-validator';
import fs from 'fs';

export async function getAllClasses(req, res, next) {
  try {
    const [allClasses] = await SattvaClass.fetchAll();
    res.status(200).json(allClasses);
  } catch (err) {
    if (!err.statusCode) {err.statusCode = 500;}
    next(err);
}
}


export async function addClass(req, res, next) {
  const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return console.error("Error "+errors);
    }

    const { title, description, instructor_id, monthlyFee, schedules } = req.body;
    
    let imageUrl = null;
    if(req.file)
        imageUrl = req.file.path;

    try {
        const newClass = {
            title: title, 
            description: description,
            instructor_id: instructor_id,
            monthlyFee: monthlyFee,
            imageUrl: imageUrl
        }

        const [result] = await SattvaClass.save(newClass);
        const classId = result.insertId;

        // Inserta los horarios y la relación con la clase
        const schedulesArray = JSON.parse(schedules);

        for (let schedule of schedulesArray) {
            const [scheduleResult] = await SattvaClass.saveSchedule(schedule);
            const scheduleId = scheduleResult.insertId;
            await SattvaClass.saveClassSchedule(classId, scheduleId);
        }

        res.status(201).json({ message: 'The class was added', class: newClass })
    } catch (err) {
        if (!err.statusCode) {err.statusCode = 500;}
        if (existsSync(imageUrl)) {
            unlinkSync(imageUrl);
        }
        next(err);
    }
}


export async function deleteClass(req, res, next) {
  console.log("Borrando clase "+req.params.id)
    try {
        const [classData] = await SattvaClass.findById(req.params.id);
        
        if (classData.length === 0) {
            throw new Error(`No se encontró ningúna clase con el id ${req.params.id}`);
        }
        
        const { id: classId, imageUrl } = classData[0];

        if (existsSync(imageUrl)) {
            unlinkSync(imageUrl);
        }

        const deleteResponse = await SattvaClass.delete(classId);

        res.status(200).json(deleteResponse);
    } catch (err) {
        if (!err.statusCode) {err.statusCode = 500;}
        next(err);
    }
}

export async function getClassById(req, res) {
      try {
          const [CD] = await SattvaClass.findById(req.params.id);
          const CS = await SattvaClass.findClassSchedules(req.params.id);
          const classSchedules = CS[0];
          
          if (CD.length === 0) {
              throw new Error(`No se encontró ningúna clase con el id ${req.params.id}`);
          }
          const classData = CD[0];
          const data = {classData,classSchedules};
          res.status(200).json(data);
      } catch (err) {
          if (!err.statusCode) {err.statusCode = 500;}
          console.error(err);
          next(err);
      }
  }

  export async function updateClass(req, res) {
    const classId = req.body.id;
    const updatedData = req.body;
    let imageUrl = req.file ? req.file.path : null;
    // console.log("Actualizando datos class "+classId + " " +updatedData.title, updatedData.description, updatedData.monthly_fee, updatedData.instructor_id);
    try {
      const [classData] = await SattvaClass.findById(classId); // Método hipotético para obtener la clase por ID
      const oldImageUrl = classData[0].imageUrl;
  
      // Actualiza los datos de la clase
      updatedData.imageUrl = imageUrl || oldImageUrl;

      await SattvaClass.update(updatedData, classId);
      // console.log("SCHEDULES ------------"+updatedData.schedules);
    //   await SattvaClass.updateSchedules(updatedData.schedules, classId);

        // Elimina la imagen antigua si hay una nueva imagen
        if (imageUrl && oldImageUrl) {
          fs.unlink(oldImageUrl, (err) => {
            if (err) console.error(`Error deleting old image: ${err}`);
          });
        }

        console.log("IIIDDD"+classId);
        const [existingSchedules] = await SattvaClass.findClassSchedules(classId);
        const newSchedules = updatedData.schedules;

        function areSchedulesEqual(schedule1, schedule2) {
            return schedule1.day_of_week === schedule2.day_of_week && schedule1.time === schedule2.time;
          }
          
          const schedulesToDelete = existingSchedules.filter(existingSchedule =>
            !newSchedules.some(newSchedule => areSchedulesEqual(newSchedule, existingSchedule))
          );
          
          const schedulesToAdd = newSchedules.filter(newSchedule =>
            !existingSchedules.some(existingSchedule => areSchedulesEqual(newSchedule, existingSchedule))
          );
        
        for (const schedule of schedulesToDelete) {
            console.log("Borrando schedule: "+schedule.id);
            await SattvaClass.deleteSchedule(schedule.id);
        }

        for (const schedule of schedulesToAdd) {
            const [result] = await SattvaClass.saveSchedule(schedule);
            const scheduleId = result.insertId;
            console.log("Guardando schedule: "+scheduleId+" "+schedule.day_of_week+schedule.time);
            await SattvaClass.saveClassSchedule(classId,scheduleId);    
        }

      res.status(200).json({ message: 'Clase actualizada correctamente' });
    } catch (error) {
        if (!error.statusCode) {error.statusCode = 500;}
        console.error(error);
      res.status(500).json({ error: 'Error al actualizar la clase' });
    }
}
 