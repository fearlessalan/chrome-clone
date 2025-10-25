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
    const imgs = Array.from(this.trackRef.nativeElement.querySelectorAll('img'));
    if (!imgs.length) {
      ScrollTrigger.refresh();
      return;
    }

    let loaded = 0;
    const onImageLoad = () => {
      loaded++;
      if (loaded === imgs.length) {
        this.ngZone.runOutsideAngular(() => ScrollTrigger.refresh());
      }
    };

    imgs.forEach((i) => {
      if (i.complete) onImageLoad();
      else i.addEventListener('load', onImageLoad, { once: true });
    });
  }

  private setupAnimations(): void {
    const scroller = this.elementRef.nativeElement.closest('.main-scroll-container');
    if (!scroller) {
      console.error('Le conteneur de scroll ".main-scroll-container" n_a pas été trouvé.');
      return;
    }

    const headline = this.headlineRef.nativeElement;
    const mosaic = this.mosaicRef.nativeElement;
    const track = this.trackRef.nativeElement;
    const videoWrapper = this.videoWrapperRef?.nativeElement;
    const cards = gsap.utils.toArray<HTMLElement>(track.querySelectorAll('.mosaic__card'));

    gsap.set(headline, { autoAlpha: 1, y: 0 });
    gsap.set(cards, {
      autoAlpha: 1,
      y: (i) => (i % 2 === 0 ? -60 : 60),
      scale: 1,
    });

    const computeMaxTranslate = () =>
      track.scrollWidth - mosaic.clientWidth + window.innerWidth * 0.15;

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
              scrub: 1.5,
              start: 'top bottom',
              end: 'bottom center',

              invalidateOnRefresh: true,
            },
          });

          tl.to(cards, {
            y: 0,
            ease: 'power2.inOut',
          }).to(
            track,
            {
              x: () => -computeMaxTranslate(),
              ease: 'none',
            },
            '>-0.2'
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
