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

  const baseProps = {
    contentEditable: editMode && isEditing,
    suppressContentEditableWarning: true,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onKeyDown: handleKeyDown,
    className,
    style: editStyles,
    dangerouslySetInnerHTML: { __html: content },
  };

  switch (tag) {
    case "h1":
      return <h1 ref={elementRef as React.RefObject<HTMLHeadingElement>} {...baseProps} />;
    case "h2":
      return <h2 ref={elementRef as React.RefObject<HTMLHeadingElement>} {...baseProps} />;
    case "h3":
      return <h3 ref={elementRef as React.RefObject<HTMLHeadingElement>} {...baseProps} />;
    case "h4":
      return <h4 ref={elementRef as React.RefObject<HTMLHeadingElement>} {...baseProps} />;
    case "p":
      return <p ref={elementRef as React.RefObject<HTMLParagraphElement>} {...baseProps} />;
    case "span":
      return <span ref={elementRef as React.RefObject<HTMLSpanElement>} {...baseProps} />;
    case "button":
      return <button ref={elementRef as React.RefObject<HTMLButtonElement>} {...baseProps} />;
    case "ul":
      return <ul ref={elementRef as React.RefObject<HTMLUListElement>} {...baseProps} />;
    case "li":
      return <li ref={elementRef as React.RefObject<HTMLLIElement>} {...baseProps} />;
    default:
      return <div ref={elementRef as React.RefObject<HTMLDivElement>} {...baseProps} />;
  }
}
