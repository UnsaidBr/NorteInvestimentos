import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw } from 'lucide-react';

interface LessonAudioPlayerProps {
  title: string;
  intro: string;
  sections: { heading: string; text: string }[];
  summary: string;
}

export const LessonAudioPlayer: React.FC<LessonAudioPlayerProps> = ({
  title,
  intro,
  sections,
  summary,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const fullTextToRead = useMemoText(title, intro, sections, summary);

  const handleTogglePlay = () => {
    if (!synthRef.current || !isSupported) return;

    if (isPlaying) {
      synthRef.current.pause();
      setIsPlaying(false);
    } else {
      if (synthRef.current.paused) {
        synthRef.current.resume();
        setIsPlaying(true);
      } else {
        synthRef.current.cancel();

        const utterance = new SpeechSynthesisUtterance(fullTextToRead);
        utterance.lang = 'pt-BR';
        utterance.rate = 1.05; // ritmo natural e agradável
        utterance.pitch = 1.0;

        utterance.onend = () => {
          setIsPlaying(false);
        };

        utterance.onerror = () => {
          setIsPlaying(false);
        };

        utteranceRef.current = utterance;
        synthRef.current.speak(utterance);
        setIsPlaying(true);
      }
    }
  };

  const handleStop = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsPlaying(false);
    }
  };

  if (!isSupported) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-[10px] bg-[#1c1916] border border-[#d4af6a]/20 text-xs font-mono">
      <button
        onClick={handleTogglePlay}
        className="flex items-center gap-1.5 text-[#f0d9a8] hover:text-white transition-colors cursor-pointer"
        title={isPlaying ? 'Pausar áudio da aula' : 'Ouvir aula narrada em áudio'}
      >
        {isPlaying ? (
          <>
            <Pause className="w-3.5 h-3.5 text-[#3ddc97]" />
            <span className="text-[#3ddc97] font-bold">Ouvindo... (Pausar)</span>
          </>
        ) : (
          <>
            <Volume2 className="w-3.5 h-3.5 text-[#d4af6a]" />
            <span>Ouvir Aula em Áudio</span>
          </>
        )}
      </button>

      {isPlaying && (
        <button
          onClick={handleStop}
          className="text-[#8c8273] hover:text-[#ff5c6c] transition-colors p-0.5 cursor-pointer"
          title="Parar áudio"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

function useMemoText(
  title: string,
  intro: string,
  sections: { heading: string; text: string }[],
  summary: string
): string {
  const sectionsContent = sections
    .map((s) => `${s.heading}. ${s.text}`)
    .join('. ');

  return `Aula Norte Invest: ${title}. ${intro}. ${sectionsContent}. Em resumo: ${summary}.`;
}
