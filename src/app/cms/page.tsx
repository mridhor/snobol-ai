"use client";

import { useState } from "react";
import { useContent } from "../../hooks/useContent";
import CMSInterface from "../../components/CMSInterface";
import ContentHistory from "../../components/ContentHistory";
import BulkContentManager from "../../components/BulkContentManager";
import SharedPageContent from "../../components/SharedPageContent";

export default function CMSPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [viewMode, setViewMode] = useState<"cms" | "preview" | "history" | "bulk">("cms");
  const [refreshKey, setRefreshKey] = useState(0);
  const { saveContent } = useContent();

  // Handle save with immediate refresh
  const handleSaveWithRefresh = async (html: string, elementId: string) => {
    await saveContent(html, elementId);
    // Trigger refresh by updating the key
    setRefreshKey(prev => prev + 1);
  };

  // Simple authentication - replace with proper auth
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Snobol CMS
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Sign in to manage website content
            </p>
          </div>
          <form className="mt-8 space-y-6">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
            <div>
              <button
                type="button"
                onClick={() => setIsAuthenticated(true)}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign in to CMS
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Snobol CMS</h1>
              <p className="text-sm text-gray-600">Content Management System</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("cms")}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    viewMode === "cms"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  CMS Interface
                </button>
                <button
                  onClick={() => setViewMode("preview")}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    viewMode === "preview"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Live Preview
                </button>
                <button
                  onClick={() => setViewMode("history")}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    viewMode === "history"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  History
                </button>
                <button
                  onClick={() => setViewMode("bulk")}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    viewMode === "bulk"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Bulk Manager
                </button>
              </div>
              <button
                onClick={() => setIsAuthenticated(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        {viewMode === "cms" ? (
          <div className="flex h-[calc(100vh-120px)]">
            {/* Left Pane - CMS Interface */}
            <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
              <CMSInterface onSave={handleSaveWithRefresh} />
            </div>
            
            {/* Right Pane - Live Preview */}
            <div className="w-1/2 bg-gray-50 flex flex-col">
              <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Live Preview</h2>
                <p className="text-sm text-gray-600">Real-time preview of your changes</p>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div key={refreshKey} className="h-full">
                  <SharedPageContent isAdmin={false} />
                </div>
              </div>
            </div>
          </div>
        ) : viewMode === "preview" ? (
          <div className="p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Live Preview</h2>
              <p className="text-gray-600">Preview how your changes will appear on the public site</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border">
              <iframe
                src="/"
                className="w-full h-screen border-0 rounded-lg"
                title="Live Preview"
              />
            </div>
          </div>
        ) : viewMode === "history" ? (
          <div className="p-6">
            <ContentHistory />
          </div>
        ) : (
          <div className="p-6">
            <BulkContentManager />
          </div>
        )}
      </div>
    </div>
  );
}
