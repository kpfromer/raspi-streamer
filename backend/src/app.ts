import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import config from './config';
import { createWebSocketRelay } from './websocket-relay';
import api from './api';
import { spawn } from 'child_process';
import { createOtherRely } from './motion-sensor';
import { ffmpegEvent } from './ffmpeg';

// Express on main thread
const app = express();

app.use(bodyParser.json());

// Routes
// React static files
app.use(express.static(path.join(__dirname, 'react')))
// API
// Start motion sensor on gpio port 21
app.use('/api', api());
// React app gets everything else!
app.use('*', (req, res) => res.sendFile(path.join(__dirname, 'react', 'index.html')));

const webSocketServer = createWebSocketRelay({ secret: config.get('secret'), streamPort: config.get('streamPort'), websocketPort: config.get('websocketPort') });

app.listen(config.get('port'), () => {
  console.log(`Listening on port ${config.get('port')}`);
});

// wait for websocket to listen for ffmpeg
webSocketServer.on('listening', () => {
  console.log('started')
  // run ffmpeg
  // TODO: stream stout
  ffmpegEvent.emit('start', {});
  
  // // use child.stdout.setEncoding('utf8'); if you want text chunks
  // child.stdout.on('data', (chunk) => {
  //   // data from standard output is here as buffers
  // });

  // // since these are streams, you can pipe them elsewhere
  // child.stderr.pipe(dest);


  // ffmpeg.on('close', code => {
  //   console.log(`child process exited with code ${code}`);
  // });
});

createOtherRely({ websocketPort: config.get('dataWebSocketPort'), gpioPort: 21 });