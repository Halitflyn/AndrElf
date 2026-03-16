import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Shuffle, Repeat, SkipBack, Play, Pause, SkipForward, Heart, HeartOff, Volume2 } from 'lucide-react';
import { rulesData, tracksData } from './data';

const RulesList = React.memo(({ rules, onTeaClick }: { rules: string[], onTeaClick: (e: React.MouseEvent) => void }) => {
  return (
    <ol className="list-none p-0 mt-6 sm:mt-8 text-left" style={{ counterReset: 'rule-counter' }} onClick={onTeaClick}>
      {rules.map((rule, idx) => (
        <li key={idx} className="relative pl-10 sm:pl-14 mb-5 sm:mb-6 text-lg sm:text-xl leading-relaxed transition-transform duration-200 hover:translate-x-2 hover:text-[#e0f2f1]">
          <span className="absolute left-0 top-0 w-8 sm:w-11 text-right text-neon-cyan font-bold">
            ◆ {idx + 1}.
          </span>
          <span dangerouslySetInnerHTML={{ __html: rule }} />
        </li>
      ))}
    </ol>
  );
});

export default function App() {
  // --- Refs ---
  const eyeRef = useRef<HTMLDivElement>(null);
  const pupilRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const teaSoundRef = useRef<HTMLAudioElement>(null);
  const headingSoundRef = useRef<HTMLAudioElement>(null);

  // --- State ---
  const [isElfVisible, setIsElfVisible] = useState(false);
  const [cultMessage, setCultMessage] = useState('');
  const [showRunes, setShowRunes] = useState(false);
  
  // Player State
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isLikedMode, setIsLikedMode] = useState(false);
  const [saveStatusOpacity, setSaveStatusOpacity] = useState(0);

  // Local Storage State
  const [likedTracks, setLikedTracks] = useState<string[]>([]);
  const [dislikedTracks, setDislikedTracks] = useState<string[]>([]);

  // --- Effects ---

  // Initialize from LocalStorage
  useEffect(() => {
    const savedLiked = JSON.parse(localStorage.getItem('psychoAndriyLiked') || '[]');
    const savedDisliked = JSON.parse(localStorage.getItem('psychoAndriyDisliked') || '[]');
    setLikedTracks(savedLiked);
    setDislikedTracks(savedDisliked);

    const savedTrackFilename = localStorage.getItem('psychoAndriySavedTrack');
    if (savedTrackFilename) {
      const trackIndex = tracksData.findIndex(t => t.filename === savedTrackFilename);
      if (trackIndex !== -1) setCurrentTrackIndex(trackIndex);
    }
  }, []);

  // Eye Tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!eyeRef.current || !pupilRef.current) return;
      const eye = eyeRef.current;
      const pupil = pupilRef.current;
      
      const rect = eye.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
      const dist = Math.min(rect.width / 4, Math.sqrt(Math.pow(e.clientX - cx, 2) + Math.pow(e.clientY - cy, 2)));
      
      pupil.style.transform = `translate(${dist * Math.cos(angle)}px, ${dist * Math.sin(angle)}px)`;
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Keyboard Easter Egg (Runes)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'a') {
        setShowRunes(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Audio Player Logic
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setProgress(audio.currentTime);
      
      // Save track if played for more than 10 seconds
      if (audio.currentTime > 10) {
        localStorage.setItem('psychoAndriySavedTrack', tracksData[currentTrackIndex].filename);
        setSaveStatusOpacity(1);
        setTimeout(() => setSaveStatusOpacity(0), 3000);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      playNextLogic(1);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex, isRepeat, isShuffle, isLikedMode, likedTracks, dislikedTracks]);

  // Play/Pause effect when track changes
  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(e => console.log("Audio play prevented:", e));
    }
  }, [currentTrackIndex]);

  // --- Handlers ---

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const getValidTracks = () => {
    let valid: number[] = [];
    for (let i = 0; i < tracksData.length; i++) {
      const fname = tracksData[i].filename;
      if (isLikedMode) {
        if (likedTracks.includes(fname)) valid.push(i);
      } else {
        if (!dislikedTracks.includes(fname)) valid.push(i);
      }
    }
    return valid;
  };

  const playNextLogic = (direction: number = 1) => {
    if (isRepeat && direction === 1 && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      return;
    }

    const validTracks = getValidTracks();
    if (validTracks.length === 0) {
      alert('Немає пісень для відтворення в цьому режимі!');
      setIsPlaying(false);
      if (audioRef.current) audioRef.current.pause();
      return;
    }

    if (isShuffle) {
      const rand = Math.floor(Math.random() * validTracks.length);
      setCurrentTrackIndex(validTracks[rand]);
    } else {
      let found = false;
      let step = direction;
      for (let i = 1; i <= tracksData.length; i++) {
        let testIndex = (currentTrackIndex + step + tracksData.length) % tracksData.length;
        if (validTracks.includes(testIndex)) {
          setCurrentTrackIndex(testIndex);
          found = true;
          break;
        }
        step += direction;
      }
      if (!found) setCurrentTrackIndex(validTracks[0]);
    }
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    setProgress(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const toggleLike = () => {
    const fname = tracksData[currentTrackIndex].filename;
    let newLiked = [...likedTracks];
    let newDisliked = [...dislikedTracks];

    if (newLiked.includes(fname)) {
      newLiked = newLiked.filter(t => t !== fname);
    } else {
      newLiked.push(fname);
      newDisliked = newDisliked.filter(t => t !== fname);
    }

    setLikedTracks(newLiked);
    setDislikedTracks(newDisliked);
    localStorage.setItem('psychoAndriyLiked', JSON.stringify(newLiked));
    localStorage.setItem('psychoAndriyDisliked', JSON.stringify(newDisliked));
  };

  const toggleDislike = () => {
    const fname = tracksData[currentTrackIndex].filename;
    let newLiked = [...likedTracks];
    let newDisliked = [...dislikedTracks];

    if (!newDisliked.includes(fname)) {
      newDisliked.push(fname);
      newLiked = newLiked.filter(t => t !== fname);
      setDislikedTracks(newDisliked);
      setLikedTracks(newLiked);
      localStorage.setItem('psychoAndriyLiked', JSON.stringify(newLiked));
      localStorage.setItem('psychoAndriyDisliked', JSON.stringify(newDisliked));
      playNextLogic(1); // Skip immediately if disliked
    } else {
      newDisliked = newDisliked.filter(t => t !== fname);
      setDislikedTracks(newDisliked);
      localStorage.setItem('psychoAndriyDisliked', JSON.stringify(newDisliked));
    }
  };

  const handleTeaClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.tea-trigger')) {
      alert('🍵 О, так, цей священний нектар!');
      if (teaSoundRef.current) {
        teaSoundRef.current.currentTime = 0;
        teaSoundRef.current.play();
      }
    }
  }, []);

  const currentTrack = tracksData[currentTrackIndex];

  return (
    <div className="min-h-screen p-2 sm:p-5 flex flex-col items-center overflow-x-hidden">
      {/* Hidden Audio Elements */}
      <audio ref={audioRef} src={currentTrack?.url} preload="auto" />
      <audio ref={teaSoundRef} src="https://www.soundjay.com/buttons/beep-07a.mp3" preload="auto" />
      <audio ref={headingSoundRef} src="https://www.soundjay.com/buttons/button-10.mp3" preload="auto" />

      {/* The Eye */}
      <div 
        ref={eyeRef}
        className="fixed top-5 left-1/2 -translate-x-1/2 w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] bg-[#1a1a1d] rounded-full border-3 border-neon-cyan flex justify-center items-center overflow-hidden shadow-[0_0_20px_rgba(102,252,241,0.6)] z-50 pointer-events-none"
      >
        <div ref={pupilRef} className="w-[25px] h-[25px] sm:w-[30px] sm:h-[30px] bg-neon-green rounded-full absolute transition-transform duration-100 ease-linear"></div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-[900px] mt-24 sm:mt-28 md:mt-8 p-5 sm:p-10 bg-[#1f2124]/95 border-2 border-neon-cyan rounded-2xl glow-box-cyan animate-[pulse-glow_5s_infinite_ease-in-out] relative z-10">
        
        {/* Heading */}
        <div className="relative inline-block group cursor-pointer mb-5" onClick={() => {
          setIsElfVisible(!isElfVisible);
          if (headingSoundRef.current) {
            headingSoundRef.current.currentTime = 0;
            headingSoundRef.current.play();
          }
        }}>
          <h1 className="font-cinzel text-4xl sm:text-5xl md:text-7xl text-neon-cyan select-none glow-text-cyan transition-all duration-400 tracking-wider">
            АНДРІЙ прийди!
          </h1>
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/90 text-[#ffcc00] px-3 py-1 rounded border border-[#ffcc00] text-xs sm:text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
            "Він вже йде... можливо"
          </span>
        </div>

        {/* Hidden Elf Image */}
        {isElfVisible && (
          <img 
            src="https://i.pinimg.com/564x/07/34/7d/07347d3f1a04f210a501a35fb31f13b6.jpg" 
            alt="Ельф Асасін" 
            className="w-[250px] sm:w-[300px] h-auto mx-auto my-6 sm:my-8 border-4 border-neon-cyan rounded-xl shadow-[0_0_35px_rgba(102,252,241,0.6)] animate-[fadeIn_1.5s_ease-out] scale-105"
          />
        )}

        {/* Cult Button */}
        <div className="w-full flex flex-col items-center">
          <button 
            onClick={() => setCultMessage('Ти зробив правильний вибір. Чай вже заварюється...')}
            className="w-full sm:w-auto bg-transparent text-neon-cyan border-2 border-neon-cyan px-4 py-3 sm:px-8 sm:py-4 text-lg sm:text-xl font-cinzel rounded-lg cursor-pointer transition-all duration-300 mt-6 sm:mt-8 shadow-[inset_0_0_10px_rgba(102,252,241,0.2)] hover:bg-neon-cyan hover:text-[#1f2124] hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(102,252,241,0.8)]"
          >
            Приєднатися до Культу
          </button>
          {cultMessage && (
            <p className="mt-4 sm:mt-5 text-lg sm:text-xl text-neon-green italic animate-[fadeIn_1s_ease-out] text-center">
              {cultMessage}
            </p>
          )}
        </div>

        {/* Rules */}
        <h2 className="font-cinzel text-neon-cyan border-b-2 border-neon-teal pb-3 sm:pb-4 mt-8 sm:mt-10 text-2xl sm:text-3xl md:text-4xl drop-shadow-[0_0_10px_rgba(102,252,241,0.4)] tracking-wide">
          📜 Святі правила культу Психо-Андрія
        </h2>
        <RulesList rules={rulesData} onTeaClick={handleTeaClick} />

        {/* Music Player */}
        <div className="mt-8 sm:mt-12 p-4 sm:p-8 border border-neon-teal rounded-xl bg-gradient-to-br from-[#1a1a1d]/90 to-[#0f0f12]/95 shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_15px_rgba(69,162,158,0.3)] flex flex-col gap-4">
          <h2 className="font-cinzel text-neon-cyan text-xl sm:text-2xl md:text-3xl m-0 border-none pb-0">🎵 Сувої Дібрівських Мелодій 🎵</h2>
          
          {/* Controls */}
          <div className="flex flex-col gap-5 sm:gap-6 mt-4 mb-2">
            
            {/* Row 1: Likes & Utilities */}
            <div className="flex justify-between items-center px-2 sm:px-8">
              <button 
                onClick={() => setIsShuffle(!isShuffle)}
                className={`p-3 rounded-full transition-all ${isShuffle ? 'text-neon-green bg-neon-green/10 shadow-[0_0_10px_rgba(158,255,161,0.3)]' : 'text-neon-teal hover:text-neon-cyan hover:bg-neon-cyan/10'}`}
                title="Перемішка"
              >
                <Shuffle size={24} />
              </button>
              
              <div className="flex gap-6 sm:gap-8">
                <button 
                  onClick={toggleLike}
                  className={`p-3 rounded-full transition-all ${likedTracks.includes(currentTrack?.filename) ? 'text-neon-green bg-neon-green/10 shadow-[0_0_15px_rgba(158,255,161,0.4)] scale-110' : 'text-neon-teal hover:text-neon-cyan hover:bg-neon-cyan/10 hover:scale-110'}`}
                  title="Вподобати"
                >
                  <Heart size={32} fill={likedTracks.includes(currentTrack?.filename) ? "currentColor" : "none"} />
                </button>
                <button 
                  onClick={toggleDislike}
                  className={`p-3 rounded-full transition-all ${dislikedTracks.includes(currentTrack?.filename) ? 'text-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.4)] scale-110' : 'text-neon-teal hover:text-red-400 hover:bg-red-400/10 hover:scale-110'}`}
                  title="Не вподобати"
                >
                  <HeartOff size={32} />
                </button>
              </div>

              <button 
                onClick={() => setIsRepeat(!isRepeat)}
                className={`p-3 rounded-full transition-all ${isRepeat ? 'text-neon-green bg-neon-green/10 shadow-[0_0_10px_rgba(158,255,161,0.3)]' : 'text-neon-teal hover:text-neon-cyan hover:bg-neon-cyan/10'}`}
                title="Повтор пісні"
              >
                <Repeat size={24} />
              </button>
            </div>

            {/* Row 2: Skips */}
            <div className="flex justify-center items-center gap-6 sm:gap-12">
              <button onClick={() => playNextLogic(-1)} className="bg-transparent text-neon-cyan border-2 border-neon-cyan px-8 py-3 sm:px-10 sm:py-4 font-cinzel rounded-xl transition-all hover:bg-neon-cyan hover:text-[#1f2124] hover:-translate-y-1 glow-box-cyan-hover flex items-center gap-2">
                <SkipBack size={24} /> <span className="hidden sm:inline text-lg">Попередня</span>
              </button>
              <button onClick={() => playNextLogic(1)} className="bg-transparent text-neon-cyan border-2 border-neon-cyan px-8 py-3 sm:px-10 sm:py-4 font-cinzel rounded-xl transition-all hover:bg-neon-cyan hover:text-[#1f2124] hover:-translate-y-1 glow-box-cyan-hover flex items-center gap-2">
                <span className="hidden sm:inline text-lg">Наступна</span> <SkipForward size={24} />
              </button>
            </div>

            {/* Row 3: Play/Pause */}
            <div className="flex justify-center mt-2">
              <button onClick={togglePlayPause} className="bg-transparent text-neon-cyan border-2 border-neon-cyan px-12 py-4 sm:py-5 text-xl sm:text-2xl font-cinzel rounded-2xl transition-all hover:bg-neon-cyan hover:text-[#1f2124] hover:-translate-y-1 glow-box-cyan-hover flex items-center justify-center gap-3 w-full sm:w-[350px]">
                {isPlaying ? <><Pause size={32} /> Пауза</> : <><Play size={32} /> Грати</>}
              </button>
            </div>

          </div>

          {/* Extra Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-black/30 p-3 sm:p-4 rounded-lg border border-dashed border-neon-teal gap-3 sm:gap-4">
            <div className="flex items-center justify-between sm:justify-start gap-3 text-neon-cyan w-full sm:w-auto">
              <Volume2 size={24} />
              <input 
                type="range" 
                min="0" max="1" step="0.05" 
                value={volume} 
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full sm:w-[100px] h-2"
              />
            </div>
            <button 
              onClick={() => setIsLikedMode(!isLikedMode)}
              className={`w-full sm:w-auto px-4 py-3 sm:py-2 text-sm sm:text-base font-cinzel rounded-lg transition-all border-2 ${isLikedMode ? 'bg-neon-green text-[#1f2124] border-neon-green shadow-[0_0_15px_rgba(158,255,161,0.5)]' : 'bg-transparent text-neon-cyan border-neon-cyan hover:bg-neon-cyan hover:text-[#1f2124]'}`}
            >
              💚 Режим вподобань: {isLikedMode ? 'УВІМК' : 'ВИМК'}
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2 sm:gap-4 my-2 px-1 sm:px-2">
            <span className="font-mono text-sm sm:text-base text-neon-green min-w-[40px] sm:min-w-[50px]">{formatTime(progress)}</span>
            <input 
              type="range" 
              min="0" 
              max={duration || 0} 
              step="1" 
              value={progress}
              onChange={handleProgressChange}
              className="flex-grow h-2"
            />
            <span className="font-mono text-sm sm:text-base text-neon-green min-w-[40px] sm:min-w-[50px] text-right">{formatTime(duration)}</span>
          </div>
          
          {/* Playlist */}
          <ul className="list-none p-1 m-0 border-y border-neon-teal/50 max-h-[200px] sm:max-h-[160px] overflow-y-auto bg-black/20 rounded-lg">
            {tracksData.map((track, idx) => (
              <li 
                key={idx}
                onClick={() => {
                  setCurrentTrackIndex(idx);
                  setIsPlaying(true);
                }}
                className={`p-3 sm:p-4 cursor-pointer border-b border-neon-teal/20 transition-all text-left text-base sm:text-lg rounded flex justify-between items-center last:border-b-0
                  ${idx === currentTrackIndex 
                    ? 'bg-neon-teal/30 text-neon-green font-bold border-l-4 border-l-neon-green pl-4 sm:pl-5' 
                    : 'hover:bg-neon-cyan/15 hover:text-white hover:pl-5 sm:hover:pl-6'}`}
              >
                <span className="truncate pr-2">{track.title}</span>
                <span className="text-sm sm:text-base opacity-70 flex-shrink-0">
                  {likedTracks.includes(track.filename) ? '💚' : dislikedTracks.includes(track.filename) ? '💔' : ''}
                </span>
              </li>
            ))}
          </ul>

          {/* Track Info */}
          <div className="text-left bg-black/60 p-4 sm:p-5 rounded-xl border border-neon-cyan/30 mt-2">
            <div className="text-xl sm:text-2xl mb-3 text-neon-cyan text-center font-cinzel">{currentTrack?.title}</div>
            <div className="text-sm sm:text-base"><span className="text-neon-teal font-bold font-cinzel">Автор:</span> <span className="text-white">{currentTrack?.author}</span></div>
            <div className="text-sm sm:text-base"><span className="text-neon-teal font-bold font-cinzel">Помічник:</span> <span className="text-white">{currentTrack?.coAuthor}</span></div>
            <div className="text-sm sm:text-base"><span className="text-neon-teal font-bold font-cinzel">Опис:</span> <span className="text-white">{currentTrack?.description}</span></div>
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-dashed border-neon-teal/50 italic text-[#d3d4d5] whitespace-pre-wrap max-h-[150px] sm:max-h-[200px] overflow-y-auto leading-relaxed pr-2 text-sm sm:text-base">
              {currentTrack?.lyrics}
            </div>
          </div>
          
          <p 
            className="text-xs sm:text-sm text-[#ffcc00] mt-1 drop-shadow-[0_0_5px_#ffcc00] transition-opacity duration-500 text-center"
            style={{ opacity: saveStatusOpacity }}
          >
            Мелодія збережена в пам'яті культу...
          </p>
        </div>

        {/* Ritual Button */}
        <div className="w-full flex flex-col items-center">
          <button className="w-full sm:w-auto bg-transparent text-[#e65100] border-2 border-[#e65100] px-4 py-3 sm:px-6 sm:py-3 text-lg sm:text-xl font-spectral rounded-lg cursor-pointer transition-all duration-300 mt-6 sm:mt-8 hover:bg-[#e65100] hover:text-white hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(230,81,0,0.8)]">
            Ініціація Чайним Ритуалом
          </button>
        </div>

        {/* Runes Alphabet (Easter Egg) */}
        {showRunes && (
          <div className="mt-6 sm:mt-8 p-4 sm:p-5 bg-black/80 border-2 border-[#ffcc00] rounded-lg text-[#ffcc00] text-left animate-[fadeIn_0.5s_ease-out]">
            <h3 className="text-lg sm:text-xl font-bold mb-3">Рунічний Алфавіт Дібрівських Лісів:</h3>
            <p className="mb-1 text-sm sm:text-base"><strong className="text-white">A:</strong> Андрій (Начало)</p>
            <p className="mb-1 text-sm sm:text-base"><strong className="text-white">B:</strong> Безумство (Шлях)</p>
            <p className="mb-1 text-sm sm:text-base"><strong className="text-white">C:</strong> Чай (Просвітлення)</p>
          </div>
        )}

      </div>
    </div>
  );
}
