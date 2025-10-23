import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  NgZone,
  inject, // 1. On importe 'inject' pour l'injection de dépendances moderne
} from '@angular/core';
import { CommonModule } from '@angular/common';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero.html',
  styleUrls: ['./hero.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero implements AfterViewInit, OnDestroy {
  // Les ViewChild ne changent pas
  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLElement>;
  @ViewChild('headlineTrigger', { static: true }) headlineRef!: ElementRef<HTMLElement>;
  @ViewChild('mosaic', { static: true }) mosaicRef!: ElementRef<HTMLElement>;
  @ViewChild('track', { static: true }) trackRef!: ElementRef<HTMLElement>;
  @ViewChild('spacer', { static: true }) spacerRef!: ElementRef<HTMLElement>;
  @ViewChild('heroVideoWrapper', { static: true }) heroVideoWrapperRef!: ElementRef<HTMLElement>;

  // 2. On injecte ElementRef pour avoir une référence au composant lui-même
  //    et pouvoir trouver ses parents dans le DOM.
  private elementRef = inject(ElementRef);

  private ctx?: gsap.Context;
  private tl?: gsap.core.Timeline;

  constructor(private ngZone: NgZone) {
    if (typeof window !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }
  }

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      // On utilise un setTimeout pour s'assurer que le DOM est complètement rendu,
      // y compris notre conteneur de scroll, avant de lancer GSAP.
      setTimeout(() => {
        this.ctx = gsap.context(() => this.setup(), this.containerRef.nativeElement);
      }, 0);
    });

    // Le reste de ta logique pour le chargement des images est parfait et conservé.
    const imgs = Array.from(this.trackRef.nativeElement.querySelectorAll('img'));
    if (imgs.length) {
      let loaded = 0;
      imgs.forEach((i) => {
        if (i.complete) loaded++;
        else
          i.addEventListener(
            'load',
            () => {
              loaded++;
              if (loaded === imgs.length) ScrollTrigger.refresh();
            },
            { once: true }
          );
      });
      if (loaded === imgs.length) ScrollTrigger.refresh();
    } else {
      ScrollTrigger.refresh();
    }
  }

  ngOnDestroy(): void {
    if (this.ctx) this.ctx.revert();
    ScrollTrigger.getAll().forEach((t) => t.kill());
  }

  private setup(): void {
    // 3. LA CORRECTION PRINCIPALE COMMENCE ICI
    // On trouve le conteneur qui gère le scroll en remontant dans le DOM.
    const scroller = this.elementRef.nativeElement.closest('.main-scroll-container');

    // Sécurité : si on ne trouve pas le conteneur, on arrête tout et on prévient.
    if (!scroller) {
      console.error(
        "GSAP ScrollTrigger Error: Le conteneur '.main-scroll-container' est introuvable. Les animations ne fonctionneront pas."
      );
      return;
    }

    const headline = this.headlineRef.nativeElement;
    const mosaic = this.mosaicRef.nativeElement;
    const track = this.trackRef.nativeElement;
    const spacer = this.spacerRef.nativeElement;
    const heroVideoWrapper = this.heroVideoWrapperRef?.nativeElement;
    const trackStyles = window.getComputedStyle(track);
    const gap = parseFloat(trackStyles.gap || trackStyles.columnGap || '28') || 28;

    const left = track.querySelector<HTMLElement>('[data-card="left"]')!;
    const center = track.querySelector<HTMLElement>('[data-card="center"]')!;
    const right = track.querySelector<HTMLElement>('[data-card="right"]')!;
    const extraMobile = track.querySelector<HTMLElement>('[data-card="extra1"]')!;
    const extras = Array.from(track.querySelectorAll<HTMLElement>('[data-card^="extra"]')).filter(
      (e) => e !== extraMobile
    );

    if (!left || !center || !right) {
      console.warn('Hero: cards missing');
    }

    const visibleWidth = Math.round(
      left.getBoundingClientRect().width +
        center.getBoundingClientRect().width +
        right.getBoundingClientRect().width +
        2 * gap
    );

    mosaic.style.width = `${visibleWidth}px`;
    mosaic.style.maxWidth = `${visibleWidth}px`;
    mosaic.style.marginLeft = 'auto';
    mosaic.style.marginRight = 'auto';

    const computeMaxTranslate = (pad = 120) => Math.max(0, track.scrollWidth - visibleWidth + pad);

    if (this.tl) {
      this.tl.kill();
    }

    this.tl = gsap.timeline({ defaults: { ease: 'sine.inOut' } });
    this.tl.to(
      headline,
      { x: () => -Math.min(visibleWidth * 0.085, 240), opacity: 0.98, duration: 1 },
      0
    );
    this.tl.to(center, { scale: 1, y: 0, duration: 0.6 }, 0);
    this.tl.to([left, right, ...extras], { y: 0, duration: 0.6, stagger: 0.05 }, 0);
    if (extraMobile) {
      this.tl.fromTo(extraMobile, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 0.15);
    }
    this.tl.to({}, { duration: 0.12 }, '+=0');
    this.tl.to(track, { x: () => -computeMaxTranslate(120), duration: 1.2 }, '>');

    ScrollTrigger.matchMedia({
      '(max-width: 600px)': () => {
        if (heroVideoWrapper) heroVideoWrapper.hidden = false;
        mosaic.style.display = 'none';
        // autoplay video
        const v = heroVideoWrapper?.querySelector('video') as HTMLVideoElement | null;
        if (v) {
          v.play().catch(() => {});
        }
        ScrollTrigger.getAll().forEach((t) => t.kill());
      },

      // tablet: static layout
      '(max-width: 1024px) and (min-width: 601px)': () => {
        if (heroVideoWrapper) heroVideoWrapper.hidden = true;
        mosaic.style.display = '';
        ScrollTrigger.getAll().forEach((t) => t.kill());
        // set final state (aligned)
        gsap.set([center, left, right, extraMobile, ...extras, track, headline], {
          clearProps: 'all',
        });
      },

      // desktop: full effect
      all: () => {
        ScrollTrigger.getAll().forEach((t) => t.kill());

        ScrollTrigger.create({
          animation: this.tl!,
          trigger: headline,

          // 4. ON DIT À SCROLLTRIGGER QUEL ÉLÉMENT SURVEILLER.
          //    C'est la ligne qui répare tout.
          scroller: scroller,

          start: 'top +=10%',
          end: () => '+=' + (spacer.offsetHeight || 1400),
          scrub: true,
          pin: false,
          invalidateOnRefresh: true,
        });

        ScrollTrigger.addEventListener('refreshInit', () => {
          this.tl?.invalidate();
          const newVisible = Math.round(
            left.getBoundingClientRect().width +
              center.getBoundingClientRect().width +
              right.getBoundingClientRect().width +
              2 * gap
          );
          mosaic.style.width = `${newVisible}px`;
          mosaic.style.maxWidth = `${newVisible}px`;
        });

        ScrollTrigger.refresh();
      },
    });
  }
}
