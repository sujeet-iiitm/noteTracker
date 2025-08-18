import { useState } from "react";
import { Header } from "@repo/ui/src/Header";
import { NoteForm, Note } from "@repo/ui/src/NoteForm";
import { NotesList } from "@repo/ui/src/NotesList";
import { User, BookOpen, Home } from "lucide-react";

function App() {
  const [activeTab, setActiveTab] = useState("Notes");
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const handleSaveNote = (noteData: Omit<Note, 'id' | 'createdAt'>) => {
    if (editingNote) {
      // Update existing note
      setNotes(notes.map(note => 
        note.id === editingNote.id 
          ? { ...note, ...noteData }
          : note
      ));
      setEditingNote(null);
    } else {
      // Create new note
      const newNote: Note = {
        id: crypto.randomUUID(),
        ...noteData,
        createdAt: new Date()
      };
      setNotes([newNote, ...notes]);
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setActiveTab("Notes"); // Switch to notes tab for editing
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "HOME":
        return (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm max-w-4xl mx-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="flex items-center gap-3 text-xl font-semibold">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Home className="h-6 w-6 text-white" />
                  </div>
                  Welcome to Daily Notes
                </h2>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center space-y-3">
                    <div className="h-16 w-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto">
                      <BookOpen className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Total Notes</h3>
                      <p className="text-2xl text-blue-600 font-bold">{notes.length}</p>
                    </div>
                  </div>
                  <div className="text-center space-y-3">
                    <div className="h-16 w-16 bg-green-600 rounded-lg flex items-center justify-center mx-auto">
                      <User className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Days Active</h3>
                      <p className="text-2xl text-green-600 font-bold">{new Set(notes.map(note => note.date)).size}</p>
                    </div>
                  </div>
                  <div className="text-center space-y-3">
                    <div className="h-16 w-16 bg-purple-600 rounded-lg flex items-center justify-center mx-auto">
                      <BookOpen className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Recent Activity</h3>
                      <p className="text-sm text-gray-600">
                        {notes.length > 0 ? "Last note today" : "No activity yet"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {notes.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm max-w-4xl mx-auto">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold">Recent Notes</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {notes.slice(0, 3).map((note) => (
                      <div key={note.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-600 rounded-lg">
                            <BookOpen className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{note.title}</h4>
                            <p className="text-sm text-gray-600">{note.date}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleEditNote(note)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          View →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case "Notes":
        return (
          <div className="space-y-8">
            <NoteForm 
              onSave={handleSaveNote} 
              editingNote={editingNote}
              onCancelEdit={handleCancelEdit}
            />
            <div className="max-w-4xl mx-auto border-t border-gray-200"></div>
            <NotesList 
              notes={notes} 
              onEdit={handleEditNote}
              onDelete={handleDeleteNote}
            />
          </div>
        );

      case "user-details":
        return (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm max-w-2xl mx-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="flex items-center gap-3 text-xl font-semibold">
                <div className="p-2 bg-purple-600 rounded-lg">
                  <User className="h-6 w-6 text-white" />
                </div>
                User Details
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="h-20 w-20 bg-gray-600 rounded-lg flex items-center justify-center">
                    <User className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">John Doe</h3>
                    <p className="text-gray-600">john.doe@example.com</p>
                    <p className="text-sm text-gray-500">Member since January 2024</p>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-semibold mb-4">Statistics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{notes.length}</p>
                      <p className="text-sm text-gray-600">Total Notes</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{new Set(notes.map(note => note.date)).size}</p>
                      <p className="text-sm text-gray-600">Days with Notes</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-semibold mb-4">Preferences</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-sm font-medium">Email notifications</span>
                      <span className="text-sm text-green-600 font-medium">Enabled</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-sm font-medium">Theme</span>
                      <span className="text-sm text-blue-600 font-medium">Light</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-sm font-medium">Auto-save</span>
                      <span className="text-sm text-green-600 font-medium">Enabled</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;