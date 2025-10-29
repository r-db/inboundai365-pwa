# Media Slots Implementation Guide

## Overview

The PWA Template now includes a comprehensive media slot system that allows the CMS to dynamically inject images, videos, YouTube embeds, and Vimeo embeds into designated placeholders throughout the application.

## Media Slot Locations

### index.html (4 slots)

1. **MEDIA_SLOT_1**: Story Hero Video (Line ~216)
   - Type: Video
   - Accepts: video, youtube, vimeo
   - Dimensions: 16:9
   - Location: Hero section at top of story

2. **MEDIA_SLOT_2**: Chapter 1 Video (Line ~232)
   - Type: Video
   - Accepts: video, youtube, vimeo
   - Dimensions: 16:9
   - Location: Chapter 01 - "Built for the Future"

3. **MEDIA_SLOT_3**: Chapter 2 Image (Line ~268)
   - Type: Image
   - Accepts: image, video
   - Dimensions: 4:3
   - Location: Chapter 02 - "Works Everywhere, Anytime"

4. **MEDIA_SLOT_4**: Chapter 3 Image (Line ~279)
   - Type: Image
   - Accepts: image, video
   - Dimensions: 4:3
   - Location: Chapter 03 - "Beautiful by Design"

### about.html (1 slot)

5. **MEDIA_SLOT_5**: Product Demo Video (Line ~105)
   - Type: Video
   - Accepts: video, youtube, vimeo
   - Dimensions: 16:9
   - Location: "Watch Our Introduction" section

## HTML Structure

Each media slot includes:

```html
<!-- Placeholder with data attributes -->
<div class="story-media-placeholder"
     data-media-slot="MEDIA_SLOT_X"
     data-media-type="video|image"
     data-media-accepts="video,youtube,vimeo,image"
     data-media-dimensions="16:9|4:3">
  <svg>...</svg>
  <p>Video/Image Placeholder #X: Description</p>
</div>

<!-- Hidden inputs for CMS data injection -->
<input type="hidden"
       id="media-slot-X-url"
       data-media-slot-input="MEDIA_SLOT_X"
       value="">
<input type="hidden"
       id="media-slot-X-poster"
       data-media-slot-poster="MEDIA_SLOT_X"
       value="">
```

## CMS Integration

### Configuration Format

The tenant configuration should include a `media_slots` object:

```json
{
  "tenant_id": "example-business",
  "business_name": "Example Business",
  "media_slots": {
    "MEDIA_SLOT_1": {
      "url": "https://youtube.com/watch?v=VIDEO_ID",
      "type": "youtube",
      "title": "Hero Demo Video",
      "alt": "Product demonstration video"
    },
    "MEDIA_SLOT_2": {
      "url": "https://vimeo.com/123456789",
      "type": "vimeo",
      "title": "Product Overview"
    },
    "MEDIA_SLOT_3": {
      "url": "https://cdn.example.com/images/offline-demo.jpg",
      "type": "image",
      "alt": "Offline capability demonstration",
      "title": "Offline Features"
    },
    "MEDIA_SLOT_4": {
      "url": "/videos/design-showcase.mp4",
      "type": "video",
      "poster": "/images/design-poster.jpg",
      "alt": "Modern design showcase"
    },
    "MEDIA_SLOT_5": {
      "url": "https://youtube.com/watch?v=DEMO_ID",
      "type": "youtube",
      "title": "Full Product Demo"
    }
  }
}
```

### Media Object Properties

- `url` (required): The media URL (file, YouTube, or Vimeo)
- `type` (optional): Media type - auto-detected if not provided
  - `youtube`: YouTube embed
  - `vimeo`: Vimeo embed
  - `video`: Direct video file (.mp4, .webm, .ogg, .mov)
  - `image`: Image file (.jpg, .png, .webp, .gif, .svg)
- `poster` (optional): Poster image for video elements
- `alt` (optional): Alt text for accessibility
- `title` (optional): Title attribute for the media element

## Supported Media Types

### 1. YouTube Videos

**URL Formats:**
- `https://youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://youtube.com/embed/VIDEO_ID`
- `https://youtube.com/shorts/VIDEO_ID`

**Generated Element:**
```html
<iframe
  src="https://www.youtube.com/embed/VIDEO_ID"
  class="story-video story-video--embed"
  style="aspect-ratio: 16/9"
  allowfullscreen>
</iframe>
```

### 2. Vimeo Videos

**URL Formats:**
- `https://vimeo.com/VIDEO_ID`
- `https://vimeo.com/video/VIDEO_ID`

**Generated Element:**
```html
<iframe
  src="https://player.vimeo.com/video/VIDEO_ID"
  class="story-video story-video--embed"
  style="aspect-ratio: 16/9"
  allowfullscreen>
</iframe>
```

### 3. Direct Video Files

**Supported Extensions:**
- .mp4 (video/mp4)
- .webm (video/webm)
- .ogg (video/ogg)
- .mov (video/quicktime)

**Generated Element:**
```html
<video
  class="story-video"
  controls
  preload="metadata"
  poster="poster-url-if-provided">
  <source src="video.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>
```

### 4. Images

**Supported Extensions:**
- .jpg, .jpeg
- .png
- .gif
- .webp
- .svg

**Generated Element:**
```html
<img
  src="image.jpg"
  alt="Alt text"
  class="story-image"
  loading="lazy"
  style="width: 100%; height: auto;">
```

## JavaScript API

### Loading Media Slots

The `tenant-loader.js` automatically loads media slots when the tenant configuration is loaded:

```javascript
// Automatically called during configuration load
function loadMediaSlots(config) {
  if (!config.media_slots) return;

  const slots = document.querySelectorAll('[data-media-slot]');
  slots.forEach(slot => {
    const slotId = slot.getAttribute('data-media-slot');
    const mediaData = config.media_slots[slotId];

    if (mediaData && mediaData.url) {
      replaceMediaPlaceholder(slot, mediaData);
    }
  });
}
```

### Manual Media Replacement

You can manually replace a media slot:

```javascript
// Get the placeholder element
const placeholder = document.querySelector('[data-media-slot="MEDIA_SLOT_1"]');

// Define media data
const mediaData = {
  url: 'https://youtube.com/watch?v=VIDEO_ID',
  type: 'youtube',
  title: 'My Video'
};

// Replace placeholder
window.TenantLoader.replaceMediaPlaceholder(placeholder, mediaData);
```

## Auto-Detection

The system automatically detects media types from URLs:

```javascript
function detectMediaType(url) {
  // YouTube: youtube.com, youtu.be
  // Vimeo: vimeo.com
  // Video: .mp4, .webm, .ogg, .mov
  // Image: .jpg, .jpeg, .png, .gif, .webp, .svg
}
```

## Error Handling

### Image Load Errors

When an image fails to load:
1. Error logged to console
2. Image hidden
3. Original placeholder displayed again

```javascript
img.onerror = function() {
  console.error('[TenantLoader] Failed to load image:', url);
  this.style.display = 'none';
  // Show placeholder again
  const placeholder = this.previousElementSibling;
  if (placeholder) {
    placeholder.style.display = '';
  }
};
```

### Invalid URLs

Invalid YouTube/Vimeo URLs:
- Error logged to console
- Placeholder remains visible
- No media element created

## CSS Classes

Media elements use existing CSS classes:

- `.story-video`: Direct video elements
- `.story-video--embed`: Embedded iframe videos (YouTube/Vimeo)
- `.story-video--hero`: Hero section videos
- `.story-image`: Image elements
- `.story-media-placeholder`: Placeholder elements

## Admin Console Integration

### Backend API Response

Your backend should return media slot data in the tenant configuration:

```javascript
// GET /api/subdomain/lookup/:subdomain
{
  "success": true,
  "data": {
    "tenant_id": "abc123",
    "business_name": "Example Business",
    "media_slots": {
      "MEDIA_SLOT_1": {
        "url": "https://youtube.com/watch?v=...",
        "type": "youtube",
        "title": "Hero Video"
      },
      // ... other slots
    }
  }
}
```

### Admin UI Features

The admin console should provide:

1. **Media Slot Manager**
   - List all 5 media slots
   - Show slot ID, type, and location
   - Upload/URL input for each slot

2. **Media Type Selection**
   - Upload file (image/video)
   - YouTube URL
   - Vimeo URL
   - External URL

3. **Optional Fields**
   - Poster image for videos
   - Alt text for accessibility
   - Title/caption

4. **Preview**
   - Live preview of media placement
   - Test different media types
   - Validate URLs

## Testing

### Test Configuration

```javascript
const testConfig = {
  tenant_id: "test",
  business_name: "Test Business",
  media_slots: {
    "MEDIA_SLOT_1": {
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      type: "youtube",
      title: "Test Video"
    },
    "MEDIA_SLOT_3": {
      url: "https://via.placeholder.com/800x600",
      type: "image",
      alt: "Test Image"
    }
  }
};

// Apply test config
window.TenantLoader.loadMediaSlots(testConfig);
```

### Browser Console Testing

```javascript
// Check if slots are detected
document.querySelectorAll('[data-media-slot]').length; // Should return 5

// Get specific slot
const slot1 = document.querySelector('[data-media-slot="MEDIA_SLOT_1"]');

// Test replacement
window.TenantLoader.replaceMediaPlaceholder(slot1, {
  url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
  type: 'youtube'
});
```

## Performance Considerations

1. **Lazy Loading**: Images use `loading="lazy"` attribute
2. **Video Preload**: Videos use `preload="metadata"` to minimize bandwidth
3. **Placeholder Fallback**: Original placeholder remains in DOM (hidden) for error recovery
4. **Aspect Ratios**: Embeds use CSS `aspect-ratio` for proper sizing

## Accessibility

1. **Alt Text**: All images include alt attributes
2. **ARIA Labels**: Videos include aria-label when alt text provided
3. **Titles**: Iframe embeds include descriptive titles
4. **Keyboard Navigation**: All media controls are keyboard accessible

## Future Enhancements

Potential additions:

1. **Multiple Images**: Carousel/gallery support
2. **Video Captions**: VTT subtitle support
3. **Autoplay**: Configurable autoplay for videos
4. **Thumbnails**: Custom thumbnail selection
5. **Cropping**: Client-side image cropping
6. **Filters**: Apply filters/effects to images
7. **Analytics**: Track media engagement

## Troubleshooting

### Media Not Loading

1. Check browser console for errors
2. Verify `media_slots` object exists in config
3. Confirm slot IDs match exactly (case-sensitive)
4. Test URL accessibility in new browser tab
5. Check CORS headers for external media

### YouTube/Vimeo Not Embedding

1. Verify URL format is correct
2. Check if video is public/embeddable
3. Test video ID extraction in console
4. Verify iframe embed permissions

### Images Not Displaying

1. Check image URL is accessible
2. Verify CORS headers allow loading
3. Check image format is supported
4. Test image URL in new browser tab
5. Check for CSP restrictions

## Support

For issues or questions:
- Check browser console for detailed error messages
- Review tenant configuration JSON structure
- Verify all required attributes are present
- Test with known-good media URLs first
