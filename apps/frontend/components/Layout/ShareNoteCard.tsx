import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Share } from 'lucide-react';
import gsap from 'gsap';

interface Note {
  id: string;
  title: string;
  description: string;
  shortNote?: string;
}

function ShareNoteCard({ note }: { note: Note }) {
  const [showCard, setShowCard] = useState(false);
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showCard && cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [showCard]);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        'http://localhost:3000/api/note/shareANote',
        { id: note.id },
        { withCredentials: true }
      );
      setLink(res.data.link);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to share note');
      toast.error("Error occurred while sharing");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setShowCard(false);
    toast.success("Link copied to clipboard");
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowCard(true)}
        className="p-1 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-100 rounded transition-colors"
      >
        <Share className="w-4 h-4" />
      </button>

      {showCard && (
        <div
          ref={cardRef}
          className="absolute z-50 top-10 right-0 bg-white shadow-lg border border-gray-200 rounded-lg p-4 w-72"
        >
          {!link && !error ? (
            <>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Want to share: confirm below
              </h3>
              <div className="flex justify-between">
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                >
                  {loading ? 'Sharing...' : 'Confirm'}
                </button>
                <button
                  onClick={() => setShowCard(false)}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : error ? (
            <div className="text-red-600 font-medium">{error}</div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={link}
                readOnly
                className="flex-1 px-2 py-1 text-sm rounded-md border focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                  bg-white text-black border-gray-300 placeholder-gray-500
                  dark:bg-black dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
                />
              <button
                onClick={handleCopy}
                className="px-2 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition"
              >
                Copy
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ShareNoteCard;

