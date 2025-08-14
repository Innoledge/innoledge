# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Modern static site for **Innoledge International Ltd.** - a migrated WordPress site specializing in Asia trade and investments with focus on Health, Cosmetics, and Agro-Food business. This is a complete rewrite using modern web technologies with multilingual support and component-based architecture.

## Development Commands

### Local Development
```bash
# Start development server
npm run dev
# Opens http://localhost:8000

# Alternative methods
python3 -m http.server 8000
npx http-server
```

### Build and Deploy
```bash
# Build for production
npm run build
# Creates optimized files in ./dist/

# Extract content from original site
npm run extract-content

# Deploy to GitHub Pages
npm run deploy
```

### Content Management
```bash
# Optimize images
npm run optimize-images
```

## Architecture Overview

### Multi-language Static Site Architecture
- **Component-based**: Reusable HTML components with template placeholders
- **Data-driven**: JSON content files for each language (`content-en.json`, `content-fr.json`, `content-zh.json`)
- **Modern CSS**: Grid/Flexbox layouts with custom properties
- **Vanilla JavaScript**: Progressive enhancement with modular functions
- **Build system**: Node.js build script that copies and optimizes static files

### Key Architectural Patterns

1. **Template System**: HTML components use `{{placeholder}}` syntax for dynamic content injection
2. **Language Structure**: 
   - English: `/` (homepage), `/en/` (other pages)
   - French: `/fr/`
   - Chinese: `/zh/`
3. **Asset Organization**: Modern `/assets/` structure with organized CSS, JS, and images
4. **Form Handling**: Formspree integration (`https://formspree.io/f/myzedzbl`) for static site contact forms

## Project Structure

```
├── index.html                  # English homepage
├── en/                        # English pages (non-homepage)
├── fr/                        # French version
├── zh/                        # Chinese version
├── assets/
│   ├── css/
│   │   ├── main.css          # Core styles with CSS Grid/Flexbox
│   │   └── components.css    # Component-specific styles
│   ├── js/
│   │   ├── main.js          # Core functionality (mobile menu, forms, etc.)
│   │   ├── contact-form.js  # Form validation and submission
│   │   └── language-switcher.js # Language switching logic
│   └── images/              # Optimized images and icons
├── components/              # Reusable HTML components
│   ├── header.html         # Navigation with template placeholders
│   ├── footer.html         # Footer component
│   ├── contact-form.html   # Contact form with validation
│   └── services-grid.html  # Service grid layout
├── data/                   # Content JSON files
│   ├── content-en.json    # English content and navigation
│   ├── content-fr.json    # French translations
│   └── content-zh.json    # Chinese translations
├── templates/             # Build templates
└── scripts/
    └── build.js          # Node.js build script
```

## Content Management System

### JSON Data Structure
Content is organized in language-specific JSON files with consistent structure:
- `site`: Global site information (title, language, locale)
- `navigation`: Menu labels and URLs
- `homepage`: Homepage-specific content and service links
- `services`: Service category details
- `contact`: Contact form labels and content

### Component Template System
HTML components use placeholder syntax for dynamic content:
- `{{siteName}}` - Site title
- `{{nav.home}}` - Navigation labels
- `{{homeUrl}}` - Dynamic URLs based on language
- `{{homeActive}}` - Active state classes

## Build System

The `scripts/build.js` file handles:
1. **Clean**: Empties `dist/` directory
2. **Copy Assets**: Transfers CSS, JS, images, and static files
3. **Generate Pages**: Copies all HTML files recursively
4. **Meta Files**: Creates robots.txt, .nojekyll, and 404.html for GitHub Pages

### Build Configuration
- Source: Current directory (`.`)
- Output: `dist/` directory
- Excludes: `node_modules`, `.git`, build directory itself

## Key Technical Details

### CSS Architecture
- **Custom Properties**: Color scheme defined in `:root`
- **Primary Color**: `#d5682d` (orange accent)
- **Responsive Design**: Mobile-first approach with modern breakpoints
- **Component Isolation**: Separate files for main styles and components

### JavaScript Features
- **Mobile Menu**: Responsive navigation toggle
- **Form Validation**: Real-time validation for contact forms
- **Smooth Scrolling**: Enhanced navigation experience
- **Lazy Loading**: Performance optimization for images
- **Accessibility**: ARIA labels and keyboard navigation

### Form Integration
- **Formspree Endpoint**: Static-friendly form processing
- **Multi-language**: Form labels and validation messages per language
- **Validation**: Client-side validation with server-side fallback
- **Spam Protection**: Honeypot field integration

## Deployment

### GitHub Pages Setup
1. **Source**: GitHub Actions (automated via `.github/workflows/`)
2. **Custom Domain**: `CNAME` file configured for `innoledge.com`
3. **Build Process**: Automated deployment on push to main branch

### Important Notes
- No package.json dependencies - pure static site
- Build script uses Node.js but no runtime dependencies
- GitHub Pages compatible with .nojekyll file
- Forms require Formspree account for production use

## Development Workflow

### Adding New Content
1. Update relevant JSON file in `/data/`
2. Modify HTML templates if needed
3. Test locally with development server
4. Build and deploy

### Adding New Languages
1. Create new content file: `/data/content-[lang].json`
2. Create new directory: `/[lang]/`
3. Update language switcher in components
4. Add hreflang tags to head component

### Modifying Styles
- Core styles: `/assets/css/main.css`
- Component styles: `/assets/css/components.css`
- Follow existing CSS custom property system
- Maintain responsive design principles