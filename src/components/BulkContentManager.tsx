"use client";

import { useState } from "react";
import { useContent } from "../hooks/useContent";

export default function BulkContentManager() {
  const { getContent } = useContent();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const contentSections = [
    { id: "hero-title", label: "Hero Title" },
    { id: "hero-subtitle", label: "Hero Subtitle" },
    { id: "hero-cta", label: "Hero CTA Button" },
    { id: "exec-summary-title", label: "Executive Summary Title" },
    { id: "exec-summary-intro", label: "Executive Summary Intro" },
    { id: "exec-summary-list", label: "Executive Summary List" },
    { id: "philosophy-title", label: "Philosophy Title" },
    { id: "philosophy-list", label: "Philosophy List" },
    { id: "process-title", label: "Process Title" },
    { id: "signal-layer-title", label: "Signal Layer Title" },
    { id: "signal-layer-list", label: "Signal Layer List" },
    { id: "filter-layer-title", label: "Filter Layer Title" },
    { id: "filter-layer-list", label: "Filter Layer List" },
    { id: "action-layer-title", label: "Action Layer Title" },
    { id: "action-layer-list", label: "Action Layer List" },
    { id: "community-title", label: "Community Title" },
    { id: "community-intro", label: "Community Intro" },
    { id: "community-list", label: "Community List" },
    { id: "community-cta", label: "Community CTA" },
    { id: "vision-title", label: "Vision Title" },
    { id: "vision-intro", label: "Vision Intro" },
    { id: "vision-list", label: "Vision List" },
    { id: "vision-ask", label: "Vision Ask" },
    { id: "footer-email", label: "Footer Email" },
    { id: "footer-copyright", label: "Footer Copyright" },
  ];

  const handleSelectAll = () => {
    if (selectedItems.length === contentSections.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(contentSections.map(section => section.id));
    }
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedItems.length === 0) return;

    setIsProcessing(true);
    
    try {
      switch (bulkAction) {
        case "export":
          await handleExport();
          break;
        case "reset":
          await handleReset();
          break;
        case "backup":
          await handleBackup();
          break;
        default:
          console.log("Unknown bulk action:", bulkAction);
      }
    } catch (error) {
      console.error("Bulk action failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = async () => {
    const exportData = selectedItems.map(id => ({
      id,
      content: getContent(id, ""),
      label: contentSections.find(s => s.id === id)?.label
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `snobol-content-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = async () => {
    if (!confirm(`Are you sure you want to reset ${selectedItems.length} content items? This action cannot be undone.`)) {
      return;
    }

    // Reset to default content (you'd implement this based on your default content)
    for (const itemId of selectedItems) {
      // This would reset to default content - implement based on your needs
      console.log(`Resetting ${itemId} to default content`);
    }
  };

  const handleBackup = async () => {
    const backupData = selectedItems.map(id => ({
      id,
      content: getContent(id, ""),
      label: contentSections.find(s => s.id === id)?.label,
      timestamp: new Date().toISOString()
    }));

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `snobol-content-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Bulk Content Management</h2>
        <p className="text-gray-600">Manage multiple content items at once</p>
      </div>

      {/* Selection Controls */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              {selectedItems.length === contentSections.length ? "Deselect All" : "Select All"}
            </button>
            <span className="text-sm text-gray-600">
              {selectedItems.length} of {contentSections.length} selected
            </span>
          </div>
        </div>

        {/* Content List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
          {contentSections.map((section) => (
            <label
              key={section.id}
              className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedItems.includes(section.id)}
                onChange={() => handleSelectItem(section.id)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{section.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Actions</h3>
        
        <div className="flex items-center space-x-4 mb-4">
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select an action...</option>
            <option value="export">Export Selected</option>
            <option value="backup">Backup Selected</option>
            <option value="reset">Reset to Default</option>
          </select>
          
          <button
            onClick={handleBulkAction}
            disabled={!bulkAction || selectedItems.length === 0 || isProcessing}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? "Processing..." : "Execute Action"}
          </button>
        </div>

        {selectedItems.length > 0 && (
          <div className="text-sm text-gray-600">
            <p>Selected items:</p>
            <ul className="list-disc list-inside ml-4 mt-1">
              {selectedItems.map(id => (
                <li key={id}>{contentSections.find(s => s.id === id)?.label}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Export All</h4>
          <p className="text-sm text-blue-700 mb-3">Download all content as JSON</p>
          <button
            onClick={() => {
              setSelectedItems(contentSections.map(s => s.id));
              setBulkAction("export");
              handleBulkAction();
            }}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
          >
            Export All
          </button>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-green-900 mb-2">Backup All</h4>
          <p className="text-sm text-green-700 mb-3">Create a backup of all content</p>
          <button
            onClick={() => {
              setSelectedItems(contentSections.map(s => s.id));
              setBulkAction("backup");
              handleBulkAction();
            }}
            className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
          >
            Backup All
          </button>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-semibold text-yellow-900 mb-2">Content Stats</h4>
          <p className="text-sm text-yellow-700 mb-3">
            Total: {contentSections.length} items
          </p>
          <div className="text-xs text-yellow-600">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}
