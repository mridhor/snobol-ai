"use client";

import { useState, useRef } from "react";

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const elementRef = useRef<any>(null);

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

  const commonProps = {
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
      return <h1 ref={elementRef} {...commonProps}>{children}</h1>;
    case "h2":
      return <h2 ref={elementRef} {...commonProps}>{children}</h2>;
    case "h3":
      return <h3 ref={elementRef} {...commonProps}>{children}</h3>;
    case "h4":
      return <h4 ref={elementRef} {...commonProps}>{children}</h4>;
    case "p":
      return <p ref={elementRef} {...commonProps}>{children}</p>;
    case "span":
      return <span ref={elementRef} {...commonProps}>{children}</span>;
    case "button":
      return <button ref={elementRef} {...commonProps}>{children}</button>;
    case "ul":
      return <ul ref={elementRef} {...commonProps}>{children}</ul>;
    case "li":
      return <li ref={elementRef} {...commonProps}>{children}</li>;
    default:
      return <div ref={elementRef} {...commonProps}>{children}</div>;
  }
}
