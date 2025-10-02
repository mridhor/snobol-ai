"use client";

import { useState, useRef, useEffect } from "react";

interface EditableTextProps {
  children: React.ReactNode;
  editMode: boolean;
  onSave: (html: string) => void;
  className?: string;
  tag?: keyof JSX.IntrinsicElements;
}

export default function EditableText({
  children,
  editMode,
  onSave,
  className = "",
  tag: Tag = "div",
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState("");
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (elementRef.current) {
      setContent(elementRef.current.innerHTML);
    }
  }, [children]);

  const handleFocus = () => {
    if (editMode) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    if (editMode && isEditing) {
      setIsEditing(false);
      if (elementRef.current) {
        const newContent = elementRef.current.innerHTML;
        setContent(newContent);
        onSave(newContent);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      elementRef.current?.blur();
    }
    if (e.key === "Escape") {
      elementRef.current?.blur();
    }
  };

  const editStyles = editMode
    ? {
        border: isEditing ? "2px solid #3b82f6" : "1px dashed #e5e7eb",
        borderRadius: "4px",
        padding: "4px",
        cursor: "text",
        outline: "none",
      }
    : {};

  return (
    <Tag
      ref={elementRef}
      contentEditable={editMode && isEditing}
      suppressContentEditableWarning={true}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={className}
      style={editStyles}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
