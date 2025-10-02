# Snobol.ai Deployment Strategy

## 🎯 Overview
Separate the public investor site from the admin editing interface with different domains and deployment strategies.

## 🌐 Domain Structure

### Public Site (snobol.ai)
- **Domain**: `snobol.ai` (main domain)
- **Purpose**: Static investor one-pager
- **Features**: 
  - Clean, professional design
  - No edit functionality
  - Fast loading
  - SEO optimized

### Admin Site (admin.snobol.ai)
- **Domain**: `admin.snobol.ai` (subdomain)
- **Purpose**: Content management interface
- **Features**:
  - Authentication required
  - Full edit functionality
  - Preview mode
  - Content saving to database

## 🚀 Deployment Options

### Option 1: Single Vercel Project (Recommended)
```
snobol.ai → / (public site)
admin.snobol.ai → /admin (admin site)
```

**Pros:**
- Single codebase
- Shared components
- Easy maintenance
- Cost effective

**Implementation:**
1. Deploy to Vercel
2. Configure custom domains
3. Set up authentication for `/admin`
4. Use middleware for route protection

### Option 2: Separate Projects
```
snobol.ai → Public Vercel project
admin.snobol.ai → Admin Vercel project
```

**Pros:**
- Complete separation
- Independent deployments
- Different tech stacks possible

**Cons:**
- Code duplication
- More complex maintenance
- Higher costs

## 🔧 Implementation Steps

### 1. Current Setup (Single Project)
```
/Users/muhammadridho/snobol-ai/
├── src/app/page.tsx          # Public site (static)
├── admin/page.tsx            # Admin site (editable)
├── src/components/EditableText.tsx
└── src/app/api/save/route.ts
```

### 2. Vercel Configuration
Create `vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/admin",
      "destination": "/admin/page"
    }
  ],
  "headers": [
    {
      "source": "/admin",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

### 3. Authentication Setup
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Check for authentication
    const token = request.cookies.get('auth-token')
    
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*'
}
```

## 🗄️ Database Integration

### Content Storage
```typescript
// Database schema
interface ContentBlock {
  id: string
  content: string
  html: string
  updatedAt: Date
  updatedBy: string
}

// Example: Supabase integration
const { data, error } = await supabase
  .from('content_blocks')
  .update({ 
    content: html,
    html: html,
    updatedAt: new Date(),
    updatedBy: userId
  })
  .eq('id', elementId)
```

### API Endpoints
```typescript
// /api/save/route.ts
export async function POST(request: NextRequest) {
  const { html, elementId, content } = await request.json()
  
  // Save to database
  await saveContent({
    id: elementId,
    content: html,
    html: html,
    updatedAt: new Date(),
    updatedBy: getCurrentUser()
  })
  
  return NextResponse.json({ success: true })
}
```

## 🔐 Security Considerations

### Authentication
- **Admin Access**: Secure login for Kristian
- **Session Management**: JWT tokens or session cookies
- **Rate Limiting**: Prevent abuse

### Content Security
- **XSS Protection**: Sanitize HTML content
- **CSRF Protection**: Validate requests
- **Input Validation**: Check content before saving

### Access Control
```typescript
// Example: Role-based access
const userRoles = {
  'kristian@snobol.ai': 'admin',
  'editor@snobol.ai': 'editor'
}

// Check permissions
if (userRoles[userEmail] !== 'admin') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
}
```

## 📊 Monitoring & Analytics

### Public Site
- **Analytics**: Google Analytics, Vercel Analytics
- **Performance**: Core Web Vitals
- **SEO**: Search Console

### Admin Site
- **Usage**: Edit frequency, content changes
- **Security**: Login attempts, failed saves
- **Performance**: Edit mode responsiveness

## 🚀 Deployment Commands

### Development
```bash
# Start development server
npm run dev

# Access public site
http://localhost:3000

# Access admin site
http://localhost:3000/admin
```

### Production
```bash
# Deploy to Vercel
vercel --prod

# Configure domains
vercel domains add snobol.ai
vercel domains add admin.snobol.ai
```

## 🔄 Content Sync Strategy

### Option 1: Real-time Updates
- Admin changes immediately reflect on public site
- Use Supabase real-time subscriptions
- Instant content updates

### Option 2: Staged Updates
- Admin changes saved to draft
- Review and approve changes
- Deploy to public site on approval

### Option 3: Scheduled Updates
- Admin changes queued
- Deploy updates at specific times
- Content versioning

## 📋 Next Steps

1. **Set up authentication** for admin access
2. **Configure database** (Supabase recommended)
3. **Deploy to Vercel** with custom domains
4. **Set up monitoring** and analytics
5. **Test content editing** workflow
6. **Configure backup** and recovery

## 🎯 Benefits of This Approach

### For Public Site
- ✅ Fast loading (static content)
- ✅ SEO optimized
- ✅ No edit functionality visible
- ✅ Professional appearance

### For Admin Site
- ✅ Secure editing interface
- ✅ Full content control
- ✅ Preview functionality
- ✅ Change tracking

### For Development
- ✅ Single codebase
- ✅ Shared components
- ✅ Easy maintenance
- ✅ Cost effective

This strategy gives you the best of both worlds: a fast, professional public site and a secure, powerful admin interface for content management.
