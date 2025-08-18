import { useState, useEffect } from "react";
import { Plus, Save, X } from "lucide-react";

export interface Note {
  id: string;
  title: string;
  description: string;
  shortNotes: string;
  date: string;
  createdAt: Date;
}

interface NoteFormProps {
  onSave: (note: Omit<Note, 'id' | 'createdAt'>) => void;
  editingNote?: Note | null;
  onCancelEdit?: () => void;
}

export function NoteForm({ onSave, editingNote, onCancelEdit }: NoteFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [shortNotes, setShortNotes] = useState("");

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title);
      setDescription(editingNote.description);
      setShortNotes(editingNote.shortNotes);
    } else {
      setTitle("");
      setDescription("");
      setShortNotes("");
    }
  }, [editingNote]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    const today = new Date();
    const dateString = today.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    onSave({
      title: title.trim(),
      description: description.trim(),
      shortNotes: shortNotes.trim(),
      date: dateString
    });

    // Reset form if not editing
    if (!editingNote) {
      setTitle("");
      setDescription("");
      setShortNotes("");
    }
  };

  const handleCancel = () => {
    setTitle("");
    setDescription("");
    setShortNotes("");
    onCancelEdit?.();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm w-full max-w-2xl mx-auto">
      <div className="p-6 border-b border-gray-200">
        <h2 className="flex items-center gap-3 text-xl font-semibold">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Plus className="h-5 w-5 text-white" />
          </div>
          {editingNote ? "Edit Note" : "Create Daily Note"}
        </h2>
      </div>
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title..."
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter detailed description..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="shortNotes" className="block text-sm font-medium text-gray-700">
              Short Notes
            </label>
            <textarea
              id="shortNotes"
              value={shortNotes}
              onChange={(e) => setShortNotes(e.target.value)}
              placeholder="Enter quick notes or key points..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="submit" 
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Save className="h-4 w-4" />
              {editingNote ? "Update Note" : "Save Note"}
            </button>
            {editingNote && (
              <button 
                type="button" 
                onClick={handleCancel}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}