import { Router } from 'express';
import documentRoutes from './document';

const router = Router();

router.use('/', documentRoutes);

export default router;
