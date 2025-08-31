import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

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
        axios.get("/api/note/allNotes", { withCredentials: true }),
        axios.get("/api/note/weeklyNotes", { withCredentials: true }),
        axios.get("/api/note/monthlyNotes", { withCredentials: true }),
        axios.get("/api/note/yearlyNotes", { withCredentials: true }),
      ]);
      setNotes({
        allNotes: allRes.data.notes || allRes.data || [],
        weeklyNotes: weekRes.data || [],
        monthlyNotes: monthRes.data || [],
        yearlyNotes: yearRes.data || [],
      });
      fetchedRef.current = true;
    } catch (e) {
      // handle error as needed
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
