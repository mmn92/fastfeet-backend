import { Router } from 'express';
import multer from 'multer';

import multerconfig from './config/multer';
import authMiddleware from './app/middlewares/auth';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import FileController from './app/controllers/FileController';
import CourierController from './app/controllers/CourierController';
import DeliveryController from './app/controllers/DeliveryController';
import DashboardController from './app/controllers/DashboardController';
import DeliveryProblemController from './app/controllers/DeliveryProblemController';

const routes = Router();
const upload = multer(multerconfig);

routes.post('/sessions', SessionController.store);

routes.get('/couriers/:id/deliveries', DashboardController.indexPending);
routes.get(
  '/couriers/:id/completeDeliveries',
  DashboardController.indexComplete
);
routes.put('/couriers/:id/delivery/:did', DashboardController.update);
routes.post('/deliveries/:id/problems', DeliveryProblemController.store);

routes.use(authMiddleware);

routes.get('/deliveries/problems', DeliveryProblemController.index);
routes.get('/deliveries/:id/problems', DeliveryProblemController.show);
routes.post('/problems/:id/cancel', DeliveryProblemController.delete);

routes.get('/recipients', RecipientController.index);
routes.get('/recipients/:id', RecipientController.show);
routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);

routes.get('/users', UserController.index);
routes.post('/users', UserController.store);

routes.post('/files', upload.single('file'), FileController.store);

routes.get('/couriers', CourierController.index);
routes.post('/couriers', CourierController.store);
routes.put('/couriers/:id', CourierController.update);
routes.delete('/couriers/:id', CourierController.delete);

routes.get('/deliveries', DeliveryController.index);
routes.post('/deliveries', DeliveryController.store);
routes.put('/deliveries/:id', DeliveryController.update);
routes.delete('/deliveries/:id', DeliveryController.delete);

export default routes;
