"use client";

import { useState } from "react";
import { useContent } from "../hooks/useContent";
// import { ContentBlock } from "../lib/content";

interface CMSInterfaceProps {
  onSave: (html: string, elementId: string) => Promise<void>;
}

export default function CMSInterface({ onSave }: CMSInterfaceProps) {
  const { content, loading, getContent } = useContent();
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const contentSections = [
    { id: "hero-title", label: "Hero Title", type: "text" },
    { id: "hero-subtitle", label: "Hero Subtitle", type: "text" },
    { id: "hero-cta", label: "Hero CTA Button", type: "text" },
    { id: "exec-summary-title", label: "Executive Summary Title", type: "text" },
    { id: "exec-summary-intro", label: "Executive Summary Intro", type: "html" },
    { id: "exec-summary-list", label: "Executive Summary List", type: "html" },
    { id: "philosophy-title", label: "Philosophy Title", type: "text" },
    { id: "philosophy-list", label: "Philosophy List", type: "html" },
    { id: "process-title", label: "Process Title", type: "text" },
    { id: "signal-layer-title", label: "Signal Layer Title", type: "text" },
    { id: "signal-layer-list", label: "Signal Layer List", type: "html" },
    { id: "filter-layer-title", label: "Filter Layer Title", type: "text" },
    { id: "filter-layer-list", label: "Filter Layer List", type: "html" },
    { id: "action-layer-title", label: "Action Layer Title", type: "text" },
    { id: "action-layer-list", label: "Action Layer List", type: "html" },
    { id: "community-title", label: "Community Title", type: "text" },
    { id: "community-intro", label: "Community Intro", type: "html" },
    { id: "community-list", label: "Community List", type: "html" },
    { id: "community-cta", label: "Community CTA", type: "text" },
    { id: "vision-title", label: "Vision Title", type: "text" },
    { id: "vision-intro", label: "Vision Intro", type: "html" },
    { id: "vision-list", label: "Vision List", type: "html" },
    { id: "vision-ask", label: "Vision Ask", type: "html" },
    { id: "footer-email", label: "Footer Email", type: "text" },
    { id: "footer-copyright", label: "Footer Copyright", type: "text" },
  ];

  const handleEdit = (contentId: string) => {
    setSelectedContent(contentId);
    setEditValue(getContent(contentId, ""));
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!selectedContent) return;
    
    try {
      await onSave(editValue, selectedContent);
      setIsEditing(false);
      setSelectedContent(null);
      setEditValue("");
    } catch (error) {
      console.error("Error saving content:", error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedContent(null);
    setEditValue("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Loading content...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Management System</h1>
        <p className="text-gray-600">Manage all content for the Snobol.ai website</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Content Sections</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {contentSections.map((section) => (
              <div
                key={section.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedContent === section.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleEdit(section.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{section.label}</h3>
                    <p className="text-sm text-gray-700 mt-1">
                      {getContent(section.id, "No content").substring(0, 50)}...
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${
                    section.type === "html" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-blue-100 text-blue-800"
                  }`}>
                    {section.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Editor */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Content Editor</h2>
          
          {isEditing && selectedContent ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {contentSections.find(s => s.id === selectedContent)?.label}
                </label>
                
                {contentSections.find(s => s.id === selectedContent)?.type === "html" ? (
                  <div className="space-y-2">
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                      placeholder="Enter HTML content..."
                    />
                    <div className="text-xs text-gray-500">
                      HTML allowed. Use &lt;strong&gt; for bold, &lt;em&gt; for italic, etc.
                    </div>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                    placeholder="Enter text content..."
                  />
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>

              {/* Preview */}
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Preview:</h3>
                <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                  <div className="text-gray-900" dangerouslySetInnerHTML={{ __html: editValue || "No content" }} />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Select a content section to edit</p>
            </div>
          )}
        </div>
      </div>

      {/* Content Statistics */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Content Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total Sections:</span>
            <span className="ml-2 font-medium text-gray-900">{contentSections.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Last Updated:</span>
            <span className="ml-2 font-medium text-gray-900">
              {Object.values(content).length > 0 
                ? new Date(Math.max(...Object.values(content).map(c => new Date(c.updatedAt).getTime()))).toLocaleDateString()
                : "Never"
              }
            </span>
          </div>
          <div>
            <span className="text-gray-600">Updated By:</span>
            <span className="ml-2 font-medium text-gray-900">
              {Object.values(content).length > 0 
                ? Object.values(content).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0].updatedBy
                : "System"
              }
            </span>
          </div>
          <div>
            <span className="text-gray-600">Status:</span>
            <span className="ml-2 font-medium text-green-600">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
