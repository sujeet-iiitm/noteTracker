import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Edit, Trash2, Search, BookOpen, X, Loader, NotebookPen } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const darkMode: boolean = localStorage.getItem('theme') === 'dark';

interface Subject {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

const Subjects: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deleteConfirmSubject, setDeleteConfirmSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [subjectTitle, setSubjectTitle] = useState('');

  // Fetch subjects on component mount
  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/note/allSubjects', {
        withCredentials: true,
      });
      
      const subjectsData = response.data.subjects || [];
      setSubjects(subjectsData);
      setLoading(false);
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        logout();
        navigate('/login');
      } else {
        toast.error('Error fetching subjects');
        console.error('Error fetching subjects:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredSubjects = subjects.filter((subject) =>
    subject.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subjectTitle.trim()) {
      toast.error('Subject name is required');
      return;
    }

    setSubmitting(true);
    try {
      if (editingSubject) {
        // Update existing subject
        const response = await axios.put(
          'http://localhost:3000/api/note/updateSubject',
          {
            subjectId : editingSubject.id,
            newTitle : subjectTitle,
          },
          { withCredentials: true }
        );

        setSubjects(
          subjects.map((subject) =>
            subject.id === editingSubject.id
              ? {
                  ...subject,
                  title: subjectTitle,
                  updatedAt: new Date().toISOString(),
                }
              : subject
          )
        );

        toast.success(response.data.message || 'Subject updated successfully');
        setEditingSubject(null);
      } else {
        // Create new subject
        const response = await axios.post(
          'http://localhost:3000/api/note/createSubject',
          { title: subjectTitle},
          { withCredentials: true }
        );

        toast.success(response.data.message || 'Subject created successfully');
        setIsAddDialogOpen(false);
        
        await fetchSubjects();
      }

      setSubjectTitle('');
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        logout();
        navigate('/login');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.error || 'Invalid input');
      } else {
        toast.error(error.response?.data?.error || 'Error saving subject. Try again.');
        console.error('Error saving subject:', error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setSubjectTitle(subject.title);
  };

  const handleDelete = async (subjectId: string) => {
    try {
      const response = await axios.delete(`http://localhost:3000/api/note/deleteSubject`, {
        data: { subjectId : subjectId },
        withCredentials: true,
      });

      setSubjects(subjects.filter((subject) => subject.id !== subjectId));
      toast.success(response.data.message || 'Subject deleted successfully');
      setDeleteConfirmSubject(null);
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        logout();
        navigate('/login');
      } else {
        toast.error(error.response?.data?.error || 'Error deleting subject. Try again.');
        console.error('Error deleting subject:', error);
      }
    }
  };

  const handleSubjectClick = (subjectId: string) => {
    navigate(`/dashboard/subject/${encodeURIComponent(subjectId)}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const closeAllModals = () => {
    setIsAddDialogOpen(false);
    setEditingSubject(null);
    setDeleteConfirmSubject(null);
    setSubjectTitle('');
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="flex items-center space-x-2">
          <Loader className="w-6 h-6 animate-spin" />
          <span>Loading subjects...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>My Subjects</h1>
          <p className="text-muted-foreground">Organize your notes by subjects</p>
        </div>

        <button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Search */}
      {subjects.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            placeholder="Search subjects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full pl-10 pr-3 py-2 
            ${darkMode
              ? 'bg-black text-white border-gray-600 placeholder-gray-400'
              : 'bg-white text-black border-gray-300 placeholder-gray-500'}
            border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent`}          />
        </div>
      )}

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubjects.map((subject) => (
          <div
            key={subject.id}
            className="group bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <div className="p-6" onClick={() => handleSubjectClick(subject.id)}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-3">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <h3 className="line-clamp-2">{subject.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Created {formatDate(subject.createdAt)}
                  </p>
                </div>
                <div 
                  className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleEdit(subject)}
                    className="p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmSubject(subject)}
                    className="p-1 text-muted-foreground hover:text-destructive hover:bg-accent rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSubjects.length === 0 && !loading && (
        <div className="text-center py-12">
          <NotebookPen className="mx-auto h-12 w-12 text-muted-foreground mb-4"></NotebookPen>
          <h3 className="text-lg font-medium mb-2">No subjects found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm
              ? 'Try adjusting your search terms.'
              : 'Get started by creating your first subject.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors inline-flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Subject</span>
            </button>
          )}
        </div>
      )}

      {/* Add/Edit Subject Modal */}
      {(isAddDialogOpen || editingSubject) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background border border-border rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h2>{editingSubject ? 'Edit Subject' : 'Add New Subject'}</h2>
                  <p className="text-muted-foreground">
                    {editingSubject
                      ? 'Update the subject name.'
                      : 'Create a new subject to organize your notes.'}
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
                  <label htmlFor="subjectTitle" className="block">
                    Subject Name
                  </label>
                  <input
                    id="subjectTitle"
                    value={subjectTitle}
                    onChange={(e) => setSubjectTitle(e.target.value)}
                    placeholder="Enter subject name"
                    className="w-full px-3 py-2 flex-1 px-2 py-1 text-sm rounded-md border focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                    bg-white text-black border-gray-300 placeholder-gray-500
                    dark:bg-black dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
                    required
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
                  disabled={submitting}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>{editingSubject ? 'Updating...' : 'Creating...'}</span>
                    </>
                  ) : (
                    <span>{editingSubject ? 'Save Changes' : 'Add Subject'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmSubject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background border border-border rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="mb-2">Are you sure?</h2>
              <p className="text-muted-foreground mb-6">
                This action cannot be undone. This will permanently delete the subject "
                {deleteConfirmSubject.title}" and all notes within it.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirmSubject(null)}
                  className="px-4 py-2 border border-border bg-background text-foreground rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmSubject.id)}
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

export default Subjects;