import { Notebook } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage({ onComplete }: { onComplete: () => void }) {
  const heroTextRef = useRef<HTMLHeadingElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const hasNavigatedRef = useRef(false);
  const timeoutsRef = useRef<number[]>([]);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const [textAnimationComplete, setTextAnimationComplete] = useState(false);
  const navigate = useNavigate();

  const clearStoredTimeouts = () => {
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];
  };

  const goToLoginWithAnimation = () => {
    if (hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;

    if (contentRef.current) {
      contentRef.current.style.transition = "all 420ms ease-in-out";
      contentRef.current.style.opacity = "0";
      contentRef.current.style.transform = "scale(0.97) translateY(-10px)";
    }

    const t = window.setTimeout(() => {
      try {
        onComplete();
      } finally {
        navigate("/login");
      }
    }, 200);
    timeoutsRef.current.push(t);
  };

  useEffect(() => {
    const heroText = "NoteTracker";
    const heroElement = heroTextRef.current;

    if (heroElement) {
      heroElement.innerHTML = "";
      const words = heroText.split(" ");

      words.forEach((word, wordIndex) => {
        const wordSpan = document.createElement("span");
        wordSpan.style.display = "inline-block";
        wordSpan.style.marginRight = "0.5em";

        word.split("").forEach((char, charIndex) => {
          const span = document.createElement("span");
          span.textContent = char;
          span.style.display = "inline-block";
          span.style.opacity = "0";
          span.style.transform = `translate(${(Math.random() - 0.5) * 360}px, ${
            (Math.random() - 0.5) * 160
          }px) rotate(${(Math.random() - 0.5) * 90}deg) scale(${
            Math.random() * 0.8 + 0.6
          })`;
          span.style.transition =
            "all 1.0s cubic-bezier(0.2, 1, 0.2, 1)";
          span.style.transitionDelay = `${wordIndex * 80 + charIndex * 35}ms`;

          wordSpan.appendChild(span);
        });

        heroElement.appendChild(wordSpan);
      });

      const startT = window.setTimeout(() => {
        const spans = heroElement.querySelectorAll("span span");
        spans.forEach((span: any) => {
          span.style.opacity = "1";
          span.style.transform = "translate(0, 0) rotate(0deg) scale(1)";
        });
      }, 150);
      timeoutsRef.current.push(startT);

      const completeT = window.setTimeout(() => {
        setTextAnimationComplete(true);
      }, 1400);
      timeoutsRef.current.push(completeT);
    }

    const handleScroll = () => {
      if (hasNavigatedRef.current) return;
      if (!textAnimationComplete) return;

      const scrollY = window.scrollY;
      const maxScroll = window.innerHeight * 2;
      const progress = Math.min(scrollY / maxScroll, 1);

      if (contentRef.current) {
        const scale = 1 - progress * 0.28;
        const opacity = Math.max(0.05, 1 - progress * 0.95);
        const blur = Math.min(6, progress * 4);

        contentRef.current.style.transform = `scale(${scale})`;
        contentRef.current.style.opacity = `${opacity}`;
        contentRef.current.style.filter = `blur(${blur}px)`;
      }

      if (progress > 0.45) {
        goToLoginWithAnimation();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearStoredTimeouts();
    };
  }, [textAnimationComplete, navigate, onComplete]);

  const handleNavClick = (path: "noteTracker" | "passwordManager") => {
    if (path === "noteTracker") {
      goToLoginWithAnimation();
    } else {
      goToLoginWithAnimation();
    }
  };

  return (
    <div className="relative w-full">
      <div style={{ height: "200vh" }} className="relative">
        <div
          ref={contentRef}
          className="fixed inset-0 overflow-hidden bg-black font-['Inter'] text-white"
          style={{ transformOrigin: "center center", transition: "transform 200ms ease, opacity 200ms ease" }}
        >
          <div ref={backgroundRef} className="absolute inset-0 z-0">
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

          {/* Header */}
          <header className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Notebook className="h-8 w-8 text-pink-500" />
              <span className="text-base sm:text-lg font-semibold text-pink-500">
                notetracker.sujeet.xyz
              </span>
            </div>
          <div className="flex flex-col items-center">
            {/* Main box */}
            <div className="flex flex-col items-center bg-gray-900 rounded-lg px-6 py-4 gap-5 justify-center shadow-md w-full max-w-md">
              <nav className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                <button
                  onClick={() => handleNavClick("noteTracker")}
                  className="text-lg font-bold text-white hover:text-cyan-400 transition-colors duration-200"
                >
                  noteTracker
                </button>
          
                {/* Divider line between nav buttons */}
                <div className="hidden sm:block h-6 border-l border-gray-600"></div>
          
                <button
                  onClick={() => handleNavClick("passwordManager")}
                  className="text-lg font-bold text-gray-400 hover:text-purple-400 transition-colors duration-200"
                >
                  Password Manager
                </button>
              </nav>
            </div>
          
            {/* Text below, aligned right */}
            <p className="text-sm text-gray-300 mt-2 text-right w-full max-w-md font-medium tracking-wide pr-2">
              Services available
            </p>
          </div>
          </header>

          <main className="relative z-10 flex flex-col md:flex-row items-center justify-between min-h-[70vh] px-6 sm:px-12 gap-8">
            {/* Left Text */}
            <div className="w-full md:w-1/2 max-w-2xl text-left">
              <h1
                ref={heroTextRef}
                className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight"
                aria-hidden={false}
              />
              <p className="mt-5 text-xl sm:text-2xl text-red-400">
                Capture What You Learn—Every Day
              </p>

              <div className="mt-8 flex items-center gap-4">
                <button
                  onClick={() => goToLoginWithAnimation()}
                  className="px-6 py-3 border-2 border-yellow-400 text-yellow-400 font-semibold hover:bg-yellow-400 hover:text-black transition-all rounded-md"
                >
                  TRY IT
                </button>
              </div>
            </div>

            <div className="w-full md:w-[420px] flex-shrink-0 flex justify-center">
              <div className="w-full max-w-xl md:max-w-[420px]">
                <img
                  src="/Notes.gif"
                  alt="Notes preview"
                  className="w-full h-auto rounded-2xl shadow-2xl"
                  loading="lazy"
                />
              </div>
            </div>
          </main>

          {/* Footer */}
            <footer className="absolute bottom-6 left-0 right-0 px-6 flex justify-between items-end z-10">
              <div />
              <div className="text-gray-400 text-sm opacity-80 flex items-center gap-2">
                <span>Powered by:</span>
                <span
                  title="Visit Owner's website"
                  onClick={() => window.open('https://sujeet.xyz', '_blank')}
                  className="font-semibold text-white cursor-pointer hover:underline hover:text-blue-400 transition duration-200"
                >
                  sujeet.xyz
                </span>
              </div>
            </footer>

        </div>
      </div>
    </div>
  );
}