# Media Slots Data Flow Diagram

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      Admin Console CMS                           │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Media Slot Manager                                        │  │
│  │                                                             │  │
│  │  [MEDIA_SLOT_1] ◄─── Upload/Link Interface               │  │
│  │  [MEDIA_SLOT_2]      - File Upload                        │  │
│  │  [MEDIA_SLOT_3]      - YouTube URL                        │  │
│  │  [MEDIA_SLOT_4]      - Vimeo URL                          │  │
│  │  [MEDIA_SLOT_5]      - External URL                       │  │
│  │                                                             │  │
│  │  [Preview] [Validate] [Save]                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                               │                                   │
│                               ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Backend API                                               │  │
│  │  POST /api/tenants/:id/media-slots                        │  │
│  │                                                             │  │
│  │  {                                                         │  │
│  │    "MEDIA_SLOT_1": {                                      │  │
│  │      "url": "https://youtube.com/watch?v=...",           │  │
│  │      "type": "youtube",                                   │  │
│  │      "title": "Hero Video",                              │  │
│  │      "alt": "Description"                                │  │
│  │    },                                                      │  │
│  │    ...                                                     │  │
│  │  }                                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                               │                                   │
└───────────────────────────────┼───────────────────────────────────┘
                                │
                                ▼
                    ┌────────────────────────┐
                    │   Database             │
                    │   tenants table        │
                    │   media_slots JSONB    │
                    └────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PWA Template (Frontend)                     │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Page Load                                                 │  │
│  │  1. Detect subdomain (getSubdomain())                     │  │
│  │  2. Fetch tenant config from API                          │  │
│  │     GET /api/subdomain/lookup/:subdomain                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                               │                                   │
│                               ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Tenant Loader (tenant-loader.js)                         │  │
│  │                                                             │  │
│  │  applyConfiguration(config)                               │  │
│  │    ├─ applyThemeColors()                                  │  │
│  │    ├─ updateContent()                                     │  │
│  │    └─ loadMediaSlots(config) ◄────── NEW                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                               │                                   │
│                               ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  loadMediaSlots(config)                                    │  │
│  │                                                             │  │
│  │  1. Find all [data-media-slot] elements                   │  │
│  │  2. For each slot:                                         │  │
│  │     - Get slot ID                                          │  │
│  │     - Get media data from config.media_slots              │  │
│  │     - Call replaceMediaPlaceholder()                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                               │                                   │
│                               ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  replaceMediaPlaceholder(placeholder, mediaData)           │  │
│  │                                                             │  │
│  │  1. Extract: url, poster, type, alt, title               │  │
│  │  2. Detect media type (if not provided)                   │  │
│  │  3. Switch based on type:                                 │  │
│  │     ├─ youtube  → createYouTubeEmbed()                    │  │
│  │     ├─ vimeo    → createVimeoEmbed()                      │  │
│  │     ├─ video    → createVideoElement()                    │  │
│  │     └─ image    → createImageElement()                    │  │
│  │  4. Hide placeholder                                       │  │
│  │  5. Insert media element                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                               │                                   │
│                               ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Media Type Detection & Creation                           │  │
│  │                                                             │  │
│  │  detectMediaType(url)                                     │  │
│  │    ├─ Check for youtube.com/youtu.be → 'youtube'         │  │
│  │    ├─ Check for vimeo.com → 'vimeo'                      │  │
│  │    ├─ Check for .mp4/.webm/.ogg → 'video'               │  │
│  │    └─ Check for .jpg/.png/.webp → 'image'               │  │
│  │                                                             │  │
│  │  createYouTubeEmbed(url, title)                           │  │
│  │    ├─ Extract video ID                                     │  │
│  │    ├─ Create iframe element                               │  │
│  │    ├─ Set src: youtube.com/embed/{ID}                    │  │
│  │    └─ Apply .story-video--embed class                    │  │
│  │                                                             │  │
│  │  createVimeoEmbed(url, title)                             │  │
│  │    ├─ Extract video ID                                     │  │
│  │    ├─ Create iframe element                               │  │
│  │    ├─ Set src: player.vimeo.com/video/{ID}              │  │
│  │    └─ Apply .story-video--embed class                    │  │
│  │                                                             │  │
│  │  createVideoElement(url, poster, alt)                     │  │
│  │    ├─ Create video element                                │  │
│  │    ├─ Add controls, preload="metadata"                   │  │
│  │    ├─ Set poster image (if provided)                     │  │
│  │    └─ Apply .story-video class                           │  │
│  │                                                             │  │
│  │  createImageElement(url, alt, title)                      │  │
│  │    ├─ Create img element                                  │  │
│  │    ├─ Set loading="lazy"                                  │  │
│  │    ├─ Add error handler (restore placeholder)            │  │
│  │    └─ Apply .story-image class                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                               │                                   │
│                               ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  DOM Result                                                │  │
│  │                                                             │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │ <div data-media-slot="MEDIA_SLOT_1" style="display:│  │  │
│  │  │      none">                                         │  │  │
│  │  │   <!-- Hidden placeholder -->                       │  │  │
│  │  │ </div>                                              │  │  │
│  │  │                                                      │  │  │
│  │  │ <iframe class="story-video--embed"                 │  │  │
│  │  │         src="https://youtube.com/embed/VIDEO_ID"   │  │  │
│  │  │         style="aspect-ratio: 16/9">                │  │  │
│  │  │ </iframe>                                           │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Slot Distribution Map

```
┌─────────────────────────────────────────────────────────────────┐
│                         index.html                               │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Story Section                                              │ │
│  │                                                              │ │
│  │  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │ │
│  │  ┃  Story Hero (Full Width)                            ┃ │ │
│  │  ┃                                                       ┃ │ │
│  │  ┃  [MEDIA_SLOT_1]                                     ┃ │ │
│  │  ┃  Video: Hero Demo                                   ┃ │ │
│  │  ┃  Type: video | Accepts: video, youtube, vimeo      ┃ │ │
│  │  ┃  Dimensions: 16:9 (21:9 on hero)                   ┃ │ │
│  │  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │ │
│  │                                                              │ │
│  │  ┌────────────────────┐  ┌───────────────────────────────┐ │ │
│  │  │ [MEDIA_SLOT_2]    │  │  Chapter 01                   │ │ │
│  │  │ Video: Product    │  │  Built for the Future         │ │ │
│  │  │ Overview          │  │                                │ │ │
│  │  │ Type: video       │  │  Content describing the       │ │ │
│  │  │ Accepts: video,   │  │  platform and its features    │ │ │
│  │  │ youtube, vimeo    │  │                                │ │ │
│  │  │ Dimensions: 16:9  │  │                                │ │ │
│  │  └────────────────────┘  └───────────────────────────────┘ │ │
│  │                                                              │ │
│  │  ┌───────────────────────────────┐  ┌────────────────────┐ │ │
│  │  │  Chapter 02                   │  │ [MEDIA_SLOT_3]    │ │ │
│  │  │  Works Everywhere, Anytime    │  │ Image: Offline    │ │ │
│  │  │                                │  │ Capability        │ │ │
│  │  │  Content describing offline   │  │ Type: image       │ │ │
│  │  │  capabilities and reliability │  │ Accepts: image,   │ │ │
│  │  │                                │  │ video             │ │ │
│  │  │                                │  │ Dimensions: 4:3   │ │ │
│  │  └───────────────────────────────┘  └────────────────────┘ │ │
│  │                                                              │ │
│  │  ┌────────────────────┐  ┌───────────────────────────────┐ │ │
│  │  │ [MEDIA_SLOT_4]    │  │  Chapter 03                   │ │ │
│  │  │ Image: Modern     │  │  Beautiful by Design          │ │ │
│  │  │ Design            │  │                                │ │ │
│  │  │ Type: image       │  │  Content describing the       │ │ │
│  │  │ Accepts: image,   │  │  design system and UX         │ │ │
│  │  │ video             │  │                                │ │ │
│  │  │ Dimensions: 4:3   │  │                                │ │ │
│  │  └────────────────────┘  └───────────────────────────────┘ │ │
│  │                                                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         about.html                               │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Video Section                                              │ │
│  │                                                              │ │
│  │  Watch Our Introduction                                     │ │
│  │                                                              │ │
│  │  ┌────────────────────────────────────────────────────────┐ │ │
│  │  │                                                          │ │ │
│  │  │  [MEDIA_SLOT_5]                                        │ │ │
│  │  │  Video: Product Demo                                   │ │ │
│  │  │  Type: video                                           │ │ │
│  │  │  Accepts: video, youtube, vimeo                        │ │ │
│  │  │  Dimensions: 16:9                                      │ │ │
│  │  │                                                          │ │ │
│  │  └────────────────────────────────────────────────────────┘ │ │
│  │                                                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Configuration to DOM Flow

```
Configuration Object
─────────────────────
{
  "media_slots": {
    "MEDIA_SLOT_1": {
      "url": "https://youtube.com/watch?v=abc123",
      "type": "youtube"
    }
  }
}
        │
        ▼
loadMediaSlots(config)
─────────────────────
• Iterate media_slots object
• Find matching DOM elements
        │
        ▼
For each slot:
─────────────
1. querySelector('[data-media-slot="MEDIA_SLOT_1"]')
2. Get mediaData from config
3. Call replaceMediaPlaceholder()
        │
        ▼
replaceMediaPlaceholder()
─────────────────────────
1. Extract: url, type, poster, alt
2. Detect type if not provided
3. Route to appropriate creator
        │
        ├─────────────────┬─────────────────┬─────────────────┐
        ▼                 ▼                 ▼                 ▼
  YouTube            Vimeo             Video File        Image
  ───────            ─────             ──────────        ─────

createYouTubeEmbed  createVimeoEmbed  createVideoElement  createImageElement
        │                 │                 │                 │
        ▼                 ▼                 ▼                 ▼
  <iframe            <iframe           <video            <img
   src="youtube...   src="vimeo...     src="video.mp4"   src="image.jpg"
   class="story-     class="story-     class="story-     class="story-
   video--embed">    video--embed">    video">           image"
                                                         loading="lazy">
        │                 │                 │                 │
        └─────────────────┴─────────────────┴─────────────────┘
                          │
                          ▼
                   Insert into DOM
                   ───────────────
                   1. Hide placeholder
                   2. Insert media element
                   3. Log success
                          │
                          ▼
                    Final Result
                    ────────────
                    Placeholder: display:none
                    Media: visible and functional
```

## Error Handling Flow

```
Media Load Attempt
──────────────────
        │
        ▼
    Try Load
        │
        ├─────────────────────────┬─────────────────────────┐
        │                         │                         │
        ▼                         ▼                         ▼
    Success                   Invalid URL            Network Error
        │                         │                         │
        ▼                         ▼                         ▼
Display Media           Log Error              Image.onerror
Keep placeholder       Keep placeholder         triggered
  hidden                 visible                    │
                                                     ▼
                                              Hide failed image
                                              Show placeholder
                                              Log error
```

## Media Type Auto-Detection

```
URL Input
─────────
"https://youtube.com/watch?v=abc123"
        │
        ▼
detectMediaType(url)
─────────────────────
        │
        ├─ Contains "youtube.com" or "youtu.be"? ──► 'youtube'
        │
        ├─ Contains "vimeo.com"? ─────────────────► 'vimeo'
        │
        ├─ Ends with .mp4/.webm/.ogg/.mov? ───────► 'video'
        │
        ├─ Ends with .jpg/.png/.webp/.svg? ───────► 'image'
        │
        └─ No match ──────────────────────────────► null
```

## Video ID Extraction

### YouTube
```
URL: "https://youtube.com/watch?v=dQw4w9WgXcQ"
     │
     ▼
extractYouTubeId()
     │
     ├─ Pattern 1: youtube.com/watch?v=([VIDEO_ID])
     ├─ Pattern 2: youtu.be/([VIDEO_ID])
     ├─ Pattern 3: youtube.com/embed/([VIDEO_ID])
     └─ Pattern 4: youtube.com/shorts/([VIDEO_ID])
     │
     ▼
Result: "dQw4w9WgXcQ"
     │
     ▼
Embed URL: "https://www.youtube.com/embed/dQw4w9WgXcQ"
```

### Vimeo
```
URL: "https://vimeo.com/123456789"
     │
     ▼
extractVimeoId()
     │
     ├─ Pattern 1: vimeo.com/([VIDEO_ID])
     └─ Pattern 2: vimeo.com/video/([VIDEO_ID])
     │
     ▼
Result: "123456789"
     │
     ▼
Embed URL: "https://player.vimeo.com/video/123456789"
```

## Complete Integration Timeline

```
Time    Event
──────  ─────────────────────────────────────────────────────────
0ms     Page load starts
        - HTML parsed
        - CSS loaded
        - Scripts loading

10ms    tenant-loader.js executes
        - getSubdomain() called
        - Subdomain detected

20ms    API request sent
        GET /api/subdomain/lookup/:subdomain

150ms   API response received
        - Configuration data parsed
        - Tenant context established

160ms   applyConfiguration() starts
        - Theme colors applied
        - Content updated
        - loadMediaSlots() called ◄─── NEW

170ms   loadMediaSlots() executes
        - Find all [data-media-slot] elements
        - Process each slot sequentially

175ms   MEDIA_SLOT_1 processed
        - Type detected: youtube
        - Iframe created
        - Placeholder hidden
        - Media inserted

180ms   MEDIA_SLOT_2 processed
        - Type detected: vimeo
        - Iframe created
        - Placeholder hidden
        - Media inserted

185ms   MEDIA_SLOT_3 processed
        - Type detected: image
        - Image element created
        - Lazy loading enabled
        - Placeholder hidden
        - Media inserted

190ms   MEDIA_SLOT_4 processed
        - Type detected: video
        - Video element created
        - Poster applied
        - Placeholder hidden
        - Media inserted

195ms   MEDIA_SLOT_5 processed
        - Type detected: youtube
        - Iframe created
        - Placeholder hidden
        - Media inserted

200ms   All media slots loaded
        - Event: 'tenant-config-loaded' fired
        - Page fully interactive

500ms+  Images lazy load as user scrolls
        - loading="lazy" attribute
        - Browser-native optimization
```

## CSS Cascade

```
Base Styles
───────────
.story-media-placeholder
  ├─ Display: flex
  ├─ Justify/align: center
  ├─ Background: gradient
  ├─ Border-radius: var(--radius-lg)
  └─ Padding: var(--spacing-12)

Media Elements
──────────────
.story-video
  ├─ Width: 100%
  ├─ Height: auto
  ├─ Border-radius: var(--radius-lg)
  └─ Background: #000

.story-video--embed (NEW)
  ├─ Extends: .story-video
  ├─ Border: none
  ├─ Aspect-ratio: 16/9
  └─ Display: block

.story-video--hero
  ├─ Aspect-ratio: 21/9
  ├─ Border-radius: 0
  └─ Object-fit: cover

.story-image
  ├─ Width: 100%
  ├─ Object-fit: cover
  ├─ Aspect-ratio: 16/9
  └─ Loading: lazy
```

## State Machine

```
Placeholder State
─────────────────

[Initial]
   │
   ▼
┌─────────────┐
│  Visible    │
│  Placeholder│
└─────────────┘
   │
   │ loadMediaSlots() called
   │ mediaData found
   │
   ▼
┌─────────────┐
│  Processing │
│  Create     │
│  Media      │
└─────────────┘
   │
   ├─────────────────┬─────────────────┐
   │                 │                 │
   │ Success         │ Error           │ No Data
   ▼                 ▼                 ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Hidden     │  │  Visible    │  │  Visible    │
│  Placeholder│  │  Placeholder│  │  Placeholder│
│             │  │  (fallback) │  │  (default)  │
│  Visible    │  │             │  │             │
│  Media      │  │  No Media   │  │  No Media   │
└─────────────┘  └─────────────┘  └─────────────┘
```

This comprehensive flow diagram shows how data moves from the admin console through the backend API, into the tenant configuration, and finally renders as media elements in the PWA template.
