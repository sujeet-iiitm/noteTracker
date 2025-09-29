import { useParams } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import gsap from 'gsap';

interface Note {
  title: string;
  description: string;
  shortNote?: string;
  createdAt : string;
  expiryTime : Date;
}
function ViewSharedNote() {
  const { slug } = useParams();
  const [note, setNote] = useState<Note>();
  const [error, setError] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

const now = new Date();
const expiry = note?.expiryTime ? new Date(note.expiryTime) : null;
const remainingTime = expiry ? expiry.getTime() - now.getTime() : null;
const remainingHours = remainingTime ? Math.floor(remainingTime / (1000 * 60 * 60)) : null;

  useEffect(() => {
    async function fetchNote() {
      try {
        const res = await axios.get(`http://localhost:3000/api/note/viewNote/${slug}`);
        setNote(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Something went wrong');
        toast.error("Error Occurred");
      }
    }
    fetchNote();
  }, [slug]);

  useEffect(() => {
    if (note && containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );
    }
  }, [note]);

  if (error) return (
    <div className="flex items-center justify-center h-screen bg-red-50 text-red-600 text-lg font-semibold">
      {error}
    </div>
  );

  if (!note) return (
    <div className="flex items-center justify-center h-screen text-gray-500 text-lg animate-pulse">
      Loading shared note...
    </div>
  );

  return (
<div
  ref={containerRef}
  className="min-h-screen bg-black flex items-center justify-center px-4 py-12"
>
  <div className="max-w-2xl w-full bg-white shadow-lg rounded-xl border border-gray-200">
    <div className="p-6 space-y-6">

      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center">
        <div className="sm:w-32 text-gray-500 font-medium mb-1 sm:mb-0">Title</div>
        <div className="flex-1 text-gray-900 font-semibold break-words">{note.title}</div>
      </div>

      {/* Date */}
      <div className="flex flex-col sm:flex-row sm:items-center">
        <div className="sm:w-32 text-gray-500 font-medium mb-1 sm:mb-0">Created At</div>
        <div className="flex-1 text-gray-700 break-words">
          {new Date(note.createdAt).toLocaleString()}
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col sm:flex-row sm:items-start">
        <div className="sm:w-32 text-gray-500 font-medium mb-1 sm:mb-0">Description</div>
        <div className="flex-1 text-gray-800 leading-relaxed break-words">
          {note.description}
        </div>
      </div>

      {/* Short Note */}
      {note.shortNote && (
        <div className="flex flex-col sm:flex-row sm:items-start">
          <div className="sm:w-32 text-gray-500 font-medium mb-1 sm:mb-0">Short Note</div>
          <div className="flex-1">
            <blockquote className="bg-gray-50 border-l-4 border-indigo-500 p-3 rounded-md italic text-gray-700 break-words">
              {note.shortNote}
            </blockquote>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="pt-4 text-xs text-gray-400 border-t">
        {`This note was shared anonymously and will expire after: ${remainingHours}`}
      </div>

    </div>
  </div>
</div>

  );
}

export default ViewSharedNote;
