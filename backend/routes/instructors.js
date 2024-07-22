import { Router } from 'express';
const router = Router();
import { getAllInstructors, addInstructor, deleteInstructor } from '../controllers/instructors.js';

// import express from 'express';
// const router = express.Router();

router.get('/', getAllInstructors);

router.post('/', addInstructor);

// router.put('/:id', instructorsController.upload);

router.delete('/:id', deleteInstructor);

export default router;
// export default router;
