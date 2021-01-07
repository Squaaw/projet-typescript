import { Router } from 'express';
import { SongController } from '../controller/SongController';
import { getSongsMidd, getSongByIdMidd } from '../middlewares/song.middleware';

const route: Router = Router();

// Get all songs
route.get('/', getSongsMidd, SongController.getSongs);

// Get a song data by id
route.get('/:id', getSongByIdMidd, SongController.getSongById);

export { route as SongRoute }