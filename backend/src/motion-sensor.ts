import { Gpio } from 'onoff';
import WebSocket from 'ws';
import chalk from 'chalk';

type StopWatch = () => void;

export const watchSensor = (gpioPort: number, cb: (error: null | Error, motion: boolean) => any): StopWatch => {
  const sensor = new Gpio(gpioPort, 'in', 'both');

  const watchFn = (error: Error | null | undefined, value: 0 | 1) => {
    if (error === undefined) {
      error = null;
    }
    return cb(error, value === 1);
  }

  // Initial Watch Value
  watchFn(null, sensor.readSync());

  // Start watching
  sensor.watch(watchFn);

  return () => sensor.unwatch(watchFn);
}


export const createOtherRely = (options: { websocketPort: number, gpioPort: number }) => {
  // Global values
  let connectionCount = 0;
  
  const socketServer = new WebSocket.Server({ port: options.websocketPort, perMessageDeflate: false });
  
  // TODO: colors
  socketServer.on('connection', (socket, upgradeReq) => {
    connectionCount++;
    // console.log(`New WebSocket Connection: ${upgradeReq.socket.remoteAddress} ${upgradeReq.headers['user-agent']}`);
    socket.on('close', (code, message) => {
      // console.log(`Disconnected WebSocket (${connectionCount} total)`);
    });
  });

  // TODO: better type
  const broadcast = (data: any) => {
    socketServer.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    })
  }

  const stopWatch = watchSensor(options.gpioPort, (error, motion) => {
    if (error) throw error;
    broadcast({ motion });
  });

  process.on('exit', stopWatch);

  console.log(chalk.cyan(`Awaiting Other WebSocket connections on ws://127.0.0.1:${options.websocketPort}/`));
}
// process.on('exit', () => {
//   sensor.unwatchAll();
// });

// https://stackoverflow.com/questions/29964220/node-js-onoff-not-picking-up-gpio-correctly
// https://www.hobbytronics.co.uk/image/data/tutorial/raspberry-pi/gpio-pinout-bplus.jpg