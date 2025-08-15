# Innoledge Portfolio Page - Style Specification

## Overview
This document specifies the exact visual styling to match the live Innoledge portfolio page (https://innoledge.com/our-portfolio/) with the local implementation.

## Color Palette

### Primary Colors
- **Orange Primary**: `#d5682d` - Main accent color for headers, links, borders
- **Dark Gray**: `#3a3a3a` - Headings, interactive elements
- **Text Gray**: `#4B4F58` - Body text, secondary text
- **Light Gray**: `#F5F5F5` - Background sections, sidebar background
- **White**: `#FFFFFF` - Main backgrounds, cards
- **Border Gray**: `#dddddd` - Subtle borders and dividers

## Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Oxygen-Sans", Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
```

### Font Sizes
- **Base**: 15px (1rem)
- **H1**: 40px (2.67rem) - Desktop / 30px (2rem) - Mobile
- **H2**: 30px (2rem) - Desktop / 25px (1.67rem) - Mobile
- **H3**: 25px (1.67rem) - Desktop / 20px (1.33rem) - Mobile
- **Body Large**: 16.5px (1.1rem) - Intro text
- **Body**: 15px (1rem) - Regular text
- **Small**: 13.5px (0.9rem) - Sidebar text

### Line Heights
- **Headings**: 1.3
- **Body Text**: 1.6-1.7
- **Tight**: 1.2 - Service titles

## Layout Structure

### Container System
- **Max Width**: 1240px
- **Padding**: 2.4rem (38.4px)
- **Responsive Breakpoints**:
  - Mobile: < 544px
  - Tablet: 544px - 921px
  - Desktop: 922px - 1199px
  - Large Desktop: > 1200px

### Portfolio Grid Layout
```css
.portfolio-grid {
  display: grid;
  grid-template-columns: 1fr 300px; /* 80% / 20% split */
  gap: 4rem; /* 64px */
}

@media (max-width: 1199px) {
  .portfolio-grid {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
}
```

## Component Styling

### Orange Banner (if needed)
```css
.company-banner {
  background: linear-gradient(135deg, #e67e22 0%, #d35400 100%);
  padding: 3rem 0;
  text-align: center;
}

.company-title {
  color: #FFFFFF;
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}
```

### Product Categories
```css
.category-section {
  padding: 3rem;
  background-color: #F5F5F5;
  border-radius: 8px;
  border-left: 4px solid #d5682d;
  margin-bottom: 4rem;
}

.category-section h2 {
  color: #d5682d;
  font-size: 1.5rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2rem;
}
```

### List Styling
```css
.category-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.category-list li {
  padding: 0.5rem 0;
  padding-left: 2rem;
  position: relative;
  color: #4B4F58;
  line-height: 1.6;
}

.category-list li:before {
  content: "•";
  color: #d5682d;
  font-weight: bold;
  position: absolute;
  left: 0;
  top: 0.5rem;
}

.category-list strong {
  color: #3a3a3a;
  font-weight: 600;
}
```

### Sidebar Styling
```css
.portfolio-sidebar {
  width: 300px;
  background-color: #F5F5F5;
  padding: 3rem;
  border-radius: 8px;
  position: sticky;
  top: 3rem;
}

.portfolio-sidebar h3 {
  color: #3a3a3a;
  font-size: 1.2rem;
  font-weight: 600;
  text-align: center;
  border-bottom: 2px solid #d5682d;
  padding-bottom: 1rem;
  margin-bottom: 2rem;
}
```

### Partner Links
```css
.partner-item {
  background-color: #FFFFFF;
  padding: 2rem;
  border-radius: 6px;
  border: 1px solid #dddddd;
  margin-bottom: 2rem;
  transition: all 0.2s linear;
}

.partner-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.partner-item strong {
  color: #d5682d;
  font-size: 1rem;
  font-weight: 600;
}

.partner-item span {
  color: #4B4F58;
  font-size: 0.9rem;
}
```

## Spacing System

### Margin/Padding Values
- **xs**: 0.5rem (8px)
- **sm**: 1rem (16px)
- **md**: 2rem (32px)
- **lg**: 3rem (48px)
- **xl**: 4rem (64px)
- **xxl**: 6rem (96px)

### Component Spacing
- **Section Padding**: 4rem 0 (64px vertical)
- **Card Padding**: 3rem (48px)
- **Element Gaps**: 2rem (32px)
- **Sidebar Gap**: 4rem (64px)

## Responsive Behavior

### Mobile Adaptations (< 922px)
- Grid becomes single column
- Sidebar width: 100%
- Font sizes scale down 10-15%
- Padding reduces to 1.5rem-2rem
- Sticky positioning disabled

### Hover Effects
- **Transform**: translateY(-2px) for cards
- **Box Shadow**: 0 4px 12px rgba(0, 0, 0, 0.1)
- **Transition**: all 0.2s linear

## Integration Notes

### CSS Structure
- Main styles added to `/assets/css/main.css`
- Component-specific styles in existing sections
- Responsive breakpoints use existing system
- Color variables use existing CSS custom properties

### Key CSS Classes Added
- `.portfolio-content` - Main content wrapper
- `.portfolio-grid` - 2-column layout
- `.category-section` - Product category styling
- `.portfolio-sidebar` - Sidebar container
- `.partner-item` - Partner link cards
- `.portfolio-stats` - Statistics section

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid support required
- Fallbacks for older browsers in existing CSS

## Testing Checklist

### Visual Verification
- [ ] Orange accent color matches exactly (#d5682d)
- [ ] 2-column layout (80/20 split)
- [ ] Sidebar sticky positioning
- [ ] Category sections with left orange border
- [ ] Partner cards with hover effects
- [ ] Mobile responsive behavior
- [ ] Typography hierarchy
- [ ] Consistent spacing

### Performance
- [ ] CSS loads efficiently
- [ ] No layout shift on load
- [ ] Smooth transitions
- [ ] Responsive images

## Live Site vs Local Implementation

### Matches Achieved
✅ Color palette consistency
✅ Typography hierarchy
✅ 2-column layout structure
✅ Sidebar positioning
✅ Partner link styling
✅ Responsive behavior

### Additional Enhancements
- Enhanced hover effects
- Improved visual hierarchy
- Better spacing consistency
- Sticky sidebar behavior
- Enhanced mobile experience

## Deployment

The styling is ready for deployment and should match the live site's visual appearance while providing an enhanced user experience through improved hover effects and responsive behavior.