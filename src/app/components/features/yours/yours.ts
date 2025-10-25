import {
  Component,
  ChangeDetectionStrategy,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  NgZone,
  inject,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger'; // On garde l'import v0
import { TimedAccordion } from './timed-accordion/timed-accordion';
import { KeyframeAnimation } from './keyframe-animation/keyframe-animation';
import { Skeleton } from '../../skeleton/skeleton';

@Component({
  selector: 'app-yours',
  standalone: true,
  imports: [CommonModule, TimedAccordion, KeyframeAnimation, Skeleton],
  templateUrl: './yours.html',
  styleUrls: ['./yours.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Yours implements AfterViewInit, OnDestroy {
  @ViewChild('section', { static: true }) sectionRef!: ElementRef<HTMLElement>;
  @ViewChild('pill', { static: true }) pillRef!: ElementRef<HTMLElement>;
  @ViewChild('stickyContainer', { static: true }) stickyContainerRef!: ElementRef<HTMLElement>;
  @ViewChild('animationWrapper', { static: true }) animationWrapperRef!: ElementRef<HTMLElement>;

  private elementRef = inject(ElementRef);
  private ngZone = inject(NgZone);
  private ctx?: gsap.Context;

  readonly pillText = 'Personnalisez-le'.split('');

  constructor() {
    // On garde ton register v0, mais avec un check SSR
    if (typeof window !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }
  }

  ngAfterViewInit(): void {
    // On garde ton hack, mais on le rend plus robuste
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        // <--- Ton timeout est là, G.
        this.ctx = gsap.context(() => {
          const scroller = this.elementRef.nativeElement.closest('.main-scroll-container');
          if (!scroller) {
            console.warn('Scroller .main-scroll-container non trouvé.');
            return;
          }

          // ==================================================================
          // LE BLINDAGE OBLIGATOIRE : matchMedia
          // ==================================================================
          gsap.matchMedia().add(
            {
              // On définit nos breakpoints
              isDesktop: '(min-width: 769px)', // Breakpoint où l'anim "take-over" s'active
              isMobile: '(max-width: 768px)', // Breakpoint où elle est cachée
            },
            (context) => {
              const { isDesktop } = context.conditions as any;

              // --- Anim 1 : Le "Pill" (tourne partout) ---
              this.initPillAnimation(scroller);

              if (isDesktop) {
                // --- Anim 2 : Le "Take Over" (desktop UNIQUEMENT) ---
                // Si on est sur mobile, ce code n'est JAMAIS appelé.
                // Donc ScrollTrigger ne pète pas sur un élément en display:none.
                this.initTakeOverAnimation(scroller);
              }
            }
          );

          // On rafraîchit une fois que tout est set up
          ScrollTrigger.refresh();
        }, this.sectionRef.nativeElement);
      }, 100); // <--- On garde tes 100ms
    });
  }

  ngOnDestroy(): void {
    // Le .revert() va clean le contexte, y compris le matchMedia. Propre.
    this.ctx?.revert();
  }

  private initPillAnimation(scroller: Element): void {
    const pill = this.pillRef.nativeElement;
    // On garde ta logique v0
    ScrollTrigger.create({
      trigger: pill,
      scroller: scroller,
      start: 'top 80%',
      once: true,
      onEnter: () => pill.classList.add('is-animated'),
    });
  }

  private initTakeOverAnimation(scroller: Element): void {
    const stickyContainer = this.stickyContainerRef.nativeElement;
    const animationWrapper = this.animationWrapperRef.nativeElement;

    // On garde ta timeline v0
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: stickyContainer,
        scroller: scroller,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
      },
    });

    // SÉQUENCE 1 : Zoom + Fade Titre
    tl.to(animationWrapper, {
      '--mask-scale': 4,
      '--mask-radius': 0,
      duration: 0.3,
    }).to(
      animationWrapper,
      {
        '--title-translate-y': '-50px',
        '--title-opacity': 0,
        duration: 0.2,
      },
      0.1
    );

    // SÉQUENCE 2 : Révélation UI 1
    tl.to(
      animationWrapper,
      {
        '--first-image-clip': 0,
        '--bg-opacity': 0,
        duration: 0.35,
      },
      0.3
    );

    // SÉQUENCE 3 : Révélation UI 2
    tl.to(
      animationWrapper,
      {
        '--second-image-clip': 0,
        duration: 0.35,
      },
      0.65
    );
  }
}
