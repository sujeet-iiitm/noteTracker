import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function LandingPage({ onComplete }: {onComplete: () => void}) {
  const heroTextRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const footerTextRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const scrollTextRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [textAnimationComplete, setTextAnimationComplete] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    const heroText = "NoteTracker";
    const heroElement = heroTextRef.current;
    
    if (heroElement) {
      heroElement.innerHTML = '';
      const words = heroText.split(' ');
      
      words.forEach((word, wordIndex) => {
        const wordSpan = document.createElement('span');
        wordSpan.style.display = 'inline-block';
        wordSpan.style.marginRight = '0.5em';
        
        word.split('').forEach((char, charIndex) => {
          const span = document.createElement('span');
          span.textContent = char;
          span.style.display = 'inline-block';
          span.style.opacity = '0';
          span.style.transform = `translate(${(Math.random() - 0.5) * 400}px, ${(Math.random() - 0.5) * 200}px) rotate(${(Math.random() - 0.5) * 180}deg) scale(${Math.random() * 1.5 + 0.5})`;
          span.style.transition = 'all 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
          span.style.transitionDelay = `${wordIndex * 100 + charIndex * 50}ms`;
          
          wordSpan.appendChild(span);
        });
        
        heroElement.appendChild(wordSpan);
      });
      
      setTimeout(() => {
        const spans = heroElement.querySelectorAll('span span');
        spans.forEach((span: any) => {
          span.style.opacity = '1';
          span.style.transform = 'translate(0, 0) rotate(7deg) scale(1)'; //0 - deg for not rotated text
        });
      }, 200);
      
      setTimeout(() => {
        setTextAnimationComplete(true);
      }, 2000);
    }

const handleScroll = () => {
  if (!textAnimationComplete) return;

  const scrollY = window.scrollY;
  const maxScroll = window.innerHeight * 2; // 2 screen-H
  const progress = Math.min(scrollY / maxScroll, 1);

  if (contentRef.current) {
    const scale = 1 - progress * 0.3;   // shrink a little
    const opacity = 1 - progress * 0.9; // Fade from 1 to 0.1
    const blur = progress * 3; // Add blur effect

    contentRef.current.style.transform = `scale(${scale})`;
    contentRef.current.style.opacity = opacity.toString();
    contentRef.current.style.filter = `blur(${blur}px)`;

    if (progress > 0.9) {
      onComplete();
      navigate("/login");
    }
  }
};

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [onComplete, textAnimationComplete]);

  const handleNavClick = (path: string) => {
    if (path === 'noteTracker') {
      if (contentRef.current) {
        contentRef.current.style.transition = 'all 0.5s ease-in-out';
        contentRef.current.style.opacity = '0';
        contentRef.current.style.transform = 'scale(0.95)';
        setTimeout(onComplete, 500);
      }
    } else if (path === 'passwordManager') {
      toast.error("Password Manager is being Designed, WAIT!..");
    }
  };

  const handleScrollClick = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <div className="relative w-full">
      <div style={{ height: '300vh' }} className="relative">
        <div 
          ref={contentRef}
          className="fixed inset-0 overflow-hidden bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 font-['Inter'] text-white"
          style={{ transformOrigin: 'center center' }}
        >
          <div ref={backgroundRef} className="absolute inset-0 z-0">
            {/* Glowing orbs */}
            <div className="absolute top-1/8 left-1/8 w-96 h-96 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/8 right-1/8 w-80 h-80 bg-gradient-to-r from-cyan-600/20 to-green-600/20 rounded-full blur-3xl animate-pulse"></div>
            
            {/* Floating particles */}
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                className={`absolute rounded-full animate-float ${
                  i % 3 === 0 ? 'w-1 h-1 bg-cyan-400/40' :
                  i % 3 === 1 ? 'w-0.5 h-0.5 bg-purple-400/30' :
                  'w-1.5 h-1.5 bg-blue-400/20'
                }`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: `${3 + Math.random() * 2}s`
                }}
              />
            ))}
            
             <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
          </div>

          <header ref={headerRef} className="relative z-10 p-4 sm:p-8 opacity-60 animate-[fadeInDown_1s_ease-out_forwards]">
            <div className="flex justify-end">
              <nav className="flex gap-4 sm:gap-8">
                <button
                  onClick={() => handleNavClick('noteTracker')}
                  className="text-lg sm:text-xl font-bold text-white hover:text-cyan-400 transition-colors duration-300 hover:drop-shadow-[0_0_10px_rgba(34,211,238,0.7)]"
                >
                  noteTracker
                </button>
                <button
                  onClick={() => handleNavClick('passwordManager')}
                  className="text-lg sm:text-xl font-bold text-gray-400 hover:text-purple-400 transition-colors duration-300 hover:drop-shadow-[0_0_10px_rgba(147,51,234,0.7)]"
                >
                  Password Manager
                </button>
              </nav>
            </div>
            <div className="flex justify-end mt-2">
              <p className="text-xs sm:text-sm text-gray-400">Services available</p>
            </div>
          </header>

          <main className="relative z-10 flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <h1
                ref={heroTextRef}
                className="text-4xl sm:text-6xl md:text-8xl font-bold bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-purple-600 drop-shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:drop-shadow-[0_0_50px_rgba(34,211,238,0.5)] transition-all duration-500"
              >
              </h1>
                <h2
               className="text-lg sm:text-2xl md:text-3xl font-medium
               text-blue-400 tracking-wide 
               underline decoration-blue-300/70 underline-offset-4 
               drop-shadow-[0_0_10px_rgba(168,85,247,0.3)]"
               >Welcomes You!...
              </h2>
            </div>
          </main>

          {/* Footer */}
<footer className="absolute bottom-6 left-0 right-0 px-6 flex justify-center items-end z-10">
  {/* Inline styles for animations */}
  <style>
    {`
      @keyframes fadeInOut {
        0% { opacity: 0; transform: translateY(10px); }
        20% { opacity: 1; transform: translateY(0); }
        80% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(10px); }
      }
      .fade-in-out {
        animation: fadeInOut 4s ease-in-out infinite;
      }
    `}
  </style>

  {/* Centered Scroll hint */}
  <div
    ref={scrollTextRef}
    className="absolute left-1/2 transform -translate-x-1/2 text-cyan-400 font-medium cursor-pointer hover:text-cyan-300 transition-colors duration-300 fade-in-out text-center"
    onClick={handleScrollClick}
  >
    <p>login/Signup</p>
    <div className="w-6 h-6 mx-auto mt-2 border-r-2 border-b-2 border-cyan-400 transform rotate-45"></div>
  </div>

  {/* Powered by (bottom-right corner) */}
  <div
    ref={footerTextRef}
    className="absolute right-6 text-gray-400 text-sm opacity-80 flex items-center gap-2"
  >
    <span>Powered by:</span>
    <span className="font-semibold text-white">sujeet.xyz</span>
  </div>
</footer>


          {/* Scroll indicator */}
          {textAnimationComplete && (
            <div className="absolute right-8 top-1/2 transform -translate-y-1/2 z-20">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-0.5 h-16 bg-gradient-to-b from-transparent via-cyan-400 to-transparent opacity-60"></div> 
                <div className="text-xs text-cyan-400 opacity-60 rotate-90 whitespace-nowrap">SCROLL</div>
              </div>
            </div>
          )}

          {/* Subtle noise overlay for texture */}
          <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath fill='%23ffffff' fill-opacity='0.4' d='M1 3h1v1H1V3zm2-2h1v1H3V1z'%3E%3C/path%3E%3C/svg%3E")`
          }}></div>
        </div>
      </div>
    </div>
  );
}