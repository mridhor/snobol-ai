"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Subscriber {
  id: string;
  email: string;
  subscribed_at: string;
}

export default function AdminDashboard() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const router = useRouter();

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const response = await fetch('/api/admin/subscribers');
      
      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }

      const data = await response.json();
      
      if (response.ok) {
        setSubscribers(data.subscribers || []);
        setTotal(data.total || 0);
      } else {
        setError(data.error || 'Failed to fetch subscribers');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/admin/login');
    }
  };

  const exportCSV = () => {
    const headers = ['Email', 'Subscribed At'];
    const csvContent = [
      headers.join(','),
      ...subscribers.map(sub => [
        sub.email,
        new Date(sub.subscribed_at).toLocaleString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `snobol-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading subscribers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Email Subscribers</h1>
            <p className="mt-2 text-gray-600">Total: {total} subscribers</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={exportCSV}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Export CSV
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Subscribers Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {subscribers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No subscribers found</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {subscribers.map((subscriber) => (
                <li key={subscriber.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {subscriber.email}
                      </p>
                      <p className="text-sm text-gray-500">
                        Subscribed: {new Date(subscriber.subscribed_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Refresh Button */}
        <div className="mt-6 text-center">
          <button
            onClick={fetchSubscribers}
            className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-md text-sm font-medium"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}