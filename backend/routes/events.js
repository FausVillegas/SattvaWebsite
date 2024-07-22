import { Router } from 'express';
const router = Router();
import { getAllEvents, addEvent, deleteEvent, registerForEvent } from '../controllers/events.js';
import upload from '../middleware/upload.js';
// import express from 'express';
// const router = express.Router();

router.get('/', getAllEvents);

router.post('/', upload('imageUrl'), addEvent);

// router.put('/:id', eventsController.updateEvent);

router.delete('/:id', deleteEvent);

router.post('/:eventId/register', registerForEvent);

// router.post('/:eventId/register-pay', registerAndPay);

export default router;

// export default router;
