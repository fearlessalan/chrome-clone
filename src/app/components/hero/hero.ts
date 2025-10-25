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

    // On récupère séparément les images <img>, les <picture> (qui peuvent contenir <img>) et les svg inline
    const imgs = Array.from(trackEl.querySelectorAll('img')) as HTMLImageElement[];
    const pictures = Array.from(trackEl.querySelectorAll('picture')) as HTMLPictureElement[];
    const svgs = Array.from(trackEl.querySelectorAll('svg')) as SVGElement[];

    // Si on a que des SVG inline (déjà dans le DOM) => pas d'attente, on refresh tout de suite
    if (imgs.length === 0 && pictures.length === 0) {
      ScrollTrigger.refresh();
      return;
    }

    let pending = 0;
    const markLoaded = () => {
      pending--;
      if (pending <= 0) {
        // refresh hors Angular
        this.ngZone.runOutsideAngular(() => ScrollTrigger.refresh());
      }
    };

    const attachToImg = (img: HTMLImageElement) => {
      // si déjà chargé -> pas besoin d'attacher d'écoute
      if (img.complete && img.naturalWidth !== 0) return;
      pending++;
      img.addEventListener('load', markLoaded, { once: true });
      img.addEventListener('error', markLoaded, { once: true });
    };

    // imgs directs
    imgs.forEach(attachToImg);

    // picture -> on cherche <img> à l'intérieur
    pictures.forEach((p) => {
      const img = p.querySelector('img');
      if (img) attachToImg(img as HTMLImageElement);
    });

    // si aucun listener ajouté (ex: tous les imgs already complete) -> refresh direct
    if (pending === 0) {
      this.ngZone.runOutsideAngular(() => ScrollTrigger.refresh());
    }
  }

  private setupAnimations(): void {
    // ========================================================================
    // SECTION 1 : SETUP & RÉCUPÉRATION DES ÉLÉMENTS
    // ========================================================================

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
    // SECTION 2 : DÉFINITION DE L'ÉTAT INITIAL (AVANT TOUTE ANIMATION)
    // C'est ici que vous ajustez les positions de départ.
    // ========================================================================

    // Décalage vertical initial pour la plupart des cartes (alternance haut/bas).
    const cardsExceptSecond = cards.filter((c) => c !== secondCard);
    gsap.set(cardsExceptSecond, {
      y: (i) => (i % 2 === 0 ? -120 : 20),
    });

    gsap.set(firstCard, {
      x: 365,
    });

    gsap.set(secondCard, {
      autoAlpha: 0,
      y: 2000,
    });

    const computeMaxTranslate = () =>
      track.scrollWidth - mosaic.clientWidth + window.innerWidth * 0.15;

    // ========================================================================
    // SECTION 3 : LOGIQUE RESPONSIVE & CRÉATION DE LA TIMELINE
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
          mosaic.style.display = 'block';

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

          // ========================================================================
          // SECTION 4 : LA CHORÉGRAPHIE DE L'ANIMATION (LA TIMELINE)
          // C'est ici que vous définissez l'ordre et le timing des mouvements.
          // ========================================================================
          tl.to(
            cards.filter((c) => c !== secondCard),
            {
              y: 0,
              ease: 'power2.inOut',
              duration: 1,
            }
          )
            .to(
              firstCard,
              {
                x: '-4%',
                ease: 'power2.inOut',
                duration: 1,
              },
              '<'
            )
            .to(
              secondCard,
              {
                autoAlpha: 1,
                y: 0,
                ease: 'power2.out',
                duration: 1,
              },
              '<'
            )
            .to(
              track,
              {
                x: () => -computeMaxTranslate(),
                ease: 'none',
              },
              '>-0.5'
            );
        } else if (isTablet) {
          if (videoWrapper) videoWrapper.hidden = true;
          mosaic.style.display = 'block';
          gsap.set([track, cards, headline], { clearProps: 'all' });
        } else if (isMobile) {
          if (videoWrapper) videoWrapper.hidden = false;
          mosaic.style.display = 'none';
          const v = videoWrapper?.querySelector('video');
          v?.play().catch(() => {});
        }
      }
    );
  }
}
