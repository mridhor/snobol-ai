"use client";

import { useState } from "react";
import SharedPageContent from "../../components/SharedPageContent";
import { useContent } from "../../hooks/useContent";

export default function AdminPage() {
  const [editMode, setEditMode] = useState(true); // Always in edit mode for admin
  const [isAuthenticated, setIsAuthenticated] = useState(false); // TODO: Add auth
  const { saveContent } = useContent();

  const handleSave = async (html: string, elementId?: string) => {
    if (!elementId) return;
    
    try {
      await saveContent(html, elementId);
      console.log("Content saved and refreshed:", elementId);
    } catch (error) {
      console.error("Error saving content:", error);
    }
  };

  // Simple auth check - replace with proper authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Snobol Admin
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Sign in to edit the site content
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
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Admin Header */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => setEditMode(!editMode)}
          className={`px-4 py-2 rounded text-sm font-medium transition ${
            editMode
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {editMode ? "Preview Mode" : "Edit Mode"}
        </button>
        <button
          onClick={() => setIsAuthenticated(false)}
          className="px-4 py-2 rounded text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      <SharedPageContent 
        isAdmin={true} 
        editMode={editMode} 
        onSave={handleSave} 
      />
    </>
  );
}
