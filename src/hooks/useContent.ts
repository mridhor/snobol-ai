import { useState, useEffect, useCallback } from 'react';
import { ContentBlock } from '../lib/content';

export function useContent() {
  const [content, setContent] = useState<Record<string, ContentBlock>>({});
  const [loading, setLoading] = useState(true);

  // Fetch content from the content management system
  const fetchContent = useCallback(async () => {
    try {
      const response = await fetch('/api/content');
      const data = await response.json();
      
      if (data.success) {
        setContent(data.content);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  // Helper function to get content safely
  const getContent = useCallback((id: string, fallback: string = '') => {
    return content[id]?.html || fallback;
  }, [content]);

  // Save content and refresh
  const saveContent = useCallback(async (html: string, elementId: string) => {
    try {
      const response = await fetch("/api/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          html,
          elementId,
          content: html,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save content");
      }

      const result = await response.json();
      console.log("Content saved:", result);

      // Refresh content to get the latest version
      await fetchContent();
      
      return result;
    } catch (error) {
      console.error("Error saving content:", error);
      throw error;
    }
  }, [fetchContent]);

  return {
    content,
    loading,
    getContent,
    saveContent,
    refreshContent: fetchContent
  };
}
