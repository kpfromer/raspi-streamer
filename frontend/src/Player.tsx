import React, { useRef, useEffect } from 'react';
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

// TODO: update to use volume
export default ({ url, volume = 1, play = true }: PlayerProps) => {

  const canvas = useRef<HTMLCanvasElement>(null);
  const player = useRef<null | JSMpegPlayer>(null);
  
  useEffect(() => {
    if (canvas.current !== null) {
      player.current = new JSMpeg.Player(url, { canvas: canvas.current, autoplay: play });
    }

    return () => {
      if (player.current !== null) {
        player.current.destroy();
      }
    }
  }, [url]);

  useEffect(() => {
    if (player.current !== null) {
      if (play) {
        player.current.play();
      } else {
        player.current.pause();
      }
    }
  }, [play]);

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
      }} ref={canvas} />
    </div>
  );
}