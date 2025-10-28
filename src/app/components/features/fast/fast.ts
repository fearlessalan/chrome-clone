import {
  Component,
  ChangeDetectionStrategy,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  NgZone,
  inject,
  ViewChild,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { Skeleton } from '../../skeleton/skeleton';

type FastCard = {
  id: string;
  isFeature?: boolean;
  title: string;
  description?: string;
  cta?: string;
  bgColor: string;
  textColor: string;
};

@Component({
  selector: 'app-fast',
  standalone: true,
  imports: [CommonModule, MatIconModule, Skeleton],
  templateUrl: './fast.html',
  styleUrls: ['./fast.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Fast implements AfterViewInit, OnDestroy {
  @ViewChild('section', { static: true }) sectionRef!: ElementRef<HTMLElement>;
  @ViewChild('track', { static: true }) trackRef!: ElementRef<HTMLElement>;
  @ViewChild('pill', { static: true }) pillRef!: ElementRef<HTMLElement>;
  @ViewChild('heroVisual', { static: false }) heroVisualRef?: ElementRef<HTMLElement>;
  @ViewChild('navLeft', { static: false }) navLeftRef?: ElementRef<HTMLButtonElement>;
  @ViewChild('navRight', { static: false }) navRightRef?: ElementRef<HTMLButtonElement>;
  @ViewChild('skipBtn', { static: false }) skipBtnRef?: ElementRef<HTMLButtonElement>;

  private ngZone = inject(NgZone);
  private ctx?: gsap.Context;
  galleryActive = signal(false);

  readonly pillText = 'rapide'.split('');
  readonly cards = signal<FastCard[]>([
    {
      id: 'performance',
      isFeature: true,
      title: 'Priorité aux performances',
      description:
        'Chrome a été développé dans un souci de performance. Optimisez votre expérience grâce à des fonctionnalités comme l’économiseur d’énergie et l’économiseur de mémoire.',
      cta: 'En savoir plus',
      bgColor: '#e6f4ea',
      textColor: '#137333',
    },
    {
      id: 'tabs',
      title: 'Organisez vos onglets',
      description:
        "Chrome dispose d'outils pour vous aider à gérer les onglets que vous souhaitez garder ouverts.",
      bgColor: '#fef7e0',
      textColor: '#b56200',
    },
    {
      id: 'optimized',
      title: 'Une solution optimisée pour votre appareil',
      description:
        'Nous avons développé Chrome pour que vos appareils soient compatibles avec différentes plates-formes.',
      bgColor: '#e8f0fe',
      textColor: '#1967d2',
    },
  ]);

  constructor() {
    if (typeof window !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }
  }

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.ctx = gsap.context(() => {
        const scroller = this.sectionRef.nativeElement.closest('.main-scroll-container') || window;
        this.initPillAnimation(scroller as any);
        gsap.matchMedia().add('(min-width: 601px)', () => {
          this.initHeroToGalleryScroll(scroller as any);
          this.initHorizontalScroll(scroller as any);
        });
      }, this.sectionRef.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
    ScrollTrigger.getAll().forEach((t) => t.kill());
  }

  private initPillAnimation(scroller: Element | Window): void {
    const pill = this.pillRef.nativeElement;
    ScrollTrigger.create({
      trigger: pill,
      scroller: scroller as any,
      start: 'top 85%',
      once: true,
      onEnter: () => pill.classList.add('is-animated'),
    });
  }

  /**
   * Wrap title/description text into <span class="char">x</span> for staggered animation.
   * Works only for the first feature card found.
   */
  private prepareTextChars(featureCard: HTMLElement) {
    const wrap = (selector: string) => {
      const el = featureCard.querySelector<HTMLElement>(selector);
      if (!el) return null;
      // don't re-wrap if already processed
      if (el.dataset['wrapped'] === '1') return el;
      const text = el.innerText.trim();
      // keep words together but animate by character for that kinetic feel
      const chars = Array.from(text);
      const frag = document.createDocumentFragment();
      chars.forEach((ch, i) => {
        const span = document.createElement('span');
        span.className = 'char';
        span.setAttribute('aria-hidden', 'true');
        span.style.setProperty('--char-index', `${i}`);
        span.textContent = ch === ' ' ? '\u00A0' : ch;
        frag.appendChild(span);
      });
      // clear original and append
      el.innerHTML = '';
      el.appendChild(frag);
      el.dataset['wrapped'] = '1';
      return el;
    };

    wrap('.text-content .title');
    wrap('.text-content .description');
  }

  private initHeroToGalleryScroll(scroller: Element | Window): void {
    const section = this.sectionRef.nativeElement;
    const track = this.trackRef.nativeElement;
    const featureCard = section.querySelector<HTMLElement>('.fast-card.is-feature');
    if (!featureCard) return;

    const heroVisual = featureCard.querySelector<HTMLElement>('.hero-visual') as HTMLElement | null;
    const heroFrame = featureCard.querySelector<HTMLElement>('.hero-frame') as HTMLElement | null;
    const textContent = featureCard.querySelector<HTMLElement>(
      '.text-content'
    ) as HTMLElement | null;

    if (!heroVisual || !heroFrame || !textContent) return;

    // prepare chars for staggered reveal
    this.prepareTextChars(featureCard);
    const chars = Array.from(featureCard.querySelectorAll<HTMLElement>('.text-content .char'));

    // initial states
    gsap.set([heroFrame], { borderColor: 'rgba(0,0,0,0)', borderWidth: 0 });
    gsap.set([heroVisual], { scale: 1, transformOrigin: 'center center', willChange: 'transform' });
    gsap.set([textContent], { autoAlpha: 1 }); // container visible, chars handle their own alpha
    gsap.set(chars, { autoAlpha: 0, y: 8, display: 'inline-block', lineHeight: '1.2em' });

    // timeline controlling the cinematic shrink -> gallery reveal
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        scroller: scroller as any,
        start: 'top top',
        end: '+=1000',
        scrub: 0.9,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onLeave: () => {
          this.galleryActive.set(true);
          section.classList.add('is-gallery');
        },
        onEnterBack: () => {
          this.galleryActive.set(false);
          section.classList.remove('is-gallery');
        },
      },
    });

    // border becomes visible (but stays visually a frame while content scales)
    tl.to(heroFrame, { borderColor: 'rgba(0,0,0,0.12)', borderWidth: 8, duration: 1 }, 0)
      // visual (the inner skeleton) shrinks INSIDE the frame
      .to(heroVisual, { scale: 0.62, duration: 1, ease: 'power2.out', force3D: true }, 0)
      // translate the inner visual slightly down and left — so final state is a bit low/left
      .to(heroVisual, { yPercent: 22, xPercent: -8, duration: 1, ease: 'power2.out' }, 0)
      // shift the whole feature card left a bit — left border may get hidden visually
      .to(featureCard, { xPercent: -8, duration: 1, ease: 'power1.out' }, 0)
      // nudge the track to reveal partial next cards (gallery peek)
      .to(
        track,
        {
          x: () => {
            const slide = -Math.min(
              (typeof window !== 'undefined' ? window.innerWidth : 1200) * 0.2,
              280
            );
            return slide;
          },
          duration: 1,
          ease: 'power1.out',
        },
        0.08
      )
      // reveal text chars progressively as image shrinks (starts slightly into the motion)
      .to(
        chars,
        {
          autoAlpha: 1,
          y: 0,
          stagger: { each: 0.02, from: 'start' },
          duration: 0.6,
          ease: 'power3.out',
        },
        0.18
      );

    // small ScrollTrigger to toggle nav visibility once user reached the 'peek' point
    ScrollTrigger.create({
      trigger: section,
      scroller: scroller as any,
      start: 'top top+=320',
      end: 'bottom bottom',
      onEnter: () => {
        section.classList.add('nav-visible');
      },
      onLeaveBack: () => {
        section.classList.remove('nav-visible');
      },
    });
  }

  private initHorizontalScroll(scroller: Element | Window): void {
    const track = this.trackRef.nativeElement;
    const section = this.sectionRef.nativeElement;
    const scrollDistance =
      track.scrollWidth - (typeof window !== 'undefined' ? window.innerWidth : 1200);

    // main mapping of vertical scroll into horizontal travel until galleryActive
    gsap.to(track, {
      x: -scrollDistance,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        scroller: scroller as any,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    // when galleryActive is true, the CSS will allow native horizontal scroll —
    // the nav buttons will call navScroll to operate native scroll.
  }

  navScroll(delta: number) {
    const track = this.trackRef.nativeElement;
    if (this.galleryActive()) {
      track.scrollBy({ left: delta, behavior: 'smooth' });
    } else {
      gsap.to(track, { x: `+=${delta * 0.6}`, duration: 0.6, ease: 'power2.out' });
    }
  }

  /**
   * trackBy for ngFor to avoid template error and optimize rendering
   */
  trackByFn(_index: number, item: FastCard) {
    return item.id;
  }

  /**
   * returns default delta for nav buttons; protects SSR by guarding window access
   */
  navDelta() {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
    return Math.round(w * 0.6);
  }

  get galleryActiveValue() {
    return this.galleryActive();
  }

  skipSection() {
    const next = this.sectionRef.nativeElement.nextElementSibling as HTMLElement | null;
    if (next) {
      next.scrollIntoView({ behavior: 'smooth' });
    } else {
      if (typeof window !== 'undefined') {
        window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
      }
    }
  }
}
