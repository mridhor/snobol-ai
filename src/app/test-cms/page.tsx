"use client";

import { useState } from "react";
import Link from "next/link";

export default function TestCMSPage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      // Test 1: Fetch content
      addResult("Testing content API...");
      const contentResponse = await fetch('/api/content');
      const contentData = await contentResponse.json();
      
      if (contentData.success) {
        addResult("✅ Content API working");
      } else {
        addResult("❌ Content API failed");
      }

      // Test 2: Save content
      addResult("Testing save API...");
      const saveResponse = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html: 'Test content from CMS test',
          elementId: 'test-element',
          content: 'Test content from CMS test'
        })
      });
      
      const saveData = await saveResponse.json();
      if (saveData.success) {
        addResult("✅ Save API working");
      } else {
        addResult("❌ Save API failed");
      }

      // Test 3: Content history
      addResult("Testing content history API...");
      const historyResponse = await fetch('/api/content/history?recent=5');
      const historyData = await historyResponse.json();
      
      if (historyData.success) {
        addResult("✅ Content history API working");
      } else {
        addResult("❌ Content history API failed");
      }

      // Test 4: Check if content was saved
      addResult("Verifying content was saved...");
      const verifyResponse = await fetch('/api/content');
      const verifyData = await verifyResponse.json();
      
      if (verifyData.success && verifyData.content['test-element']) {
        addResult("✅ Content persistence working");
      } else {
        addResult("❌ Content persistence failed");
      }

      addResult("🎉 All tests completed!");

    } catch (error) {
      addResult(`❌ Test failed: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">CMS Test Suite</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <button
            onClick={runTests}
            disabled={isRunning}
            className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isRunning ? "Running Tests..." : "Run CMS Tests"}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Results</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500">Click &quot;Run CMS Tests&quot; to start testing</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">CMS Access Points</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <Link href="/" className="underline">Public Site</Link> - Main investor page</li>
            <li>• <Link href="/cms" className="underline">CMS Interface</Link> - Content management system</li>
            <li>• <Link href="/admin" className="underline">Admin Page</Link> - Alternative admin interface</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
