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
  const canvasRef = useRef(null);
  const isDraggingVolumeRef = useRef(false);

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

  // Inicializar animação de onda com canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let frameId;
    let phase = 0;

    const resizeCanvas = () => {
    // Mede o WRAPPER (.waveform-wrapper), não o próprio canvas — o canvas
    // recebe um style.width em px logo abaixo, então medir nele mesmo
    // faz a leitura ficar "presa" no último valor definido por JS e nunca
    // mais acompanhar o CSS/breakpoints (era isso que travava a wave em 200px
    // quando o wrapper crescia pra 300px no mobile).
    const dpr = window.devicePixelRatio || 1;
    const parent = canvas.parentElement;
    const width = parent.clientWidth;
    const height = parent.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawWave = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      ctx.clearRect(0, 0, width, height);

      // Desenho de linha estática quando não tocando
      if (!isPlaying) {
        const padding = 2;
        const availH = Math.max(2, height - padding * 2);
        const midYStatic = padding + availH / 2;
        ctx.beginPath();
        ctx.moveTo(0, midYStatic);
        ctx.lineTo(width, midYStatic);
        ctx.strokeStyle = '#9c3f00';
        ctx.lineWidth = 1;
        ctx.lineCap = 'round';
        ctx.stroke();
        return;
      }

      // Configurações para evitar cortes nas cristas/vales
      ctx.strokeStyle = '#9c3f00';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      const padding = Math.max(2, ctx.lineWidth);
      const availH = Math.max(2, height - padding * 2);
      const amplitude = availH * 0.45; // amplitude relativa à altura disponível
      const midY = padding + availH / 2; // centro vertical com padding
      const frequency = 0.1; // frequência da onda
      for (let x = 0; x <= width; x += 1) {
        const envelope = Math.pow(Math.sin((x / width) * Math.PI), 3);
        const y = midY + Math.sin(x * frequency + phase) * amplitude * envelope;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      phase += 0.12;
      frameId = requestAnimationFrame(drawWave);
    };

    const handleResize = () => {
      resizeCanvas();
      // Após redimensionar o canvas ele é limpo automaticamente.
      // Redesenhar uma vez: se não está tocando, desenha a barra estática;
      // se está tocando e o loop de animação ainda não foi iniciado, inicia-o.
      if (!isPlaying) {
        drawWave();
      } else if (isPlaying && !frameId) {
        drawWave();
      }
    };

    resizeCanvas();
    // Sempre desenha uma vez após redimensionar — quando não está tocando desenha a barra estática,
    // quando está tocando inicia o loop de animação dentro de drawWave().
    drawWave();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
    };
    // isMobile / isMobilePlayerOpen entram aqui porque no mobile o <canvas> só
    // existe no DOM quando o player está aberto. Sem essas dependências, ao abrir
    // o player o efeito não re-executa (isPlaying não mudou), e o canvas fica com
    // o tamanho padrão do navegador (300x150) até o usuário clicar em play/pause.
  }, [isPlaying, isMobile, isMobilePlayerOpen]);

  // Garantir que a linha estática seja desenhada imediatamente quando a reprodução parar.
  // Em alguns casos mobile o canvas não é redesenhado pelo loop imediatamente.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (isPlaying) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const padding = 2;
    const availH = Math.max(2, height - padding * 2);
    const midYStatic = padding + availH / 2;
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.moveTo(0, midYStatic);
    ctx.lineTo(width, midYStatic);
    ctx.strokeStyle = '#9c3f00';
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    ctx.stroke();
  }, [isPlaying, isMobile, isMobilePlayerOpen]);

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

  const updateVolumeFromClientX = useCallback((clientX) => {
    if (!volumeRef.current) return;
    const rect = volumeRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    setVolume(percent);
    Howler.volume(percent);
    setIsMuted(percent === 0);
  }, []);

  const handleVolumeDragMove = useCallback((e) => {
    if (!isDraggingVolumeRef.current) return;
    if (e.touches) e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    updateVolumeFromClientX(clientX);
  }, [updateVolumeFromClientX]);

  const handleVolumeDragEnd = useCallback(() => {
    isDraggingVolumeRef.current = false;
    window.removeEventListener('mousemove', handleVolumeDragMove);
    window.removeEventListener('mouseup', handleVolumeDragEnd);
    window.removeEventListener('touchmove', handleVolumeDragMove);
    window.removeEventListener('touchend', handleVolumeDragEnd);
  }, [handleVolumeDragMove]);

  const handleVolumeDragStart = (e) => {
    e.stopPropagation();
    isDraggingVolumeRef.current = true;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    updateVolumeFromClientX(clientX);
    window.addEventListener('mousemove', handleVolumeDragMove);
    window.addEventListener('mouseup', handleVolumeDragEnd);
    window.addEventListener('touchmove', handleVolumeDragMove, { passive: false });
    window.addEventListener('touchend', handleVolumeDragEnd);
  };

  // Limpar listeners de drag se o componente desmontar no meio do arraste
  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleVolumeDragMove);
      window.removeEventListener('mouseup', handleVolumeDragEnd);
      window.removeEventListener('touchmove', handleVolumeDragMove);
      window.removeEventListener('touchend', handleVolumeDragEnd);
    };
  }, [handleVolumeDragMove, handleVolumeDragEnd]);

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

      <div className="waveform-wrapper">
        {/* Para redimensionar a caixa da wave: altere `height` em frontend/styles/globalPlayer.css `.waveform-wrapper` */}
        <canvas className="waveform" ref={canvasRef} />
      </div>

      {/*LAYOUT DOS CONTROLES */}
      <div className="controls-container">
        
        {/* Linha 1: Play/Pause*/}
        <div className="controls-row-1">
          <div
            className={`btn-play-pause ${isPlaying ? 'pause-icon' : 'play-icon'}`}
            onClick={togglePlay}
            style={{ display: isLoading ? 'none' : 'block' }}
          />
          
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
            onClick={(e) => e.stopPropagation()}
            onMouseDown={handleVolumeDragStart}
            onTouchStart={handleVolumeDragStart}
          >
            <div
              className="volume-bar-fill"
              style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
            />
            <div
              className="volume-slider"
              style={{ left: `calc(${(isMuted ? 0 : volume) * 100}% - 7px)` }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={handleVolumeDragStart}
              onTouchStart={handleVolumeDragStart}
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
