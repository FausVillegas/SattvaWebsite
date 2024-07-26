import { Router } from 'express';
const router = Router();
import { getAllInstructors, addInstructor, deleteInstructor, updateInstructor } from '../controllers/instructors.js';

router.get('/', getAllInstructors);

router.post('/', addInstructor);

router.put('/', updateInstructor);

router.delete('/:id', deleteInstructor);

export default router;
