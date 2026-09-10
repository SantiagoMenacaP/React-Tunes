import React, { useEffect, useRef } from 'react';

interface AudioHandlerProps {
  onAudioReady: (audio: HTMLAudioElement) => void;
}

export const AudioHandler: React.FC<AudioHandlerProps> = ({ onAudioReady }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (audioRef.current && !initialized.current) {
      initialized.current = true;
      
      const audio = audioRef.current;
      audio.setAttribute('playsinline', 'true');
      audio.setAttribute('webkit-playsinline', 'true');
      audio.setAttribute('x-webkit-airplay', 'allow');
      
      onAudioReady(audio);
    }
  }, [onAudioReady]);

  return (
    <audio
      ref={audioRef}
      playsInline
      preload="auto"
      style={{ display: 'none' }}
    />
  );
};
