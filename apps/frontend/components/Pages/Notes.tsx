import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Edit, Trash2, Search, Calendar, X, FileText } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

interface Note {
  id : string;
  title: string;
  description: string;
  shortNote?: string;
  createdAt : string;
  updatedAt : string;
  userId: string;
}

interface newNotes {
  title: string;
  description: string;
  shortNote?: string;
  userId: string;
}

const userId: string = localStorage.getItem("user") || "";

const Notes: React.FC = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deleteConfirmNote, setDeleteConfirmNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortNote: '',
  });

  useEffect(() => {
  const fetchNotes = async () => {
  try {
    const response = await axios.post<{ notes: Note[] }>(
      'http://localhost:3000/api/notes/allnotes',
      {},
      { withCredentials: true }
    );

    const notes: Note[] = response.data.notes;
    setNotes(notes);
  } catch (error) {
    toast.error('Failed to fetch notes');
    console.error(error);
  }
}
fetchNotes();
},[notes]);

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingNote) {
        // Update existing note
        const updatedNote = {
          ...editingNote,
          ...formData,
          updatedAt: new Date().toISOString(),
        };
        setNotes(notes.map(note => note.id === editingNote.id ? updatedNote : note));
        setEditingNote(null);
      } else {
        // Create new note
        const newNote: newNotes = {
          userId: localStorage.getItem(user?.id || "") || "",
          ...formData,
        };
        setNotes([newNote, ...notes]);
        setIsAddDialogOpen(false);
      }
      
      setFormData({ title: '', description: '', shortNote: '' });
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      description: note.description,
      shortNote: note.shortNote || '',
    });
  };

  const handleDelete = async (noteId: string) => {
    try {
      setNotes(notes.filter(note => note.id !== noteId));
      setDeleteConfirmNote(null);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const closeAllModals = () => {
    setIsAddDialogOpen(false);
    setEditingNote(null);
    setDeleteConfirmNote(null);
    setFormData({ title: '', description: '', shortNote: '' });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>My Notes</h1>
          <p className="text-muted-foreground">
            Manage and organize your daily notes
          </p>
        </div>
        
        <button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Note</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <input
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-3 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
        />
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map((note) => (
          <div key={note.id} className="group bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="line-clamp-2 mb-2">{note.title}</h3>
                  <div className="flex items-center text-muted-foreground mb-3">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span className="text-sm">{formatDate(note.createdAt)}</span>
                  </div>
                </div>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(note)}
                    className="p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmNote(note)}
                    className="p-1 text-muted-foreground hover:text-destructive hover:bg-accent rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-muted-foreground line-clamp-3 mb-3">
                {note.description}
              </p>
              {note.shortNote && (
                <div className="bg-muted rounded-md p-2">
                  <p className="text-sm italic">{note.shortNote}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No notes found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first note.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors inline-flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Note</span>
            </button>
          )}
        </div>
      )}

      {/* Add/Edit Note Modal */}
      {(isAddDialogOpen || editingNote) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background border border-border rounded-lg shadow-lg w-full max-w-lg">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h2>{editingNote ? 'Edit Note' : 'Add New Note'}</h2>
                  <p className="text-muted-foreground">
                    {editingNote ? 'Make changes to your note here.' : 'Create a new note to track your thoughts and ideas.'}
                  </p>
                </div>
                <button
                  onClick={closeAllModals}
                  className="p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="block">Title</label>
                  <input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Enter note title"
                    className="w-full px-3 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="block">Description</label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Enter detailed description"
                    rows={4}
                    className="w-full px-3 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="shortNote" className="block">Short Note (Optional)</label>
                  <input
                    id="shortNote"
                    value={formData.shortNote}
                    onChange={(e) => setFormData({...formData, shortNote: e.target.value})}
                    placeholder="Brief summary or key point"
                    className="w-full px-3 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeAllModals}
                  className="px-4 py-2 border border-border bg-background text-foreground rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  {editingNote ? 'Save Changes' : 'Add Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmNote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background border border-border rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="mb-2">Are you sure?</h2>
              <p className="text-muted-foreground mb-6">
                This action cannot be undone. This will permanently delete your note.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirmNote(null)}
                  className="px-4 py-2 border border-border bg-background text-foreground rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmNote.id)}
                  className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;