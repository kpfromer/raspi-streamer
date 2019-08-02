import express from 'express';
import chalk from 'chalk';
import { ffmpegEvent } from './ffmpeg';

export default () => {  
  const router = express.Router();

  router.post('/', (req, res) => {
    // TODO: validate body (joi middleware?)
    ffmpegEvent.emit('start', req.body);
    res.json({
      success: true,
      message: 'Updated'
    });
  });
  return router;
}
