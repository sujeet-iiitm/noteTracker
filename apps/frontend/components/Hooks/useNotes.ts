import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export interface NotesDetails {
  id: string;
  title: string;
  description: string;
  shortNote: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}
export interface NotesGroup {
  allNotes: NotesDetails[];
  weeklyNotes: NotesDetails[];
  monthlyNotes: NotesDetails[];
  yearlyNotes: NotesDetails[];
}

const defaultNotes: NotesGroup = {
  allNotes: [],
  weeklyNotes: [],
  monthlyNotes: [],
  yearlyNotes: [],
};

export function useNotes() {
  const [notes, setNotes] = useState<NotesGroup>(defaultNotes);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false); // cache marker

const fetchNotes = useCallback(async () => {
  setLoading(true);
  try {
    const [allRes, weekRes, monthRes, yearRes] = await Promise.all([
      axios.get<NotesDetails[]>("/api/note/allNotes", { withCredentials: true }),
      axios.get<NotesDetails[]>("/api/note/weeklyNotes", { withCredentials: true }),
      axios.get<NotesDetails[]>("/api/note/monthlyNotes", { withCredentials: true }),
      axios.get<NotesDetails[]>("/api/note/yearlyNotes", { withCredentials: true }),
    ]);

    setNotes({
      allNotes: Array.isArray(allRes.data) ? allRes.data : [],
      weeklyNotes: Array.isArray(weekRes.data) ? weekRes.data : [],
      monthlyNotes: Array.isArray(monthRes.data) ? monthRes.data : [],
      yearlyNotes: Array.isArray(yearRes.data) ? yearRes.data : [],
    });

    fetchedRef.current = true;
  } catch (e) {
    toast.error("Error fetching..");
    console.log("error :", e);
  } finally {
    setLoading(false);
  }
}, []);


  useEffect(() => {
    if (!fetchedRef.current) {
      fetchNotes();
    }
  }, [fetchNotes]);

  // allow manual re-fetch
  return { notes, loading, fetchNotes };
}