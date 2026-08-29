import { Component, signal, computed, afterNextRender } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { RESUME_DATA } from './resume-data';
import Lenis from 'lenis';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  // Resume Data
  resume = signal(RESUME_DATA);

  // Global States
  isMenuOpen = signal(false);
  isContactModalOpen = signal(false);
  isContactModalClosing = signal(false);
  isContactSuccess = signal(false);
  isContactSending = signal(false);

  // Loader States
  isLoaderActive = signal(true);
  loaderTransform = signal('translateY(0)');
  loaderProgress = signal(0);
  loaderProgressString = computed(() => String(this.loaderProgress()).padStart(3, '0'));

  // Clock States
  timeStr = signal('9:41am');
  dateStr = signal('12 March, 2025');

  // Form inputs
  formName = signal('');
  formEmail = signal('');
  formProject = signal('');

  // Carousel States
  previousCarouselIndex = signal<number | null>(null);
  carouselDirection = signal<'next' | 'prev'>('next');
  currentCarouselIndex = signal<number>(0);

  // Lenis smooth scroll instance
  protected lenis: any = null;
  private clockIntervalId: any = null;

  constructor() {
    afterNextRender(() => {
      // 1. Page Loader Count & Slide Up Animation
      this.stopScroll();
      const FILL_MS = 1300;
      const startTime = performance.now();
      
      const animateLoader = (timestamp: number) => {
        const elapsed = timestamp - startTime;
        const t = Math.min(elapsed / FILL_MS, 1);
        const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; // easeInOutCubic
        const progress = Math.round(ease * 100);
        
        this.loaderProgress.set(progress);
        
        if (t < 1) {
          requestAnimationFrame(animateLoader);
        } else {
          // Slide up
          this.loaderTransform.set('translateY(-100%)');
          
          setTimeout(() => {
            this.isLoaderActive.set(false);
            this.startScroll();
            document.body.classList.add('is-ready');
            
            // Trigger IntersectionObservers
            this.triggerScrollElements();
          }, 700);
        }
      };
      requestAnimationFrame(animateLoader);

      // 2. Initialize clock updates
      this.updateClock();
      this.clockIntervalId = setInterval(() => this.updateClock(), 1000);

      // 3. Escape key listeners
      window.addEventListener('keydown', (e) => this.handleKeyPress(e));

      // 4. Adaptive grid scaling
      this.initAdaptiveGrid();

      // 5. Liquid Canvas Reveal Animation
      this.initLiquidReveal();

      // 6. Initialize Lenis smooth scroll
      this.lenis = new Lenis({ smoothWheel: true });
      const raf = (t: number) => {
        if (this.lenis) {
          this.lenis.raf(t);
          requestAnimationFrame(raf);
        }
      };
      requestAnimationFrame(raf);

      // 7. Stats scroll progress calculations
      const statValueElements = document.querySelectorAll('.stat-number-value');
      let lastScrollTime = 0;
      
      const getScrollProgress = (element: Element) => {
        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const startY = viewportHeight; // Top of element hits bottom of viewport
        const endY = viewportHeight / 2 - rect.height / 2; // Center of element hits center of viewport
        const currentY = rect.top;

        if (currentY >= startY) return 0;
        if (currentY <= endY) return 1;

        return (startY - currentY) / (startY - endY);
      };

      const updateStatsCounter = () => {
        statValueElements.forEach(item => {
          const target = parseInt(item.getAttribute('data-target') || '0', 10);
          const progress = getScrollProgress(item);
          const currentValue = Math.round(progress * target);
          item.textContent = String(currentValue);
        });
      };

      window.addEventListener('scroll', () => {
        const now = performance.now();
        if (now - lastScrollTime < 30) return;
        lastScrollTime = now;
        updateStatsCounter();
      });
      this.lenis.on('scroll', updateStatsCounter);
    });
  }

  // Scroll helpers
  stopScroll(): void {
    if (this.lenis) this.lenis.stop();
    document.documentElement.style.position = 'relative';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.height = '100%';
  }

  startScroll(): void {
    if (this.lenis) this.lenis.start();
    document.documentElement.style.removeProperty('position');
    document.documentElement.style.removeProperty('overflow');
    document.documentElement.style.removeProperty('height');
  }

  scrollToSection(id: string): void {
    const element = document.getElementById(id);
    if (!element) return;
    if (this.lenis) this.lenis.stop();
    setTimeout(() => {
      const top = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: top, behavior: 'smooth' });
      setTimeout(() => {
        if (this.lenis) this.lenis.start();
      }, 100);
    }, 50);
  }

  // Clock Update
  private updateClock(): void {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = String(minutes).padStart(2, '0');
    this.timeStr.set(`${hours}:${minutesStr}${ampm}`);
    
    const days = now.getDate();
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const monthStr = monthNames[now.getMonth()];
    const year = now.getFullYear();
    this.dateStr.set(`${days} ${monthStr}, ${year}`);
  }

  // Navigation Menu Controls
  openNavMenu(): void {
    this.stopScroll();
    this.isMenuOpen.set(true);
  }

  closeNavMenu(): void {
    this.isMenuOpen.set(false);
    this.startScroll();
  }

  // Contact Modal Controls
  openRequestModal(): void {
    this.stopScroll();
    this.isContactModalOpen.set(true);
  }

  closeRequestModal(): void {
    this.isContactModalClosing.set(true);
    this.isContactModalOpen.set(false);

    setTimeout(() => {
      this.isContactModalClosing.set(false);
      this.startScroll();
      
      // Reset contact form state after close transition completes
      setTimeout(() => {
        this.resetContactForm();
      }, 300);
    }, 400);
  }

  private handleKeyPress(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      if (this.isMenuOpen()) this.closeNavMenu();
      if (this.isContactModalOpen()) this.closeRequestModal();
    }
  }

  // Carousel Actions
  advanceCarousel(): void {
    this.showCarouselSlide((this.currentCarouselIndex() + 1) % 3, 'next');
  }

  nextCarousel(event: Event): void {
    event.stopPropagation();
    this.showCarouselSlide((this.currentCarouselIndex() + 1) % 3, 'next');
  }

  prevCarousel(event: Event): void {
    event.stopPropagation();
    this.showCarouselSlide((this.currentCarouselIndex() - 1 + 3) % 3, 'prev');
  }

  private showCarouselSlide(index: number, direction: 'next' | 'prev'): void {
    this.previousCarouselIndex.set(this.currentCarouselIndex());
    this.carouselDirection.set(direction);
    this.currentCarouselIndex.set(index);
  }

  // Form Submission
  handleFormSubmit(e: Event): void {
    e.preventDefault();
    this.isContactSending.set(true);

    setTimeout(() => {
      this.isContactSending.set(false);
      this.isContactSuccess.set(true);
    }, 1000);
  }

  private resetContactForm(): void {
    this.formName.set('');
    this.formEmail.set('');
    this.formProject.set('');
    this.isContactSuccess.set(false);
    this.isContactSending.set(false);
  }

  // Initialization Helpers
  private initAdaptiveGrid(): void {
    const applyAdaptiveGrid = () => {
      const FONT_BASE = 16, baseWidth = 1920, coef = 0.6666;
      const w = window.innerWidth;
      const widthReduction = ((baseWidth - w) / baseWidth) * 100;
      const size = FONT_BASE - (FONT_BASE * (widthReduction * coef)) / 100;
      if (size > FONT_BASE) document.documentElement.style.fontSize = size + 'px';
      else document.documentElement.style.removeProperty('font-size');
    };
    applyAdaptiveGrid();
    window.addEventListener('resize', applyAdaptiveGrid);
  }

  private initLiquidReveal(): void {
    const canvas = document.getElementById('hero-canvas') as HTMLCanvasElement;
    const container = document.getElementById('hero-liquid-container');
    if (!canvas || !container) return;

    const afterImg = new Image();
    afterImg.src = "before2.jpg"; // Revealed image
    
    let width = 0, height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let ctx: CanvasRenderingContext2D | null = null;
    let coverCanvas = document.createElement('canvas');
    let coverCtx = coverCanvas.getContext('2d') as CanvasRenderingContext2D;
    let brushCanvas = document.createElement('canvas');
    let brushCtx = brushCanvas.getContext('2d') as CanvasRenderingContext2D;

    const brushRadius = 143;
    const decay = 0.016;
    let points: Array<{x: number, y: number}> = [];
    let lastPoint: {x: number, y: number} | null = null;
    let idle = 0;
    let imagesLoaded = false;
    let isDrawing = false;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
      ctx = canvas.getContext('2d');
      
      afterImg.onload = () => {
        imagesLoaded = true;
        resizeCanvas();
        requestAnimationFrame(tick);
      };

      const resizeObserver = new ResizeObserver(() => {
        resizeCanvas();
      });
      resizeObserver.observe(container);

      window.addEventListener('pointermove', (e) => {
        if (!imagesLoaded || !ctx) return;
        const rect = container.getBoundingClientRect();
        const x = (e.clientX - rect.left) * dpr;
        const y = (e.clientY - rect.top) * dpr;
        const radius = brushRadius * dpr;

        if (x < -radius || y < -radius || x > (rect.width * dpr) + radius || y > (rect.height * dpr) + radius) {
          lastPoint = null;
          return;
        }

        isDrawing = true;
        const current = { x, y };

        if (lastPoint) {
          const dist = Math.hypot(current.x - lastPoint.x, current.y - lastPoint.y);
          const step = Math.max(radius * 0.3, 1);
          const n = Math.min(Math.ceil(dist / step), 60);

          for (let i = 1; i <= n; i++) {
            const ratio = i / n;
            points.push({
              x: lastPoint.x + (current.x - lastPoint.x) * ratio,
              y: lastPoint.y + (current.y - lastPoint.y) * ratio
            });
          }
        } else {
          points.push(current);
        }

        lastPoint = current;
      });

      window.addEventListener('pointerleave', () => {
        lastPoint = null;
      });
    }

    function resizeCanvas() {
      if (!container || !canvas || !imagesLoaded) return;
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';

      coverCanvas.width = width * dpr;
      coverCanvas.height = height * dpr;
      drawCoverImage(coverCtx, afterImg, coverCanvas.width, coverCanvas.height);

      const radius = brushRadius * dpr;
      const diameter = Math.ceil(radius * 2);
      brushCanvas.width = diameter;
      brushCanvas.height = diameter;
    }

    function drawCoverImage(context: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) {
      context.clearRect(0, 0, w, h);
      const imgRatio = img.width / img.height;
      const canvasRatio = w / h;
      let drawWidth = w;
      let drawHeight = h;
      let offsetX = 0;
      let offsetY = 0;
      
      if (imgRatio > canvasRatio) {
        drawWidth = h * imgRatio;
        offsetX = (w - drawWidth) / 2;
      } else {
        drawHeight = w / imgRatio;
        offsetY = (h - drawHeight) / 2;
      }
      context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    }

    function stamp(x: number, y: number) {
      const radius = brushRadius * dpr;
      const diameter = Math.ceil(radius * 2);
      const c = radius;

      brushCtx.clearRect(0, 0, diameter, diameter);
      brushCtx.globalCompositeOperation = 'source-over';
      
      const gradient = brushCtx.createRadialGradient(c, c, 0, c, c, radius);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.55, 'rgba(255, 255, 255, 0.82)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      brushCtx.fillStyle = gradient;
      brushCtx.beginPath();
      brushCtx.arc(c, c, radius, 0, Math.PI * 2);
      brushCtx.fill();

      brushCtx.globalCompositeOperation = 'source-in';
      brushCtx.drawImage(
        coverCanvas,
        x - c, y - c, diameter, diameter,
        0, 0, diameter, diameter
      );

      if (ctx) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(brushCanvas, x - c, y - c);
      }
    }

    function tick() {
      if (points.length > 0) {
        idle = 0;
      } else {
        idle++;
      }

      if (ctx) {
        if (idle <= 120) {
          const fade = isDrawing ? decay : Math.min(decay + idle * 0.004, 0.5);
          ctx.globalCompositeOperation = 'destination-out';
          ctx.fillStyle = `rgba(0, 0, 0, ${fade})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          if (points.length > 0) {
            points.forEach(pt => stamp(pt.x, pt.y));
            points = [];
          }
        } else if (idle === 121) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }

      isDrawing = false;
      requestAnimationFrame(tick);
    }
  }

  private triggerScrollElements(): void {
    // 1. revealObserver
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          const delay = parseInt(el.getAttribute('data-reveal-delay') || '0', 10);
          setTimeout(() => {
            el.classList.add('revealed');
          }, delay);
          revealObserver.unobserve(el);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('#about-globe-text, #about-footer-row, #stats-panel').forEach(el => {
      revealObserver.observe(el);
    });

    // 2. staggerObserver
    const staggerObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const parent = entry.target as HTMLElement;
          const selector = parent.getAttribute('data-stagger-target');
          if (!selector) return;
          const delayBase = parseInt(parent.getAttribute('data-stagger-delay') || '0', 10);
          const interval = parseInt(parent.getAttribute('data-stagger-interval') || '100', 10);
          const items = parent.querySelectorAll(selector);
          
          items.forEach((item, index) => {
            setTimeout(() => {
              item.classList.add('revealed');
            }, delayBase + (index * interval));
          });
          staggerObserver.unobserve(parent);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('[data-stagger-target]').forEach(parent => {
      staggerObserver.observe(parent);
    });

    // 3. wordRevealObserver
    const wordRevealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const words = entry.target.querySelectorAll('.reveal-word-inner');
          words.forEach((word, idx) => {
            setTimeout(() => {
              (word as HTMLElement).style.transform = 'translateY(0)';
              (word as HTMLElement).style.opacity = '1';
            }, idx * 35);
          });
          wordRevealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('#about-text').forEach(el => {
      wordRevealObserver.observe(el);
    });

    // 4. lineRevealObserver for headers (staggered titles)
    const lineRevealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const inners = entry.target.querySelectorAll('.reveal-line-inner');
          const stagger = parseInt(entry.target.getAttribute('data-line-stagger') || '120', 10);
          inners.forEach((inner, idx) => {
            setTimeout(() => {
              (inner as HTMLElement).style.transform = 'translateY(0)';
              (inner as HTMLElement).style.opacity = '1';
            }, idx * stagger);
          });
          lineRevealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('#portfolio-title-container, #services-title-container, #stats-title-container, #footer-title-container').forEach(el => {
      const inners = el.querySelectorAll('.reveal-line-inner');
      inners.forEach(inner => {
        (inner as HTMLElement).style.transform = 'translateY(100%)';
        (inner as HTMLElement).style.opacity = '0';
        (inner as HTMLElement).style.transition = 'transform 0.9s cubic-bezier(0.215, 0.61, 0.355, 1), opacity 0.9s cubic-bezier(0.215, 0.61, 0.355, 1)';
      });
      lineRevealObserver.observe(el);
    });
  }
}
