import express from 'express';
import { uploadSingle, handleUpload } from '../controllers/uploadController.js';

const router = express.Router();

router.post('/', uploadSingle, handleUpload);

export default router;
