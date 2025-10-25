import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
  inject,
  afterNextRender,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { GsapUtilsService } from '../../services/gsap-utils';
import { Skeleton } from '../skeleton/skeleton';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, Skeleton],
  templateUrl: './hero.html',
  styleUrls: ['./hero.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero implements AfterViewInit, OnDestroy {
  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLElement>;
  @ViewChild('headline', { static: true }) headlineRef!: ElementRef<HTMLElement>;
  @ViewChild('mosaic', { static: true }) mosaicRef!: ElementRef<HTMLElement>;
  @ViewChild('track', { static: true }) trackRef!: ElementRef<HTMLElement>;
  @ViewChild('heroVideoWrapper', { static: true }) videoWrapperRef!: ElementRef<HTMLElement>;

  private ctx?: gsap.Context;
  private elementRef = inject(ElementRef);

  constructor(private ngZone: NgZone, private gsapUtils: GsapUtilsService) {
    if (typeof window !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }
    afterNextRender(() => {
      this.ngZone.runOutsideAngular(() => {
        this.ctx = gsap.context(() => {
          this.setupAnimations();
        }, this.containerRef.nativeElement);
      });
    });
  }

  ngAfterViewInit(): void {
    this.waitForImages();
  }

  ngOnDestroy(): void {
    if (this.ctx) this.ctx.revert();
  }

  private waitForImages(): void {
    const trackEl = this.trackRef.nativeElement as HTMLElement;

    const imgs = Array.from(trackEl.querySelectorAll('img')) as HTMLImageElement[];
    const pictures = Array.from(trackEl.querySelectorAll('picture')) as HTMLPictureElement[];
    const svgs = Array.from(trackEl.querySelectorAll('svg')) as SVGElement[];

    if (imgs.length === 0 && pictures.length === 0) {
      ScrollTrigger.refresh();
      return;
    }

    let pending = 0;
    const markLoaded = () => {
      pending--;
      if (pending <= 0) {
        this.ngZone.runOutsideAngular(() => ScrollTrigger.refresh());
      }
    };

    const attachToImg = (img: HTMLImageElement) => {
      if (img.complete && img.naturalWidth !== 0) return;
      pending++;
      img.addEventListener('load', markLoaded, { once: true });
      img.addEventListener('error', markLoaded, { once: true });
    };

    // imgs directs
    imgs.forEach(attachToImg);
    pictures.forEach((p) => {
      const img = p.querySelector('img');
      if (img) attachToImg(img as HTMLImageElement);
    });

    if (pending === 0) {
      this.ngZone.runOutsideAngular(() => ScrollTrigger.refresh());
    }
  }

  private setupAnimations(): void {
    const scroller = this.elementRef.nativeElement.closest('.main-scroll-container');
    if (!scroller) return;

    const headline = this.headlineRef.nativeElement;
    const mosaic = this.mosaicRef.nativeElement;
    const track = this.trackRef.nativeElement;
    const videoWrapper = this.videoWrapperRef?.nativeElement;
    const cards = gsap.utils.toArray<HTMLElement>(track.querySelectorAll('.mosaic__card'));

    const firstCard = cards[0];
    const secondCard = cards[1];

    // ========================================================================
    // SECTION 2 : ÉTAT INITIAL ROBUSTE
    // ========================================================================
    const initialVisibleCards = cards.filter((c) => c !== secondCard);
    gsap.set(initialVisibleCards, {
      y: (i) => (i % 2 === 0 ? -60 : 60),
    });

    gsap.set(firstCard, {
      x: '20vw',
    });

    gsap.set(secondCard, {
      autoAlpha: 0,
      y: '100vh',
    });

    const computeMaxTranslate = () =>
      track.scrollWidth - mosaic.clientWidth + window.innerWidth * 0.15;

    // ========================================================================
    // SECTION 3 : LOGIQUE RESPONSIVE (AVEC LE NOUVEAU MOBILE)
    // ========================================================================

    gsap.matchMedia(this.ctx).add(
      {
        isMobile: '(max-width: 600px)',
        isTablet: '(max-width: 1024px) and (min-width: 601px)',
        isDesktop: '(min-width: 1025px)',
      },
      (context) => {
        const { isMobile, isTablet, isDesktop } = context.conditions as any;

        if (isDesktop) {
          if (videoWrapper) videoWrapper.hidden = true;
          mosaic.style.display = 'flex';

          // On définit l'état initial UNIQUEMENT pour le desktop
          const initialVisibleCards = cards.filter((c) => c !== secondCard);
          gsap.set(initialVisibleCards, { y: (i) => (i % 2 === 0 ? -60 : 60) });
          gsap.set(firstCard, { x: '20vw' });
          gsap.set(secondCard, { autoAlpha: 0, y: '100vh' });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: mosaic,
              scroller: scroller,
              scrub: 1.2,
              start: 'top 80%',
              end: 'bottom 20%',
              invalidateOnRefresh: true,
            },
          });

          tl.to(initialVisibleCards, { y: 0, ease: 'power2.inOut', duration: 1 })
            .to(firstCard, { x: 0, ease: 'power2.inOut', duration: 1 }, '<')
            .to(secondCard, { autoAlpha: 1, y: 0, ease: 'power2.out', duration: 1 }, '<')
            .to(track, { x: () => -computeMaxTranslate(), ease: 'none' }, '>-0.5');
        } else if (isTablet) {
          if (videoWrapper) videoWrapper.hidden = true;
          mosaic.style.display = 'block';
          gsap.set([track, cards, headline], { clearProps: 'all' });
        } else if (isMobile) {
          if (videoWrapper) videoWrapper.hidden = true;
          mosaic.style.display = 'flex';

          gsap.set([track, ...cards], { clearProps: 'all' });
          gsap.set([cards[0], cards[1], cards[2]], { autoAlpha: 1 });
          gsap.set(cards.slice(3), { autoAlpha: 0 });

          gsap.delayedCall(0.05, () => {
            const secondCardEl = secondCard as HTMLElement;
            if (secondCardEl.offsetWidth === 0) {
              console.warn(
                'La carte n°2 a une largeur de 0, le calcul de centrage pourrait être incorrect.'
              );
              return;
            }
            const offset =
              window.innerWidth / 2 - (secondCardEl.offsetLeft + secondCardEl.offsetWidth / 2);
            gsap.set(track, { x: offset });
          });
        }
      }
    );
  }
}
