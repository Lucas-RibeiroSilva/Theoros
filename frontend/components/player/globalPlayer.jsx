import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Howl, Howler } from 'howler';
import { playlistData } from './playerData';
import '../../styles/globalPlayer.css';

export default function GlobalPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobilePlayerOpen, setIsMobilePlayerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const soundRef = useRef(null);
  const progressRef = useRef(null);
  const volumeRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Detectar mudança de tamanho da tela
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      // Fechar player mobile ao mudar para desktop
      if (window.innerWidth > 768) {
        setIsMobilePlayerOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Inicializar volume global do Howler
  useEffect(() => {
    Howler.volume(volume);
  }, []);

  // Carregar música atual
  const loadTrack = useCallback((index) => {
    const track = playlistData[index];
    if (!track) return;

    setIsLoading(true);

    if (soundRef.current) {
      soundRef.current.stop();
      soundRef.current.unload();
      soundRef.current = null;
    }

    const sound = new Howl({
      src: [`/player/audio/${track.file}.mp3`, `/player/audio/${track.file}.webm`],
      html5: true,
      onplay: () => {
        setIsPlaying(true);
        setIsLoading(false);
        setDuration(sound.duration());
        updateProgress();
      },
      onload: () => {
        setIsLoading(false);
        setDuration(sound.duration());
      },
      onend: () => {
        sound.play(); // Loop infinito
      },
      onpause: () => setIsPlaying(false),
      onstop: () => setIsPlaying(false),
      onplayerror: () => {
        setIsLoading(false);
        console.error('Erro ao reproduzir áudio');
      },
    });

    soundRef.current = sound;
    sound.play();
  }, []);

  // Atualizar barra de progresso
  const updateProgress = useCallback(() => {
    if (!soundRef.current) return;
    const seek = soundRef.current.seek() || 0;
    const dur = soundRef.current.duration() || 1;
    setCurrentTime(seek);
    setProgress((seek / dur) * 100);

    if (soundRef.current.playing()) {
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    }
  }, []);

  useEffect(() => {
    loadTrack(currentIndex);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (soundRef.current) {
        soundRef.current.stop();
        soundRef.current.unload();
      }
    };
  }, [currentIndex, loadTrack]);

  // Controles
  const togglePlay = () => {
    if (!soundRef.current || isLoading) return;
    if (isPlaying) {
      soundRef.current.pause();
    } else {
      soundRef.current.play();
      updateProgress();
    }
  };

  const skip = (direction) => {
    let newIndex = currentIndex + (direction === 'next' ? 1 : -1);
    if (newIndex < 0) newIndex = playlistData.length - 1;
    if (newIndex >= playlistData.length) newIndex = 0;
    setCurrentIndex(newIndex);
    setProgress(0);
    setCurrentTime(0);
  };

  const seek = (e) => {
    if (!soundRef.current || !progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    soundRef.current.seek(soundRef.current.duration() * percent);
    setProgress(percent * 100);
  };

  const handleVolume = (e) => {
    if (!volumeRef.current) return;
    const rect = volumeRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    const newVol = percent;
    setVolume(newVol);
    Howler.volume(newVol);
    setIsMuted(newVol === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      Howler.volume(volume || 0.8);
      setIsMuted(false);
    } else {
      Howler.volume(0);
      setIsMuted(true);
    }
  };

  const togglePlaylist = () => {
    setShowPlaylist(!showPlaylist);
  };

  const toggleVolume = () => {
    setShowVolume(!showVolume);
  };

  // Função para alternar o player mobile
  const toggleMobilePlayer = () => {
    setIsMobilePlayerOpen(!isMobilePlayerOpen);
  };

  // Formatação de tempo
  const formatTime = (secs) => {
    const minutes = Math.floor(secs / 60) || 0;
    const seconds = Math.floor(secs - minutes * 60) || 0;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Se for mobile e o player estiver fechado, mostrar apenas o ícone da clava
  if (isMobile && !isMobilePlayerOpen) {
    return (
      <div 
        className="mobile-music-icon" 
        onClick={toggleMobilePlayer}
        role="button"
        aria-label="Abrir player de música"
      >
        <img src="/player/music-icon-mobile.png" alt="" className="music-note-icon"/>
        {isPlaying && <span className="playing-indicator"></span>}
      </div>
    );
  }

  // Renderização do player completo (Desktop ou Mobile aberto)
  return (
    <div id="player-shell" className={isMobile ? 'mobile-player-open' : ''}>
      {/* Título e Tempo */}
      <div className="player-title">
        <span>
          {currentIndex + 1}. {playlistData[currentIndex].title}
        </span>
        <div className="player-timer">{formatTime(currentTime)}</div>
        <div className="player-duration">{formatTime(duration)}</div>
      </div>

      {/* NOVO LAYOUT DOS CONTROLES */}
      <div className="controls-container">
        
        {/* Linha 1: Play/Pause + Barra de Progresso */}
        <div className="controls-row-1">
          <div
            className={`btn-play-pause ${isPlaying ? 'pause-icon' : 'play-icon'}`}
            onClick={togglePlay}
            style={{ display: isLoading ? 'none' : 'block' }}
          />
          <div className="progress-container" ref={progressRef} onClick={seek}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Linha 2: Playlist + Anterior/Próximo + Volume */}
        <div className="controls-row-2">
          <div className="btn-playlist" onClick={togglePlaylist} />
          
          <div className="nav-controls">
            <div className="btn-nav" onClick={() => skip('prev')}>◀</div>
            <div className="btn-nav" onClick={() => skip('next')}>▶</div>
          </div>
          
          <div 
            className={`btn-volume ${isMuted ? 'btn-volume-muted' : ''}`} 
            onClick={toggleVolume} 
          />
        </div>

      </div>

      {/* Playlist */}
      {showPlaylist && (
        <div className="playlist-container fadein" style={{ display: 'block' }}>
          <div className="playlist-list">
            {playlistData.map((track, idx) => (
              <div
                key={idx}
                className={`playlist-item ${idx === currentIndex ? 'active' : ''}`}
                onClick={() => {
                  setCurrentIndex(idx);
                  setShowPlaylist(false);
                  setProgress(0);
                  setCurrentTime(0);
                }}
              >
                {track.title}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controle de Volume */}
      {showVolume && (
        <div 
          className="volume-overlay fadein" 
          style={{ display: 'block' }}
          onClick={toggleVolume}
        >
          <div
            className="volume-bar-container"
            ref={volumeRef}
            onClick={(e) => {
              e.stopPropagation();
              handleVolume(e);
            }}
          >
            <div
              className="volume-bar-fill"
              style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
            />
            <div
              className="volume-slider"
              style={{ left: `calc(${(isMuted ? 0 : volume) * 100}% - 7px)` }}
            />
          </div>
        </div>
      )}

      {/* Botão de fechar no mobile */}
      {isMobile && (
        <div className="mobile-close-btn" onClick={toggleMobilePlayer}>
          ✕
        </div>
      )}
    </div>
  );
};