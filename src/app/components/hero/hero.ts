import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  NgZone,
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
  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLElement>;
  @ViewChild('headlineTrigger', { static: true }) headlineRef!: ElementRef<HTMLElement>;
  @ViewChild('mosaic', { static: true }) mosaicRef!: ElementRef<HTMLElement>;
  @ViewChild('track', { static: true }) trackRef!: ElementRef<HTMLElement>;
  @ViewChild('spacer', { static: true }) spacerRef!: ElementRef<HTMLElement>;
  @ViewChild('heroVideoWrapper', { static: true }) heroVideoWrapperRef!: ElementRef<HTMLElement>;

  private ctx?: gsap.Context;
  private tl?: gsap.core.Timeline;

  constructor(private ngZone: NgZone) {
    if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);
  }

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.ctx = gsap.context(() => this.setup(), this.containerRef.nativeElement);
    });

    // refresh when svgs/images load
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
    const container = this.containerRef.nativeElement;
    const headline = this.headlineRef.nativeElement;
    const mosaic = this.mosaicRef.nativeElement;
    const track = this.trackRef.nativeElement;
    const spacer = this.spacerRef.nativeElement;
    const heroVideoWrapper = this.heroVideoWrapperRef?.nativeElement;

    // compute gap from CSS (fallback 28)
    const trackStyles = window.getComputedStyle(track);
    const gap = parseFloat(trackStyles.gap || trackStyles.columnGap || '28') || 28;

    // card refs
    const left = track.querySelector<HTMLElement>('[data-card="left"]')!;
    const center = track.querySelector<HTMLElement>('[data-card="center"]')!;
    const right = track.querySelector<HTMLElement>('[data-card="right"]')!;
    const extraMobile = track.querySelector<HTMLElement>('[data-card="extra1"]')!;
    const extras = Array.from(track.querySelectorAll<HTMLElement>('[data-card^="extra"]')).filter(
      (e) => e !== extraMobile
    );

    // ensure elements exist
    if (!left || !center || !right) {
      console.warn('Hero: cards missing');
    }

    // width visible = left + gap + center + gap + right
    const visibleWidth = Math.round(
      left.getBoundingClientRect().width +
        center.getBoundingClientRect().width +
        right.getBoundingClientRect().width +
        2 * gap
    );

    // enforce mosaic visible width so only 3 cards show initially
    mosaic.style.width = `${visibleWidth}px`;
    mosaic.style.maxWidth = `${visibleWidth}px`;
    mosaic.style.marginLeft = 'auto';
    mosaic.style.marginRight = 'auto';

    // compute max translate: total track width - visible area + padding
    const computeMaxTranslate = (pad = 120) => Math.max(0, track.scrollWidth - visibleWidth + pad);

    // cleanup previous timeline if any
    if (this.tl) {
      this.tl.kill();
    }

    // build timeline:
    this.tl = gsap.timeline({ defaults: { ease: 'sine.inOut' } });

    // 1) headline slides left as scroll starts (amount proportional to visibleWidth)
    // use a function so it recalculates on refresh/resize
    this.tl.to(
      headline,
      {
        x: () => -Math.min(visibleWidth * 0.085, 240), // slide left up to ~8.5% of visible width, clamped
        opacity: 0.98,
        duration: 1,
      },
      0
    );

    // 2) center "dezoom" & align all cards vertically
    this.tl.to(center, { scale: 1, y: 0, duration: 0.6 }, 0);
    this.tl.to([left, right, ...extras], { y: 0, duration: 0.6, stagger: 0.05 }, 0);

    // 3) reveal mobile vertical card (extraMobile) with fade+slide
    if (extraMobile) {
      this.tl.fromTo(extraMobile, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 0.15);
    }

    // small settle
    this.tl.to({}, { duration: 0.12 }, '+=0');

    // 4) horizontal travelling of the track
    this.tl.to(
      track,
      {
        x: () => -computeMaxTranslate(120),
        duration: 1.2,
      },
      '>'
    );

    // ScrollTrigger wiring (scrub: true, no pin)
    ScrollTrigger.matchMedia({
      // mobile: swap to video
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
        // remove leftover triggers
        ScrollTrigger.getAll().forEach((t) => t.kill());

        ScrollTrigger.create({
          animation: this.tl!,
          trigger: headline,
          start: 'top +=10%',
          end: () => '+=' + (spacer.offsetHeight || 1400),
          scrub: true,
          pin: false,
          invalidateOnRefresh: true,
          // markers: true
        });

        ScrollTrigger.addEventListener('refreshInit', () => {
          // On refresh recompute visibleWidth and recompute transforms
          this.tl?.invalidate();
          // recompute mosaic width to match any layout change
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
