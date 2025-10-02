"use client";

import { useState, useEffect } from "react";
import { ContentVersion } from "../lib/contentHistory";

export default function ContentHistory() {
  const [history, setHistory] = useState<ContentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/content/history?recent=20');
      const data = await response.json();
      
      if (data.success) {
        setHistory(data.data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'create': return 'bg-green-100 text-green-800';
      case 'update': return 'bg-blue-100 text-blue-800';
      case 'delete': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredHistory = selectedContentId 
    ? history.filter(h => h.contentId === selectedContentId)
    : history;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Loading history...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Content History</h2>
        <button
          onClick={fetchHistory}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700">Filter by content:</label>
        <select
          value={selectedContentId || ''}
          onChange={(e) => setSelectedContentId(e.target.value || null)}
          className="px-3 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All content</option>
          {Array.from(new Set(history.map(h => h.contentId))).map(contentId => (
            <option key={contentId} value={contentId}>{contentId}</option>
          ))}
        </select>
      </div>

      {/* History List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No history found</p>
          </div>
        ) : (
          filteredHistory.map((version) => (
            <div
              key={version.id}
              className="p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-gray-900">{version.contentId}</h3>
                  <p className="text-sm text-gray-600">
                    Version {version.version} • {formatDate(version.updatedAt.toString())}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded ${getChangeTypeColor(version.changeType)}`}>
                    {version.changeType}
                  </span>
                  <span className="text-sm text-gray-500">by {version.updatedBy}</span>
                </div>
              </div>
              
              {version.description && (
                <p className="text-sm text-gray-600 mb-2">{version.description}</p>
              )}
              
              <div className="text-sm text-gray-700">
                <div className="max-h-20 overflow-hidden">
                  <div dangerouslySetInnerHTML={{ __html: version.html }} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{history.length}</div>
          <div className="text-sm text-gray-600">Total Changes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {Array.from(new Set(history.map(h => h.contentId))).length}
          </div>
          <div className="text-sm text-gray-600">Content Items</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {Array.from(new Set(history.map(h => h.updatedBy))).length}
          </div>
          <div className="text-sm text-gray-600">Contributors</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {history.filter(h => h.changeType === 'update').length}
          </div>
          <div className="text-sm text-gray-600">Updates</div>
        </div>
      </div>
    </div>
  );
}
