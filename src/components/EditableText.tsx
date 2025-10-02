"use client";

import { useState, useRef, useEffect } from "react";

interface EditableTextProps {
  children: React.ReactNode;
  editMode: boolean;
  onSave: (html: string) => void;
  className?: string;
  tag?: "div" | "h1" | "h2" | "h3" | "h4" | "p" | "span" | "button" | "ul" | "li";
}

export default function EditableText({
  children,
  editMode,
  onSave,
  className = "",
  tag = "div",
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

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

  const baseProps = {
    ref: elementRef,
    contentEditable: editMode && isEditing,
    suppressContentEditableWarning: true,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onKeyDown: handleKeyDown,
    className,
    style: editStyles,
  };

  switch (tag) {
    case "h1":
      return <h1 {...baseProps}>{children}</h1>;
    case "h2":
      return <h2 {...baseProps}>{children}</h2>;
    case "h3":
      return <h3 {...baseProps}>{children}</h3>;
    case "h4":
      return <h4 {...baseProps}>{children}</h4>;
    case "p":
      return <p {...baseProps}>{children}</p>;
    case "span":
      return <span {...baseProps}>{children}</span>;
    case "button":
      return <button {...baseProps}>{children}</button>;
    case "ul":
      return <ul {...baseProps}>{children}</ul>;
    case "li":
      return <li {...baseProps}>{children}</li>;
    default:
      return <div {...baseProps}>{children}</div>;
  }
}
