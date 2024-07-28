import { Router } from 'express';
const router = Router();
import { getAllClasses, addClass, deleteClass, getClassById, updateClass } from '../controllers/classes.js';
import upload from '../middleware/upload.js';

router.get('/', getAllClasses);

router.get('/:id', getClassById);

router.post('/', upload('imageUrl'), addClass);

router.delete('/:id', deleteClass);

router.put('/:id', upload('imageUrl'), updateClass);

export default router;