# Snobol.ai Editable Site Tutorial

## 🎯 Overview
This tutorial shows you how to use the editable Snobol.ai investor site. The site functions as both a static investor page AND a live WYSIWYG editor when edit mode is enabled.

## 🚀 Getting Started

### 1. Start the Development Server
```bash
npm run dev
```
Visit `http://localhost:3000` to see the site.

### 2. Understanding the Interface
- **Normal View**: Professional investor one-pager with all content visible
- **Edit Mode**: Click the "Edit Mode" button (top-right corner) to enable inline editing

## ✏️ How to Edit Content

### Step 1: Enable Edit Mode
1. Look for the **"Edit Mode"** button in the top-right corner
2. Click it to toggle edit mode ON
3. The button will turn blue and show "Exit Edit Mode"

### Step 2: Edit Text Content
When edit mode is active:
1. **Hover over any text** - You'll see a subtle dashed border
2. **Click on any text** to start editing
3. **Type your changes** directly
4. **Press Enter** or **click away** to save
5. **Press Escape** to cancel changes

### Step 3: Visual Feedback
- **Dashed border**: Text is editable (hover state)
- **Blue border**: Currently editing
- **No border**: Normal display mode

## 📝 Editable Elements

### Hero Section
- **Title**: "Snobol.ai"
- **Subtitle**: "Clarity in Crisis. Powered by AI, guided by wisdom."
- **Chart Disclaimer**: "*Past performance in no way guarantees future performance."
- **CTA Button**: "Join the Crisis Contrarians"

### Executive Summary
- **Section Title**: "Executive Summary"
- **Intro Paragraph**: Main description text
- **Bullet Points**: Thesis, Edge, Promise, Vision

### Investment Philosophy
- **Section Title**: "Investment Philosophy"
- **Philosophy List**: 5 key principles

### The Snobol Process
- **Section Title**: "The Snobol Process"
- **Signal Layer**: AI components
- **Filter Layer**: Rules and metrics
- **Action Layer**: Transparency features

### Community
- **Section Title**: "Crisis Contrarians"
- **Intro Text**: Movement description
- **Community List**: Design, Tone, Community, Transparency
- **CTA Button**: "Get Early Access"

### Vision & Ask
- **Section Title**: "Vision & Ask"
- **Vision Text**: Brand building description
- **Goals List**: MVP, Community, Platform
- **Ask Text**: Partnership invitation

### Footer
- **Email**: "📩 hello@snobol.ai"
- **Copyright**: "© 2025 Snobol.ai"

## 🔧 Technical Details

### Content Saving
- All changes are automatically saved to the `/api/save` endpoint
- Each text block has a unique ID for tracking
- Changes are logged with timestamps
- Ready for database integration (Supabase, etc.)

### Keyboard Shortcuts
- **Enter**: Save changes and exit edit mode
- **Escape**: Cancel changes and exit edit mode
- **Click away**: Save changes and exit edit mode

### Edit Mode Toggle
- **ON**: All text becomes editable with visual indicators
- **OFF**: Site displays as normal static page

## 🎨 Design System

### Nordic Minimalism
- **Background**: Clean white
- **Text**: Black with gray accents
- **Accent**: Pastel blue for edit indicators
- **Typography**: Clean, readable fonts
- **Spacing**: Generous white space

### Responsive Design
- **Mobile**: Optimized for small screens
- **Tablet**: Medium screen layouts
- **Desktop**: Full-width layouts

## 🚀 Future Integration

### Figma Design Import
When you're ready to replace the design with your Figma file:
1. Keep the `EditableText` wrapper structure
2. Update styling classes to match Figma design
3. Maintain the same `onSave` callbacks and element IDs
4. Preserve the edit mode functionality

### Database Integration
The API endpoint is ready for:
- **Supabase**: Real-time database
- **PostgreSQL**: Traditional database
- **MongoDB**: Document database
- **Any REST API**: Custom backend

## 🐛 Troubleshooting

### Text Not Visible
- Ensure you're not in edit mode when viewing
- Check that the development server is running
- Verify all components are properly imported

### Edit Mode Not Working
- Make sure you clicked the "Edit Mode" button
- Check browser console for any errors
- Verify the API endpoint is responding

### Changes Not Saving
- Check the browser console for API errors
- Verify the `/api/save` endpoint is working
- Check network tab for failed requests

## 📋 Best Practices

### Content Editing
1. **Save frequently**: Press Enter or click away to save
2. **Test changes**: Toggle edit mode off to see the final result
3. **Use proper formatting**: Bold, italic, lists work in edit mode
4. **Keep it concise**: Short, impactful text works best

### Design Consistency
1. **Maintain hierarchy**: Keep heading sizes consistent
2. **Preserve spacing**: Don't add excessive line breaks
3. **Use lists properly**: Keep bullet points organized
4. **Test responsiveness**: Check on different screen sizes

## 🎯 Next Steps

1. **Test the edit functionality** with sample content changes
2. **Prepare your Figma design** for import
3. **Set up your database** (Supabase recommended)
4. **Configure authentication** for Kristian's access
5. **Deploy to Vercel** for production use

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify all dependencies are installed
3. Ensure the development server is running
4. Check that all file paths are correct

Happy editing! 🚀
