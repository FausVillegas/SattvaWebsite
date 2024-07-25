import { Router } from 'express';
const router = Router();
import { getAllEvents, addEvent, deleteEvent, updateEvent, getEventById } from '../controllers/events.js';
import upload from '../middleware/upload.js';
// import express from 'express';
// const router = express.Router();

router.get('/', getAllEvents);

router.get('/:id', getEventById);

router.post('/', upload('imageUrl'), addEvent);

router.delete('/:id', deleteEvent);

router.put('/:id', updateEvent);

export default router;

// export default router;
