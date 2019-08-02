import convict from 'convict';

const config = convict({
  port: {
    doc: 'The port for the server',
    env: 'PORT',
    format: 'port',
    default: 3000
  },
  secret: {
    doc: 'The secret to the server stream',
    env: 'SECRET',
    format: String,
    default: 'supersecret'
  },
  streamPort: {
    doc: 'The port that the mpegts ffmpeg streams to.',
    env: 'STREAM_PORT',
    format: 'port',
    default: 8081
  },
  websocketPort: {
    doc: 'The port that the websocket streams mpeg data to.',
    env: 'WEBSOCKET_PORT',
    format: 'port',
    default: 8082
  },
  dataWebSocketPort: {
    format: 'port',
    default: 8083
  },
  video: {
    height: {
      doc: 'The default height in pixels of the webcam video (can be changed will running).',
      env: 'DEFAULT_HEIGHT',
      format: Number,
      default: 480
    },
    width: {
      doc: 'The default width in pixels of the webcam video (can be changed will running).',
      env: 'DEFAULT_WIDTH',
      format: Number,
      default: 640
    },
    framerate: {
      doc: 'The default framerate (FPS) of the webcam video (can be changed will running).',
      env: 'DEFAULT_FPS',
      format: Number,
      default: 25
    }
  }
})

export default config;