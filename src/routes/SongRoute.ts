import { Router } from 'express';
import { SongController } from '../controller/SongController';
import { getSongsMidd } from '../middlewares/song.middleware';

const route: Router = Router();

// Get all songs
route.get('/', getSongsMidd, SongController.getSongs);

// route.get('/songs/:id')
// route.get('/songs/{id}')

export { route as SongRoute }