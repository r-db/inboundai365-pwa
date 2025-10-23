// Advanced Media Handler
export class MediaHandler {
  constructor() {
    this.init();
  }

  init() {
    this.initLazyLoading();
    this.initMediaSession();
    this.initPictureInPicture();
  }

  initLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;

            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }

            if (img.dataset.srcset) {
              img.srcset = img.dataset.srcset;
              img.removeAttribute('data-srcset');
            }

            img.classList.add('loaded');
            imageObserver.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px'
      });

      document.querySelectorAll('img[data-src], img[data-srcset]').forEach(img => {
        imageObserver.observe(img);
      });

      // Observe dynamically added images
      const mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeName === 'IMG' && (node.dataset.src || node.dataset.srcset)) {
              imageObserver.observe(node);
            }
          });
        });
      });

      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    } else {
      // Fallback for browsers without IntersectionObserver
      document.querySelectorAll('img[data-src]').forEach(img => {
        img.src = img.dataset.src;
      });
    }
  }

  initMediaSession() {
    if (!('mediaSession' in navigator)) return;

    // This would be configured per media
    navigator.mediaSession.setActionHandler('play', () => this.play());
    navigator.mediaSession.setActionHandler('pause', () => this.pause());
    navigator.mediaSession.setActionHandler('seekbackward', () => this.seek(-10));
    navigator.mediaSession.setActionHandler('seekforward', () => this.seek(10));
  }

  initPictureInPicture() {
    if (!('pictureInPictureEnabled' in document)) return;

    document.querySelectorAll('video').forEach(video => {
      const pipButton = document.createElement('button');
      pipButton.textContent = 'PiP';
      pipButton.className = 'pip-button';
      pipButton.setAttribute('aria-label', 'Picture in Picture');

      pipButton.addEventListener('click', async () => {
        try {
          if (document.pictureInPictureElement) {
            await document.exitPictureInPicture();
          } else {
            await video.requestPictureInPicture();
          }
        } catch (error) {
          console.error('PiP error:', error);
        }
      });

      if (video.parentElement) {
        video.parentElement.appendChild(pipButton);
      }
    });
  }

  play() {
    const media = document.querySelector('audio, video');
    if (media) media.play();
  }

  pause() {
    const media = document.querySelector('audio, video');
    if (media) media.pause();
  }

  seek(seconds) {
    const media = document.querySelector('audio, video');
    if (media) media.currentTime += seconds;
  }

  setMediaMetadata(metadata) {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata(metadata);
    }
  }
}

export default MediaHandler;
