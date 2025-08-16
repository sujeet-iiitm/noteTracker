// import { useState } from "react";
// import { Header } from "./components/Header";
// import { NoteForm, Note } from "./components/NoteForm";
// import { NotesList } from "./components/NotesList";
// import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
// import { Separator } from "./components/ui/separator";
// import { User, BookOpen, Home } from "lucide-react";

// function App() {
//   const [activeTab, setActiveTab] = useState("Notes");
//   const [notes, setNotes] = useState<Note[]>([]);
//   const [editingNote, setEditingNote] = useState<Note | null>(null);

//   const handleSaveNote = (noteData: Omit<Note, 'id' | 'createdAt'>) => {
//     if (editingNote) {
//       // Update existing note
//       setNotes(notes.map(note => 
//         note.id === editingNote.id 
//           ? { ...note, ...noteData }
//           : note
//       ));
//       setEditingNote(null);
//     } else {
//       // Create new note
//       const newNote: Note = {
//         id: crypto.randomUUID(),
//         ...noteData,
//         createdAt: new Date()
//       };
//       setNotes([newNote, ...notes]);
//     }
//   };

//   const handleEditNote = (note: Note) => {
//     setEditingNote(note);
//     setActiveTab("Notes"); // Switch to notes tab for editing
//   };

//   const handleDeleteNote = (id: string) => {
//     setNotes(notes.filter(note => note.id !== id));
//   };

//   const handleCancelEdit = () => {
//     setEditingNote(null);
//   };

//   const renderContent = () => {
//     switch (activeTab) {
//       case "HOME":
//         return (
//           <div className="space-y-6">
//             <Card className="max-w-4xl mx-auto">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-3">
//                   <div className="p-2 bg-blue-600 rounded-lg">
//                     <Home className="h-6 w-6 text-white" />
//                   </div>
//                   Welcome to Daily Notes
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="grid md:grid-cols-3 gap-6">
//                   <div className="text-center space-y-3">
//                     <div className="h-16 w-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto">
//                       <BookOpen className="h-8 w-8 text-white" />
//                     </div>
//                     <div>
//                       <h3 className="font-semibold">Total Notes</h3>
//                       <p className="text-2xl text-blue-600">{notes.length}</p>
//                     </div>
//                   </div>
//                   <div className="text-center space-y-3">
//                     <div className="h-16 w-16 bg-green-600 rounded-lg flex items-center justify-center mx-auto">
//                       <User className="h-8 w-8 text-white" />
//                     </div>
//                     <div>
//                       <h3 className="font-semibold">Days Active</h3>
//                       <p className="text-2xl text-green-600">{new Set(notes.map(note => note.date)).size}</p>
//                     </div>
//                   </div>
//                   <div className="text-center space-y-3">
//                     <div className="h-16 w-16 bg-purple-600 rounded-lg flex items-center justify-center mx-auto">
//                       <BookOpen className="h-8 w-8 text-white" />
//                     </div>
//                     <div>
//                       <h3 className="font-semibold">Recent Activity</h3>
//                       <p className="text-sm text-gray-600">
//                         {notes.length > 0 ? "Last note today" : "No activity yet"}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
            
//             {notes.length > 0 && (
//               <Card className="max-w-4xl mx-auto">
//                 <CardHeader>
//                   <CardTitle>Recent Notes</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-3">
//                     {notes.slice(0, 3).map((note) => (
//                       <div key={note.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
//                         <div className="flex items-center gap-3">
//                           <div className="p-2 bg-indigo-600 rounded-lg">
//                             <BookOpen className="h-4 w-4 text-white" />
//                           </div>
//                           <div>
//                             <h4 className="font-semibold">{note.title}</h4>
//                             <p className="text-sm text-gray-600">{note.date}</p>
//                           </div>
//                         </div>
//                         <button 
//                           onClick={() => handleEditNote(note)}
//                           className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                         >
//                           View →
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>
//             )}
//           </div>
//         );

//       case "Notes":
//         return (
//           <div className="space-y-8">
//             <NoteForm 
//               onSave={handleSaveNote} 
//               editingNote={editingNote}
//               onCancelEdit={handleCancelEdit}
//             />
//             <Separator className="max-w-4xl mx-auto" />
//             <NotesList 
//               notes={notes} 
//               onEdit={handleEditNote}
//               onDelete={handleDeleteNote}
//             />
//           </div>
//         );

//       case "user-details":
//         return (
//           <Card className="max-w-2xl mx-auto">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-3">
//                 <div className="p-2 bg-purple-600 rounded-lg">
//                   <User className="h-6 w-6 text-white" />
//                 </div>
//                 User Details
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-6">
//                 <div className="flex items-center space-x-4">
//                   <div className="h-20 w-20 bg-gray-600 rounded-lg flex items-center justify-center">
//                     <User className="h-10 w-10 text-white" />
//                   </div>
//                   <div>
//                     <h3 className="font-semibold">John Doe</h3>
//                     <p className="text-gray-600">john.doe@example.com</p>
//                     <p className="text-sm text-gray-500">Member since January 2024</p>
//                   </div>
//                 </div>
                
//                 <Separator />
                
//                 <div className="space-y-4">
//                   <h4 className="font-semibold">Statistics</h4>
//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
//                       <p className="text-2xl text-blue-600">{notes.length}</p>
//                       <p className="text-sm text-gray-600">Total Notes</p>
//                     </div>
//                     <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
//                       <p className="text-2xl text-green-600">{new Set(notes.map(note => note.date)).size}</p>
//                       <p className="text-sm text-gray-600">Days with Notes</p>
//                     </div>
//                   </div>
//                 </div>

//                 <Separator />

//                 <div className="space-y-4">
//                   <h4 className="font-semibold">Preferences</h4>
//                   <div className="space-y-3">
//                     <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
//                       <span className="text-sm">Email notifications</span>
//                       <span className="text-sm text-green-600">Enabled</span>
//                     </div>
//                     <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
//                       <span className="text-sm">Theme</span>
//                       <span className="text-sm text-blue-600">Light</span>
//                     </div>
//                     <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
//                       <span className="text-sm">Auto-save</span>
//                       <span className="text-sm text-green-600">Enabled</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         );

//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Header activeTab={activeTab} onTabChange={setActiveTab} />
//       <main className="container mx-auto px-4 py-8 max-w-6xl">
//         {renderContent()}
//       </main>
//     </div>
//   );
// }

// export default App;