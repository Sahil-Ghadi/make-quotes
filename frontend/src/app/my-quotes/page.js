'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { quotesAPI } from '../../services/api';
import ProtectedRoute from '../../components/ProtectedRoute';
import Navigation from '../../components/Navigation';

export default function MyQuotesPage() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newQuote, setNewQuote] = useState({ text: '', author: '' });
  const [editingQuote, setEditingQuote] = useState(null);
  const [editForm, setEditForm] = useState({ text: '', author: '' });
  const [submitting, setSubmitting] = useState(false);
  const { getIdToken } = useAuth();

  useEffect(() => {
    fetchMyQuotes();
  }, []);

  const fetchMyQuotes = async () => {
    try {
      setLoading(true);
      setError('');
      const token = await getIdToken();
      if (token) {
        const data = await quotesAPI.getMyQuotes(token);
        setQuotes(data);
      }
    } catch (error) {
      setError('Failed to fetch your quotes');
      console.error('Error fetching quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newQuote.text.trim() || !newQuote.author.trim()) return;

    try {
      setSubmitting(true);
      const token = await getIdToken();
      if (token) {
        await quotesAPI.createQuote(newQuote, token);
        setNewQuote({ text: '', author: '' });
        await fetchMyQuotes();
      }
    } catch (error) {
      setError('Failed to create quote');
      console.error('Error creating quote:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (quote) => {
    setEditingQuote(quote.id);
    setEditForm({ text: quote.text, author: quote.author });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editForm.text.trim() || !editForm.author.trim()) return;

    try {
      setSubmitting(true);
      const token = await getIdToken();
      if (token) {
        await quotesAPI.updateQuote(editingQuote, editForm, token);
        setEditingQuote(null);
        setEditForm({ text: '', author: '' });
        await fetchMyQuotes();
      }
    } catch (error) {
      setError('Failed to update quote');
      console.error('Error updating quote:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (quoteId) => {
    if (!confirm('Are you sure you want to delete this quote?')) return;

    try {
      const token = await getIdToken();
      if (token) {
        await quotesAPI.deleteQuote(quoteId, token);
        await fetchMyQuotes();
      }
    } catch (error) {
      setError('Failed to delete quote');
      console.error('Error deleting quote:', error);
    }
  };

  const cancelEdit = () => {
    setEditingQuote(null);
    setEditForm({ text: '', author: '' });
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navigation />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Quotes
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your personal collection of quotes
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={() => setError('')}
                className="mt-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Add New Quote Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Add New Quote
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="quoteText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quote Text
                </label>
                <textarea
                  id="quoteText"
                  rows={3}
                  value={newQuote.text}
                  onChange={(e) => setNewQuote({ ...newQuote, text: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your quote..."
                  required
                />
              </div>
              <div>
                <label htmlFor="quoteAuthor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Author
                </label>
                <input
                  type="text"
                  id="quoteAuthor"
                  value={newQuote.author}
                  onChange={(e) => setNewQuote({ ...newQuote, author: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter author name..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting || !newQuote.text.trim() || !newQuote.author.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                {submitting ? 'Saving...' : 'Save Quote'}
              </button>
            </form>
          </div>

          {/* Quotes List */}
          {quotes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-600 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No quotes yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Add your first quote using the form above!
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {quotes.map((quote) => (
                <div
                  key={quote.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                >
                  {editingQuote === quote.id ? (
                    <form onSubmit={handleUpdate} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Quote Text
                        </label>
                        <textarea
                          rows={3}
                          value={editForm.text}
                          onChange={(e) => setEditForm({ ...editForm, text: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Author
                        </label>
                        <input
                          type="text"
                          value={editForm.author}
                          onChange={(e) => setEditForm({ ...editForm, author: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                          required
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-md font-medium transition-colors"
                        >
                          {submitting ? 'Updating...' : 'Update'}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <blockquote className="text-lg text-gray-900 dark:text-white mb-4">
                        "{quote.text}"
                      </blockquote>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            — {quote.author}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Created: {new Date(quote.created_at).toLocaleDateString()}
                            {quote.updated_at !== quote.created_at && (
                              <span> • Updated: {new Date(quote.updated_at).toLocaleDateString()}</span>
                            )}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(quote)}
                            className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(quote.id)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}


