import { useState } from "react";
import { Edit, Eye, Trash2, Calendar, FileText, StickyNote, X } from "lucide-react";
import { Note } from "./NoteForm";

interface NotesListProps {
  notes: Note[];
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

export function NotesList({ notes, onEdit, onDelete }: NotesListProps) {
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [deletingNote, setDeletingNote] = useState<Note | null>(null);

  // Group notes by date
  const notesByDate = notes.reduce((acc, note) => {
    const date = note.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(note);
    return acc;
  }, {} as Record<string, Note[]>);

  const sortedDates = Object.keys(notesByDate).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  const handleDelete = () => {
    if (deletingNote) {
      onDelete(deletingNote.id);
      setDeletingNote(null);
    }
  };

  if (notes.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm w-full max-w-4xl mx-auto">
        <div className="p-12 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-gray-100 rounded-full">
              <StickyNote className="h-16 w-16 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">No notes yet</h3>
              <p className="text-gray-600">Create your first daily note to get started!</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {sortedDates.map((date) => (
          <div key={date} className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="flex items-center gap-3 text-xl font-semibold">
                <div className="p-2 bg-green-600 rounded-lg">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                {date}
                <span className="ml-auto px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                  {notesByDate[date].length} note{notesByDate[date].length !== 1 ? 's' : ''}
                </span>
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {notesByDate[date].map((note) => (
                  <div key={note.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-blue-600 rounded-lg">
                            <FileText className="h-4 w-4 text-white" />
                          </div>
                          <h4 className="font-semibold">{note.title}</h4>
                        </div>
                        {note.description && (
                          <p className="text-sm text-gray-600 ml-8 line-clamp-2">
                            {note.description}
                          </p>
                        )}
                        {note.shortNotes && (
                          <div className="ml-8 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                            <strong>Quick notes:</strong> {note.shortNotes.length > 100 ? note.shortNotes.substring(0, 100) + "..." : note.shortNotes}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => setViewingNote(note)}
                          className="p-2 border border-gray-300 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onEdit(note)}
                          className="p-2 border border-gray-300 rounded-lg hover:bg-green-50 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeletingNote(note)}
                          className="p-2 border border-gray-300 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View Note Modal */}
      {viewingNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-xl font-semibold">
                  <FileText className="h-5 w-5" />
                  {viewingNote.title}
                </h2>
                <button
                  onClick={() => setViewingNote(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full border border-gray-300">
                  {viewingNote.date}
                </span>
              </div>
              {viewingNote.description && (
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {viewingNote.description}
                  </p>
                </div>
              )}
              {viewingNote.shortNotes && (
                <div>
                  <h4 className="font-semibold mb-2">Short Notes</h4>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-sm whitespace-pre-wrap">
                      {viewingNote.shortNotes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2">Delete Note</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{deletingNote.title}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeletingNote(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}