import { Router } from 'express';
import { uploadDocument, getDocuments, deleteDocument } from '../controllers/document.controller';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

/**
 * @swagger
 * /documents:
 *   post:
 *     summary: Upload a document
 *     tags: [Documents]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, format: binary }
 *               title: { type: string }
 *               description: { type: string }
 *               organization_id: { type: string }
 *               document_type: { type: string, enum: [requirement, minutes, report, other] }
 *     responses:
 *       201: { description: Document uploaded }
 */
router.post('/', authenticate, upload.single('file'), uploadDocument);
router.get('/', authenticate, getDocuments);

/**
 * @swagger
 * /documents/{id}:
 *   delete:
 *     summary: Delete a document
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Deleted }
 */
router.delete('/:id', authenticate, deleteDocument);

export default router;
