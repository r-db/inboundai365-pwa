/**
 * Tenant Configuration Loader
 * Dynamically loads and applies tenant-specific configuration to the PWA template
 */

(function() {
  'use strict';
  
  // Configuration
  const DEFAULT_API_URL = (function() {
    if (typeof window === 'undefined') return 'https://api.ib365.ai/api';
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:5001/api';
    }
    if (host.endsWith('.ib365.ai') || host === 'ib365.ai') {
      return 'https://api.ib365.ai/api';
    }
    return 'https://api.ib365.ai/api';
  })();

  const API_BASE_URL = `${DEFAULT_API_URL}/subdomain`;
  
  // Detect subdomain
  function getSubdomain() {
    const hostname = window.location.hostname;
    
    // For local development, check query parameter
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const params = new URLSearchParams(window.location.search);
      return params.get('tenant') || 'demo';
    }
    
    // For production, extract subdomain
    const parts = hostname.split('.');
    if (parts.length >= 3 && parts[parts.length - 2] === 'ib365' && parts[parts.length - 1] === 'ai') {
      return parts[0];
    }
    
    return null;
  }
  
  function updateFooterYear() {
    const year = new Date().getFullYear();
    const yearElements = document.querySelectorAll('.footer-current-year');
    yearElements.forEach(el => {
      el.textContent = year;
    });
  }

  // Apply theme colors
  function applyThemeColors(config) {
    const root = document.documentElement;
    
    if (config.primary_color) {
      root.style.setProperty('--color-primary', config.primary_color);
    }
    if (config.secondary_color) {
      root.style.setProperty('--color-secondary', config.secondary_color);
    }
    if (config.accent_color) {
      root.style.setProperty('--color-accent', config.accent_color);
    }
    if (config.text_color) {
      root.style.setProperty('--color-text', config.text_color);
    }
    if (config.background_color) {
      root.style.setProperty('--color-background', config.background_color);
    }
    
    // Apply fonts
    if (config.font_family) {
      root.style.setProperty('--font-family', config.font_family);
    }
    if (config.font_heading) {
      root.style.setProperty('--font-heading', config.font_heading);
    }
  }
  
  // Update content in DOM
  function updateContent(config) {
    // Update all elements with data-tenant attribute
    const elements = document.querySelectorAll('[data-tenant]');
    
    elements.forEach(element => {
      const field = element.getAttribute('data-tenant');
      const value = getNestedValue(config, field);
      
      if (value !== undefined && value !== null) {
        if (element.tagName === 'IMG') {
          element.src = value;
          element.alt = config.business_name || '';
        } else if (element.tagName === 'META') {
          element.content = value;
        } else {
          element.textContent = value;
        }
      }
    });
    
    // Update page title
    if (config.meta_title) {
      document.title = config.meta_title;
    } else if (config.business_name) {
      document.title = config.business_name;
    }
    
    // Update meta tags
    updateMetaTag('description', config.meta_description);
    updateMetaTag('keywords', config.meta_keywords);
    updateMetaTag('og:title', config.meta_title || config.business_name);
    updateMetaTag('og:description', config.meta_description);
    updateMetaTag('og:image', config.hero_image_url);
    
    // Update favicon
    if (config.favicon_url) {
      updateFavicon(config.favicon_url);
    }
    
    // Update logo
    const logos = document.querySelectorAll('[data-tenant="logo_url"]');
    logos.forEach(logo => {
      if (config.logo_url) {
        logo.src = config.logo_url;
        logo.alt = config.business_name || 'Logo';
      }
    });
    
    // Update hero section
    updateHeroSection(config);
    
    // Update services
    updateServices(config.services);
    
    // Update features
    updateFeatures(config.features);
    
    // Update business hours
    updateBusinessHours(config.business_hours);
    
    // Update contact info
    updateContactInfo(config.contact_info);
    
    // Update social links
    updateSocialLinks(config.social_links);

    // Load media slots
    loadMediaSlots(config);

    // Hide/show features based on config
    toggleFeatures(config);

    // Apply custom CSS/JS if provided
    if (config.custom_css) {
      applyCustomCSS(config.custom_css);
    }
    if (config.custom_js && !isPreviewMode()) {
      applyCustomJS(config.custom_js);
    }
  }
  
  // Helper function to get nested object values
  function getNestedValue(obj, path) {
    return path.split('.').reduce((curr, prop) => curr?.[prop], obj);
  }
  
  // Update meta tag
  function updateMetaTag(name, content) {
    if (!content) return;
    
    let meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      if (name.startsWith('og:')) {
        meta.setAttribute('property', name);
      } else {
        meta.setAttribute('name', name);
      }
      document.head.appendChild(meta);
    }
    meta.content = content;
  }
  
  // Update favicon
  function updateFavicon(url) {
    let link = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = url;
  }
  
  // Update hero section
  function updateHeroSection(config) {
    const heroSection = document.querySelector('.hero-section, #hero');
    if (!heroSection) return;
    
    // Update background image
    if (config.hero_image_url) {
      heroSection.style.backgroundImage = `url(${config.hero_image_url})`;
    }
    
    // Update hero title
    const heroTitle = heroSection.querySelector('[data-tenant="hero_title"], .hero-title, h1');
    if (heroTitle && config.hero_title) {
      heroTitle.textContent = config.hero_title;
    }
    
    // Update hero subtitle
    const heroSubtitle = heroSection.querySelector('[data-tenant="hero_subtitle"], .hero-subtitle, .hero-description');
    if (heroSubtitle && config.hero_subtitle) {
      heroSubtitle.textContent = config.hero_subtitle;
    }
    
    // Update CTA button
    const ctaButton = heroSection.querySelector('[data-tenant="hero_cta_text"], .cta-button, .hero-button');
    if (ctaButton && config.hero_cta_text) {
      ctaButton.textContent = config.hero_cta_text;
    }
  }
  
  // Update services section
  function updateServices(services) {
    if (!services || !Array.isArray(services)) return;
    
    const servicesContainer = document.querySelector('[data-tenant-services], .services-grid, #services-list');
    if (!servicesContainer) return;
    
    // Clear existing services
    servicesContainer.innerHTML = '';
    
    // Add each service
    services.forEach(service => {
      const serviceCard = document.createElement('div');
      serviceCard.className = 'service-card bg-white rounded-lg p-6 shadow-md';
      serviceCard.innerHTML = `
        <h3 class="text-xl font-semibold mb-2">${service.name || ''}</h3>
        <p class="text-gray-600 mb-4">${service.description || ''}</p>
        ${service.price ? `<p class="text-2xl font-bold text-primary">$${service.price}</p>` : ''}
        ${service.duration ? `<p class="text-sm text-gray-500">${service.duration} minutes</p>` : ''}
      `;
      servicesContainer.appendChild(serviceCard);
    });
  }
  
  // Update features section
  function updateFeatures(features) {
    if (!features || !Array.isArray(features)) return;
    
    const featuresContainer = document.querySelector('[data-tenant-features], .features-grid, #features-list');
    if (!featuresContainer) return;
    
    // Clear existing features
    featuresContainer.innerHTML = '';
    
    // Add each feature
    features.forEach(feature => {
      const featureCard = document.createElement('div');
      featureCard.className = 'feature-card text-center';
      featureCard.innerHTML = `
        <div class="feature-icon mb-4">
          <i class="fas fa-${feature.icon || 'star'} text-4xl text-primary"></i>
        </div>
        <h3 class="text-lg font-semibold mb-2">${feature.title || ''}</h3>
        <p class="text-gray-600">${feature.description || ''}</p>
      `;
      featuresContainer.appendChild(featureCard);
    });
  }
  
  // Update business hours
  function updateBusinessHours(hours) {
    if (!hours) return;
    
    const hoursContainer = document.querySelector('[data-tenant-hours], .business-hours, #hours-list');
    if (!hoursContainer) return;
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    hoursContainer.innerHTML = '';
    
    days.forEach((day, index) => {
      const dayHours = hours[day];
      if (!dayHours) return;
      
      const row = document.createElement('div');
      row.className = 'hours-row flex justify-between py-2 border-b';
      
      const status = dayHours.closed 
        ? 'Closed' 
        : `${formatTime(dayHours.open)} - ${formatTime(dayHours.close)}`;
      
      row.innerHTML = `
        <span class="font-medium">${dayNames[index]}</span>
        <span class="text-gray-600">${status}</span>
      `;
      
      hoursContainer.appendChild(row);
    });
  }
  
  // Format time from 24hr to 12hr
  function formatTime(time) {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHours = h % 12 || 12;
    return `${displayHours}:${minutes} ${ampm}`;
  }
  
  // Update contact info
  function updateContactInfo(info) {
    if (!info) return;
    
    // Phone
    const phoneElements = document.querySelectorAll('[data-tenant="contact_info.phone"], .contact-phone');
    phoneElements.forEach(el => {
      if (info.phone) {
        el.textContent = info.phone;
        if (el.tagName === 'A') {
          el.href = `tel:${info.phone.replace(/\D/g, '')}`;
        }
      }
    });
    
    // Email
    const emailElements = document.querySelectorAll('[data-tenant="contact_info.email"], .contact-email');
    emailElements.forEach(el => {
      if (info.email) {
        el.textContent = info.email;
        if (el.tagName === 'A') {
          el.href = `mailto:${info.email}`;
        }
      }
    });
    
    // Address
    const addressElements = document.querySelectorAll('[data-tenant="contact_info.address"], .contact-address');
    addressElements.forEach(el => {
      if (info.address) {
        el.textContent = info.address;
      }
    });
  }
  
  // Update social links
  function updateSocialLinks(links) {
    if (!links) return;
    
    const socialContainer = document.querySelector('[data-tenant-social], .social-links');
    if (!socialContainer) return;
    
    socialContainer.innerHTML = '';
    
    const platforms = {
      facebook: 'fab fa-facebook-f',
      twitter: 'fab fa-twitter',
      instagram: 'fab fa-instagram',
      linkedin: 'fab fa-linkedin-in',
      youtube: 'fab fa-youtube'
    };
    
    Object.entries(links).forEach(([platform, url]) => {
      if (!url) return;
      
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.className = 'social-link inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 hover:bg-primary hover:text-white transition-colors';
      link.innerHTML = `<i class="${platforms[platform] || 'fas fa-link'}"></i>`;
      
      socialContainer.appendChild(link);
    });
  }
  
  // Load media slots from config
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

  // Replace media placeholder with actual media
  function replaceMediaPlaceholder(placeholder, mediaData) {
    const { url, poster, type, alt, title } = mediaData;
    const mediaType = type || detectMediaType(url);
    const container = placeholder.parentElement;

    let mediaElement;

    try {
      switch (mediaType) {
        case 'youtube':
          mediaElement = createYouTubeEmbed(url, title);
          break;
        case 'vimeo':
          mediaElement = createVimeoEmbed(url, title);
          break;
        case 'video':
          mediaElement = createVideoElement(url, poster, alt);
          break;
        case 'image':
          mediaElement = createImageElement(url, alt, title);
          break;
        default:
          console.warn(`Unknown media type for URL: ${url}`);
          return;
      }

      if (mediaElement) {
        // Hide placeholder
        placeholder.style.display = 'none';

        // Insert media element after placeholder
        placeholder.parentNode.insertBefore(mediaElement, placeholder.nextSibling);

        console.log(`[TenantLoader] Loaded media slot: ${placeholder.getAttribute('data-media-slot')}`);
      }
    } catch (error) {
      console.error('[TenantLoader] Error replacing media placeholder:', error);
    }
  }

  // Detect media type from URL
  function detectMediaType(url) {
    if (!url) return null;

    const urlLower = url.toLowerCase();

    // Check for YouTube
    if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
      return 'youtube';
    }

    // Check for Vimeo
    if (urlLower.includes('vimeo.com')) {
      return 'vimeo';
    }

    // Check for video extensions
    if (urlLower.match(/\.(mp4|webm|ogg|mov)$/)) {
      return 'video';
    }

    // Check for image extensions
    if (urlLower.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
      return 'image';
    }

    return null;
  }

  // Create YouTube embed
  function createYouTubeEmbed(url, title) {
    const videoId = extractYouTubeId(url);
    if (!videoId) {
      console.error('Invalid YouTube URL:', url);
      return null;
    }

    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${videoId}`;
    iframe.title = title || 'YouTube video';
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.frameBorder = '0';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.className = 'story-video story-video--embed';
    iframe.style.aspectRatio = '16/9';

    return iframe;
  }

  // Extract YouTube video ID from URL
  function extractYouTubeId(url) {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/\s]+)/,
      /youtube\.com\/shorts\/([^&\?\/\s]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  // Create Vimeo embed
  function createVimeoEmbed(url, title) {
    const videoId = extractVimeoId(url);
    if (!videoId) {
      console.error('Invalid Vimeo URL:', url);
      return null;
    }

    const iframe = document.createElement('iframe');
    iframe.src = `https://player.vimeo.com/video/${videoId}`;
    iframe.title = title || 'Vimeo video';
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.frameBorder = '0';
    iframe.allow = 'autoplay; fullscreen; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.className = 'story-video story-video--embed';
    iframe.style.aspectRatio = '16/9';

    return iframe;
  }

  // Extract Vimeo video ID from URL
  function extractVimeoId(url) {
    const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return match ? match[1] : null;
  }

  // Create video element for direct video files
  function createVideoElement(url, poster, alt) {
    const video = document.createElement('video');
    video.className = 'story-video';
    video.controls = true;
    video.preload = 'metadata';
    video.style.width = '100%';
    video.style.height = 'auto';

    if (poster) {
      video.poster = poster;
    }

    if (alt) {
      video.setAttribute('aria-label', alt);
    }

    // Create source element
    const source = document.createElement('source');
    source.src = url;
    source.type = getVideoMimeType(url);

    video.appendChild(source);

    // Fallback text
    const fallback = document.createTextNode('Your browser does not support the video tag.');
    video.appendChild(fallback);

    return video;
  }

  // Get video MIME type from URL
  function getVideoMimeType(url) {
    const ext = url.split('.').pop().toLowerCase();
    const mimeTypes = {
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'ogg': 'video/ogg',
      'mov': 'video/quicktime'
    };
    return mimeTypes[ext] || 'video/mp4';
  }

  // Create image element with lazy loading
  function createImageElement(url, alt, title) {
    const img = document.createElement('img');
    img.src = url;
    img.alt = alt || title || 'Media content';
    img.className = 'story-image';
    img.loading = 'lazy';
    img.style.width = '100%';
    img.style.height = 'auto';

    if (title) {
      img.title = title;
    }

    // Add error handling
    img.onerror = function() {
      console.error('[TenantLoader] Failed to load image:', url);
      this.style.display = 'none';
      // Show placeholder again
      const placeholder = this.previousElementSibling;
      if (placeholder && placeholder.classList.contains('story-media-placeholder')) {
        placeholder.style.display = '';
      }
    };

    return img;
  }

  // Toggle features based on config
  function toggleFeatures(config) {
    // Booking widget
    const bookingWidget = document.querySelector('[data-feature="booking"], .booking-widget');
    if (bookingWidget) {
      bookingWidget.style.display = config.booking_enabled === false ? 'none' : '';
    }
    
    // Chat widget
    const chatWidget = document.querySelector('[data-feature="chat"], .chat-widget');
    if (chatWidget) {
      chatWidget.style.display = config.chat_enabled === false ? 'none' : '';
    }
    
    // Phone widget
    const phoneWidget = document.querySelector('[data-feature="phone"], .phone-widget');
    if (phoneWidget) {
      phoneWidget.style.display = config.phone_widget_enabled === false ? 'none' : '';
    }
    
    // Testimonials section
    const testimonials = document.querySelector('[data-feature="testimonials"], #testimonials');
    if (testimonials) {
      testimonials.style.display = config.testimonials_enabled === false ? 'none' : '';
    }
    
    // Gallery section
    const gallery = document.querySelector('[data-feature="gallery"], #gallery');
    if (gallery) {
      gallery.style.display = config.gallery_enabled !== true ? 'none' : '';
    }
    
    // Blog section
    const blog = document.querySelector('[data-feature="blog"], #blog');
    if (blog) {
      blog.style.display = config.blog_enabled !== true ? 'none' : '';
    }
  }
  
  // Apply custom CSS
  function applyCustomCSS(css) {
    let styleEl = document.getElementById('tenant-custom-css');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'tenant-custom-css';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = css;
  }
  
  // Apply custom JS (be careful!)
  function applyCustomJS(js) {
    try {
      const scriptEl = document.createElement('script');
      scriptEl.id = 'tenant-custom-js';
      scriptEl.textContent = js;
      document.body.appendChild(scriptEl);
    } catch (error) {
      console.error('Error applying custom JS:', error);
    }
  }
  
  // Check if in preview mode
  function isPreviewMode() {
    const params = new URLSearchParams(window.location.search);
    return params.get('preview') === 'true';
  }
  
  // Check if in admin mode
  function isAdminMode() {
    const params = new URLSearchParams(window.location.search);
    return params.get('admin') === 'true';
  }
  
  // Load tenant configuration
  async function loadTenantConfig(subdomain) {
    try {
      // Check session storage first
      const cached = sessionStorage.getItem(`tenant-config-${subdomain}`);
      if (cached && !isPreviewMode()) {
        const config = JSON.parse(cached);
        applyConfiguration(config);
      }
      
      // Fetch fresh config from new subdomain lookup endpoint
      const response = await fetch(`${API_BASE_URL}/lookup/${subdomain}`);

      if (!response.ok) {
        throw new Error(`Failed to load configuration: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error('Invalid tenant configuration response');
      }

      const config = result.data;
      
      // Cache for 5 minutes
      if (!isPreviewMode()) {
        sessionStorage.setItem(`tenant-config-${subdomain}`, JSON.stringify(config));
      }
      
      // Apply configuration
      applyConfiguration(config);
      
    } catch (error) {
      console.error('Error loading tenant configuration:', error);
      
      // Show error message to user
      showConfigError();
    }
  }
  
  // Generate dynamic manifest.json
  function generateDynamicManifest(config) {
    const branding = config.branding || config;
    const manifest = {
      name: branding.pwa_name || branding.company_name || config.business_name || 'PWA App',
      short_name: branding.pwa_short_name || branding.company_name?.substring(0, 12) || 'App',
      description: branding.meta_description || branding.tagline || 'Progressive Web App',
      start_url: `/?utm_source=pwa&tenant=${config.subdomain}`,
      display: 'standalone',
      orientation: 'any',
      theme_color: branding.pwa_theme_color || branding.primary_color || '#0066cc',
      background_color: branding.background_color || '#ffffff',
      dir: 'ltr',
      lang: 'en-US',
      scope: '/',
      id: `/?tenant=${config.subdomain}`,
      categories: ['business', 'productivity', 'utilities'],
      icons: [
        {
          src: branding.logo_url || '/icons/icon.svg',
          sizes: 'any',
          type: 'image/svg+xml',
          purpose: 'any'
        },
        {
          src: branding.logo_url || '/icons/icon.svg',
          sizes: '512x512',
          type: 'image/svg+xml',
          purpose: 'maskable'
        }
      ],
      screenshots: [],
      shortcuts: [],
      prefer_related_applications: false,
      display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
      launch_handler: {
        client_mode: ['focus-existing', 'auto']
      }
    };

    return manifest;
  }

  // Update manifest link with dynamic blob URL
  function updateManifestLink(config) {
    const manifest = generateDynamicManifest(config);
    const manifestBlob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const manifestURL = URL.createObjectURL(manifestBlob);

    // Find existing manifest link or create new one
    let manifestLink = document.querySelector('link[rel="manifest"]');
    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      document.head.appendChild(manifestLink);
    }

    // Update href to dynamic blob URL
    manifestLink.href = manifestURL;

    console.log('[TenantLoader] Dynamic manifest.json generated for:', config.business_name);
  }

  // Apply configuration to page
  function applyConfiguration(config) {
    // Store tenant context globally for API requests
    const assistantConfig = config.ai_assistant || config.chatbot || {};
    const apiBaseUrl = config.api_base_url || assistantConfig.api_base_url || DEFAULT_API_URL;

    window.tenantContext = {
      tenant_id: config.tenant_id,
      business_name: config.business_name,
      subdomain: config.subdomain,
      subdomain_status: config.subdomain_status,
      api_base_url: apiBaseUrl,
      ai_assistant: assistantConfig
    };

    // Apply theme first for immediate visual feedback
    applyThemeColors(config.branding || config);

    // Then update content
    updateContent(config.branding || config);

    // Update manifest with tenant-specific values
    updateManifestLink(config);
    updateFooterYear();

    // Initialize admin mode if needed
    if (isAdminMode()) {
      initializeAdminMode(config);
    }

    // Fire custom event
    window.dispatchEvent(new CustomEvent('tenant-config-loaded', { detail: config }));

    console.log('[TenantLoader] Tenant context established:', window.tenantContext);
  }
  
  // Show configuration error
  function showConfigError() {
    // Silently log error without showing UI message
    console.error('Configuration loading failed - using default configuration');
  }
  
  // Initialize admin mode
  function initializeAdminMode(config) {
    // Load admin mode script
    const script = document.createElement('script');
    script.src = '/js/admin-mode.js';
    script.onload = () => {
      if (window.initAdminMode) {
        window.initAdminMode(config);
      }
    };
    document.body.appendChild(script);
  }
  
  // Initialize on DOM ready
  function initialize() {
    const subdomain = getSubdomain();
    
    if (!subdomain) {
      console.error('No subdomain detected');
      return;
    }
    
    console.log('Loading configuration for:', subdomain);
    loadTenantConfig(subdomain);
  }
  
  // Start initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
  
  // Export for use in other scripts
  window.TenantLoader = {
    getSubdomain,
    loadTenantConfig,
    updateContent,
    applyThemeColors,
    isAdminMode,
    isPreviewMode,
    loadMediaSlots,
    replaceMediaPlaceholder
  };
})();
