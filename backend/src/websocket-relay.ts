// Use the websocket-relay to serve a raw MPEG-TS over WebSockets. You can use
// ffmpeg to feed the relay. ffmpeg -> websocket-relay -> browser
// Example:
// node websocket-relay yoursecret 8081 8082
// ffmpeg -i <some input> -f mpegts http://localhost:8081/yoursecret

import * as fs from 'fs';
import http from 'http';
import WebSocket from 'ws';
import chalk from 'chalk';

export type WebSocketRelayOptions = {
  secret: string;
  streamPort: number;
  websocketPort: number;
}

// TODO: recording
// declare namespace Http {
//   export class Socket {
//     recording: undefined | fs.WriteStream;
//   }

//   export class IncomingMessage {
//     socket: Socket;
//   }
// }

export const createWebSocketRelay = (options: WebSocketRelayOptions) => {
  // Global values
  let connectionCount = 0;
  
  const socketServer = new WebSocket.Server({ port: options.websocketPort, perMessageDeflate: false });
  
  // TODO: colors
  socketServer.on('connection', (socket, upgradeReq) => {
    connectionCount++;
    console.log(`New WebSocket Connection: ${upgradeReq.socket.remoteAddress} ${upgradeReq.headers['user-agent']}`);
    socket.on('close', (code, message) => {
      console.log(`Disconnected WebSocket (${connectionCount} total)`);
    });
  });

  // TODO: better type
  const broadcast = (data: any) => {
    socketServer.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    })
  }

  // TODO: integrate with express (will it be slower?) (make it an option to use express)
  const server = http.createServer((req, res) => {
    if (req.url === undefined) {
      console.log(chalk.red('Failed Stream Connection no secret provided.'));
      res.end();
    } else {
      const params = req.url.substr(1).split('/');

      if (params[0] !== options.secret) {
        console.log(chalk.red(`Failed Stream Connection ${req.socket.remoteAddress}:${req.socket.remotePort} - wrong secret.`));
        res.end();
      }
    }

    req.connection.setTimeout(0);
    console.log(`${chalk.cyan('Steam Connect:')} ${req.socket.remoteAddress}:${req.socket.remotePort}`);
    req.on('data', (data) => {
      broadcast(data);
      // TODO: recording to local file
      // if (!!req.socket.recording) {
      //   req.socket.recording.write(data);
      // }
    });
    req.on('end',function(){
      console.log('Close.');
      // if (req.socket.recording) {
      //   req.socket.recording.close();
      // }
    });

    // Record the stream to a local file?
    // if (RECORD_STREAM) {
    //   const path = 'recordings/' + Date.now() + '.ts';
    //   request.socket.recording = fs.createWriteStream(path);
    // }

  }).listen(options.streamPort);

  console.log(chalk.cyan(`Listening for incomming MPEG-TS Stream on http://127.0.0.1:${options.streamPort}/<secret>`));
  console.log(chalk.cyan(`Awaiting WebSocket connections on ws://127.0.0.1:${options.websocketPort}/`));

  return server;
}