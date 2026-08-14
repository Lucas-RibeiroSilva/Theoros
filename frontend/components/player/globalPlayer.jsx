import React, { useState, useRef, useEffect, useCallback } from "react";
import { Howl, Howler } from "howler";
import { playlistData } from "./playerData";
import "../../styles/globalPlayer.css";

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
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

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
      if (window.innerWidth > 768) {
        setIsMobilePlayerOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Inicializar volume global do Howler
  useEffect(() => {
    Howler.volume(volume);
  }, []);

  // Atualizar progresso do áudio
  const updateProgress = useCallback(() => {
    if (soundRef.current && isPlaying) {
      const seek = soundRef.current.seek() || 0;
      setCurrentTime(seek);
      const duration = soundRef.current.duration() || 0;
      if (duration > 0) {
        setProgress((seek / duration) * 100);
      }
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    }
  }, [isPlaying]);

  // Gerenciar loop de atualização do progresso
  useEffect(() => {
    if (isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isPlaying, updateProgress]);

  // Inicializar animação de onda com canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let frameId;
    let phase = 0;

    const resizeCanvas = () => {
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

      if (!isPlaying) {
        const padding = 2;
        const availH = Math.max(2, height - padding * 2);
        const midYStatic = padding + availH / 2;
        ctx.beginPath();
        ctx.moveTo(0, midYStatic);
        ctx.lineTo(width, midYStatic);
        ctx.strokeStyle = "#9c3f00";
        ctx.lineWidth = 1;
        ctx.lineCap = "round";
        ctx.stroke();
        return;
      }

      ctx.strokeStyle = "#9c3f00";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      const padding = Math.max(2, ctx.lineWidth);
      const availH = Math.max(2, height - padding * 2);
      const amplitude = availH * 0.45;
      const midY = padding + availH / 2;
      const frequency = 0.1;

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
      if (!isPlaying) {
        drawWave();
      } else if (isPlaying && !frameId) {
        drawWave();
      }
    };

    resizeCanvas();
    drawWave();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(frameId);
    };
  }, [isPlaying, isMobile, isMobilePlayerOpen]);

  // Garantir linha estática quando a reprodução parar
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isPlaying) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const padding = 2;
    const availH = Math.max(2, height - padding * 2);
    const midYStatic = padding + availH / 2;

    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.moveTo(0, midYStatic);
    ctx.lineTo(width, midYStatic);
    ctx.strokeStyle = "#9c3f00";
    ctx.lineWidth = 1;
    ctx.lineCap = "round";
    ctx.stroke();
  }, [isPlaying, isMobile, isMobilePlayerOpen]);

  // Carregar música atual
  const loadTrack = useCallback(
    (index, playImmediately = false) => {
      const track = playlistData[index];
      if (!track) return;

      setIsLoading(true);

      if (soundRef.current) {
        soundRef.current.stop();
        soundRef.current.unload();
        soundRef.current = null;
        setTimeout(() => {
          if (soundRef.current === null) {
            Howler.unload();
          }
        }, 100);
      }

      const sound = new Howl({
        src: [
          `/player/audio/${track.file}.mp3`,
          `/player/audio/${track.file}.webm`,
        ],
        html5: false,
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
          sound.play();
        },
        onpause: () => setIsPlaying(false),
        onstop: () => setIsPlaying(false),
        onplayerror: () => {
          setIsLoading(false);
          console.error("Erro ao reproduzir áudio");
        },
      });

      soundRef.current = sound;

      if (playImmediately || hasUserInteracted) {
        sound.play();
      }
    },
    [hasUserInteracted],
  );

  // Carregar faixa inicial
  useEffect(() => {
    loadTrack(currentIndex);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (soundRef.current) {
        soundRef.current.stop();
        soundRef.current.unload();
      }
    };
  }, [currentIndex, loadTrack]);

  // Controles
  const togglePlay = () => {
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
    }

    if (!soundRef.current || isLoading) {
      if (!soundRef.current) {
        loadTrack(currentIndex, true);
      }
      return;
    }

    if (isPlaying) {
      soundRef.current.pause();
    } else {
      soundRef.current.play();
    }
  };

  const skip = (direction) => {
    let newIndex = currentIndex + (direction === "next" ? 1 : -1);
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

  const handleVolumeDragMove = useCallback(
    (e) => {
      if (!isDraggingVolumeRef.current) return;
      if (e.touches) e.preventDefault();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      updateVolumeFromClientX(clientX);
    },
    [updateVolumeFromClientX],
  );

  const handleVolumeDragEnd = useCallback(() => {
    isDraggingVolumeRef.current = false;
    window.removeEventListener("mousemove", handleVolumeDragMove);
    window.removeEventListener("mouseup", handleVolumeDragEnd);
    window.removeEventListener("touchmove", handleVolumeDragMove);
    window.removeEventListener("touchend", handleVolumeDragEnd);
  }, [handleVolumeDragMove]);

  const handleVolumeDragStart = (e) => {
    e.stopPropagation();
    isDraggingVolumeRef.current = true;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    updateVolumeFromClientX(clientX);
    window.addEventListener("mousemove", handleVolumeDragMove);
    window.addEventListener("mouseup", handleVolumeDragEnd);
    window.addEventListener("touchmove", handleVolumeDragMove, {
      passive: false,
    });
    window.addEventListener("touchend", handleVolumeDragEnd);
  };

  // Limpar listeners de drag
  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handleVolumeDragMove);
      window.removeEventListener("mouseup", handleVolumeDragEnd);
      window.removeEventListener("touchmove", handleVolumeDragMove);
      window.removeEventListener("touchend", handleVolumeDragEnd);
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

  const togglePlaylist = () => setShowPlaylist(!showPlaylist);
  const toggleVolume = () => setShowVolume(!showVolume);
  const toggleMobilePlayer = () => setIsMobilePlayerOpen(!isMobilePlayerOpen);

  const formatTime = (secs) => {
    const minutes = Math.floor(secs / 60) || 0;
    const seconds = Math.floor(secs - minutes * 60) || 0;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Mobile player fechado
  if (isMobile && !isMobilePlayerOpen) {
    return (
      <div
        className="mobile-music-icon"
        onClick={toggleMobilePlayer}
        role="button"
        aria-label="Abrir player de música"
      >
        <img
          src="/player/music-icon-mobile.png"
          alt=""
          className="music-note-icon"
        />
        {isPlaying && <span className="playing-indicator"></span>}
      </div>
    );
  }

  // Renderização do player completo
  return (
    <div id="player-shell" className={isMobile ? "mobile-player-open" : ""}>
      <div className="player-title">
        <span>
          {currentIndex + 1}. {playlistData[currentIndex].title}
        </span>
        <div className="player-timer">{formatTime(currentTime)}</div>
        <div className="player-duration">{formatTime(duration)}</div>
      </div>

      <div className="waveform-wrapper">
        <canvas className="waveform" ref={canvasRef} />
      </div>

      <div className="controls-container">
        <div className="controls-row-1">
          {isLoading ? (
            <div className="loading-spinner" />
          ) : (
            <div
              className={`btn-play-pause ${isPlaying ? "pause-icon" : "play-icon"}`}
              onClick={togglePlay}
            />
          )}
        </div>

        <div className="controls-row-2">
          <div className="btn-playlist" onClick={togglePlaylist} />

          <div className="nav-controls">
            <div className="btn-nav" onClick={() => skip("prev")}>
              ◀
            </div>
            <div className="btn-nav" onClick={() => skip("next")}>
              ▶
            </div>
          </div>

          <div
            className={`btn-volume ${isMuted ? "btn-volume-muted" : ""}`}
            onClick={toggleVolume}
          />
        </div>
      </div>

      {showPlaylist && (
        <div className="playlist-container fadein" style={{ display: "block" }}>
          <div className="playlist-list">
            {playlistData.map((track, idx) => (
              <div
                key={idx}
                className={`playlist-item ${idx === currentIndex ? "active" : ""}`}
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

      {showVolume && (
        <div
          className="volume-overlay fadein"
          style={{ display: "block" }}
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

      {isMobile && (
        <div className="mobile-close-btn" onClick={toggleMobilePlayer}>
          ✕
        </div>
      )}
    </div>
  );
}
