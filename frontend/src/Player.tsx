import React, { Component, createRef } from 'react';
import JSMpeg, { Player as JSMpegPlayer } from 'jsmpeg-player';

export type PlayerProps = {
  url: string;
  play?: boolean;
  volume?: number;
  // The rest use the default values from jsmpeg
  // loop?: boolean;
  // autoplay?: boolean;
  // audio?: boolean;
  // video?: boolean;
  // onVideoDecode?: () => any; // TODO: onVideoDecode(decoder, time) 
  // onAudioDecode?: () => any; // TODO: onAudioDecode(decoder, time)
  // onPlay?: () => any;
  // onPause?: () => any;
  // onEnded?: () => any;
  // onStalled?: () => any;
}

export default class Player extends Component<PlayerProps> {
  static defaultProps = {
    play: true,
    volume: 1
  }

  private canvas = createRef<HTMLCanvasElement>();
  private player: null | JSMpegPlayer = null;

  componentDidUpdate(prevProps: PlayerProps) {
    if (prevProps.play! && !this.props.play!) {
      this.player!.pause();
    }
    if (!prevProps.play! && this.props.play!) {
      this.player!.play();
    }
  }

  componentWillUnmount() {
    this.player!.destroy();
  }

  componentDidMount() {
    if (!!this.canvas.current) {
      // JSMpeg comes from bundled js file in public/index.html
      // TODO: add typings for jsmpeg
      this.player = new JSMpeg.Player(this.props.url, { canvas: this.canvas.current, autoplay: this.props.play! });
    }
  }

  render() {
    return (
      <div style={{
        height: '100vh'
      }}>
        {/* <div style="width: 100%; height: 100%;" class="jsmpeg" data-url="file.ts"></div> */}
        <canvas style={{
          objectFit: 'contain'
          // maxHeight: '100%',
          // maxWidth: '100%',
          // height: 'auto',
          // width: 'auto'
        }} ref={this.canvas} />
      </div>
    );
  }
}