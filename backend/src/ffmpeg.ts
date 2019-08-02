import { EventEmitter } from "events";
import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import config from "./config";
import chalk from "chalk";

// import { expose } from 'threads/worker';
// import ffmpeg from 'fluent-ffmpeg';
// import { exec } from 'child_process';

let currentFfmpeg: null | ChildProcessWithoutNullStreams = null;

// Global Events
export const ffmpegEvent = new EventEmitter();

ffmpegEvent.on('start', ({ width = config.get('video.width'), height = config.get('video.height'), framerate = config.get('video.framerate') }) => {
  if (currentFfmpeg !== null) {
    currentFfmpeg.kill();
  }

  console.log(chalk.cyan(`Restarting ffmpeg. ${width}x${height} ${framerate}FPS`));

  currentFfmpeg = spawn('ffmpeg', `-f v4l2 -video_size ${width}x${height} -i /dev/video0 -f mpegts -codec:v mpeg1video -s ${width}x${height} -b:v 400k -r ${framerate} http://localhost:${config.get('streamPort')}/${config.get('secret')}`.split(' '));

  // currentFfmpeg = spawn('ffmpeg', `-f v4l2 -framerate ${framerate} -video_size ${width}x${height} -i /dev/video0 -f mpegts -codec:v mpeg1video -s ${width}x${height} -b:v 1000k -bf 0 http://localhost:${config.get('streamPort')}/${config.get('secret')}`.split(' '));

  currentFfmpeg.on('error', error => {
    console.error(chalk.redBright(`FFMPEG ERROR: ${error}`))
  });

  let scriptOutput = '';
  currentFfmpeg.stderr.setEncoding('utf8');
  currentFfmpeg.stderr.on('data', function(data) {
    //Here is where the error output goes

    // console.log('stderr: ' + data);

    scriptOutput += data.toString();
  });

  currentFfmpeg.on('exit', error => {
    console.error('ERRROR:')
    console.error(scriptOutput);
    if (error === 1) {
      return console.error(chalk.redBright('FFMPEG ERRORED'));
    }
    return console.log(chalk.cyan('FFMPEG exited'));
  });
});

// // const ffmpegStream = () => {
// //   ffmpeg('/dev/video0')
// //     .format('v4l2')
// //       .inputFPS(25)
// //       .size('640x480')
// //     .output('http://localhost:8081/supersecret')
// //       .outputOption('mpegts')
// //       .videoCodec('mpeg1video')
// //       .size('640x480')
// //       .videoBitrate('1000k')
// //       .outputOption('-bf 0');
// // }

// export type FFMPEGStreamOptions = {
//   framerate?: number;
//   width?: number;
//   height?: number;
// }

// const ffmpegStream = ({ framerate = 25, width = 640, height = 480 }: FFMPEGStreamOptions) => {
//   exec(`
//     ffmpeg \
//     -f v4l2 \
//       -framerate 25 -video_size 640x480 -i /dev/video0 \
//     -f mpegts \
//       -codec:v mpeg1video -s 640x480 -b:v 1000k -bf 0 \
//     http://localhost:8081/supersecret
//   `);
// }

// expose(ffmpegStream);

// // # no audio
// // ffmpeg \
// // 	-f v4l2 \
// // 		-framerate 25 -video_size 640x480 -i /dev/video0 \
// // 	-f mpegts \
// // 		-codec:v mpeg1video -s 640x480 -b:v 1000k -bf 0 \
// // 	http://localhost:8081/supersecret

// // # audio
// // ffmpeg \
// // 	-f v4l2 \
// // 		-framerate 25 -video_size 640x480 -i /dev/video0 \
// // 	-f alsa \
// // 		-ar 44100 -c 2 -i hw:0 \
// // 	-f mpegts \
// // 		-codec:v mpeg1video -s 640x480 -b:v 1000k -bf 0 \
// // 		-codec:a mp2 -b:a 128k \
// // 		-muxdelay 0.001 \
// // 	http://localhost:8081/supersecret