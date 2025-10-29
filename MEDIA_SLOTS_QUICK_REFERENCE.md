# Media Slots Quick Reference

## Slot IDs & Locations

| Slot ID | Page | Location | Type | Accepts |
|---------|------|----------|------|---------|
| `MEDIA_SLOT_1` | index.html | Story Hero (line 216) | Video | video, youtube, vimeo |
| `MEDIA_SLOT_2` | index.html | Chapter 1 (line 232) | Video | video, youtube, vimeo |
| `MEDIA_SLOT_3` | index.html | Chapter 2 (line 268) | Image | image, video |
| `MEDIA_SLOT_4` | index.html | Chapter 3 (line 279) | Image | image, video |
| `MEDIA_SLOT_5` | about.html | Video Section (line 105) | Video | video, youtube, vimeo |

## Configuration Format

```json
{
  "media_slots": {
    "MEDIA_SLOT_1": {
      "url": "https://youtube.com/watch?v=VIDEO_ID",
      "type": "youtube",
      "title": "Video Title",
      "alt": "Alt text for accessibility"
    }
  }
}
```

## Supported Media Types

### YouTube
```json
{
  "url": "https://youtube.com/watch?v=dQw4w9WgXcQ",
  "type": "youtube"
}
```

### Vimeo
```json
{
  "url": "https://vimeo.com/123456789",
  "type": "vimeo"
}
```

### Video File
```json
{
  "url": "https://cdn.example.com/video.mp4",
  "type": "video",
  "poster": "https://cdn.example.com/poster.jpg"
}
```

### Image
```json
{
  "url": "https://cdn.example.com/image.jpg",
  "type": "image",
  "alt": "Descriptive text"
}
```

## HTML Attributes

```html
<div data-media-slot="MEDIA_SLOT_X"
     data-media-type="video|image"
     data-media-accepts="video,youtube,vimeo,image"
     data-media-dimensions="16:9|4:3">
</div>
```

## JavaScript API

```javascript
// Auto-loaded via tenant config
window.TenantLoader.loadMediaSlots(config);

// Manual replacement
const placeholder = document.querySelector('[data-media-slot="MEDIA_SLOT_1"]');
window.TenantLoader.replaceMediaPlaceholder(placeholder, {
  url: 'https://youtube.com/watch?v=VIDEO_ID',
  type: 'youtube'
});
```

## URL Formats

**YouTube:**
- `https://youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://youtube.com/shorts/VIDEO_ID`

**Vimeo:**
- `https://vimeo.com/VIDEO_ID`
- `https://vimeo.com/video/VIDEO_ID`

**Video Files:**
- `.mp4`, `.webm`, `.ogg`, `.mov`

**Images:**
- `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`

## Testing in Console

```javascript
// Check slots detected
document.querySelectorAll('[data-media-slot]').length; // Should be 5

// Test YouTube embed
const slot = document.querySelector('[data-media-slot="MEDIA_SLOT_1"]');
window.TenantLoader.replaceMediaPlaceholder(slot, {
  url: 'https://youtube.com/watch?v=dQw4w9WgXcQ'
});

// Test image
const slot3 = document.querySelector('[data-media-slot="MEDIA_SLOT_3"]');
window.TenantLoader.replaceMediaPlaceholder(slot3, {
  url: 'https://via.placeholder.com/800x600'
});
```

## Common Issues

| Issue | Solution |
|-------|----------|
| Media not loading | Check browser console, verify URL accessibility |
| YouTube not embedding | Verify video is public/embeddable |
| Images not showing | Check CORS headers, verify URL works in new tab |
| Slot not found | Verify slot ID matches exactly (case-sensitive) |

## CSS Classes

- `.story-video` - Direct video elements
- `.story-video--embed` - Embedded iframes (YouTube/Vimeo)
- `.story-video--hero` - Hero section videos
- `.story-image` - Image elements
- `.story-media-placeholder` - Placeholder elements

## Accessibility Features

- Images: `alt` attribute required
- Videos: `aria-label` when alt provided
- Lazy loading: `loading="lazy"` on images
- Keyboard accessible: All controls navigable via keyboard

## Backend Response Example

```javascript
// GET /api/subdomain/lookup/:subdomain
{
  "success": true,
  "data": {
    "tenant_id": "example",
    "business_name": "Example Business",
    "media_slots": {
      "MEDIA_SLOT_1": {
        "url": "https://youtube.com/watch?v=...",
        "type": "youtube",
        "title": "Hero Video"
      }
    }
  }
}
```

## Admin CMS Requirements

The admin console needs to provide:

1. **Slot Selection** - Dropdown/list of 5 media slots
2. **Media Type** - Choose: Upload, YouTube, Vimeo, URL
3. **URL Input** - Text field for external URLs
4. **File Upload** - For images and video files
5. **Poster Image** - Optional for video files
6. **Alt Text** - Required for accessibility
7. **Preview** - Live preview before saving
8. **Validation** - Check URL format and accessibility

## File Naming Convention

Hidden inputs use consistent naming:
- URL: `media-slot-X-url`
- Poster: `media-slot-X-poster`

Data attributes:
- Slot ID: `data-media-slot="MEDIA_SLOT_X"`
- Input: `data-media-slot-input="MEDIA_SLOT_X"`
- Poster: `data-media-slot-poster="MEDIA_SLOT_X"`
