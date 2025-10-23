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
import ScrollTrigger from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-yours',
  standalone: true,
  imports: [CommonModule],
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

  constructor() {
    gsap.registerPlugin(ScrollTrigger);
  }

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.ctx = gsap.context(() => {
          const scroller = this.elementRef.nativeElement.closest('.main-scroll-container');
          if (!scroller) return;
          this.initPillAnimation(scroller);
          this.initTakeOverAnimation(scroller);
          ScrollTrigger.refresh();
        }, this.sectionRef.nativeElement);
      }, 100);
    });
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }

  private initPillAnimation(scroller: Element): void {
    const pill = this.pillRef.nativeElement;
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

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: stickyContainer,
        scroller: scroller,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
      },
    });

    // SÉQUENCE 1 (0% -> 30% du scroll) : Zoom du masque pour remplir l'écran.
    tl.to(animationWrapper, {
      '--mask-scale': 4,
      '--mask-radius': 0,
      duration: 0.3, // Correspond à 30% de la timeline
    });

    // Le titre disparaît pendant le zoom.
    tl.to(
      animationWrapper,
      {
        '--title-translate-y': '-50px',
        '--title-opacity': 0,
        duration: 0.2,
      },
      0.1
    ); // Positionné à 10% de la timeline

    // SÉQUENCE 2 (30% -> 65% du scroll) : Révélation verticale de la première capture.
    tl.to(
      animationWrapper,
      {
        '--first-image-clip': 0,
        duration: 0.35, // Durée de 35% (65% - 30%)
      },
      0.3
    ); // Commence à 30% de la timeline

    // SÉQUENCE 3 (65% -> 100% du scroll) : Révélation verticale de la deuxième capture.
    tl.to(
      animationWrapper,
      {
        '--second-image-clip': 0,
        duration: 0.35, // Durée de 35% (100% - 65%)
      },
      0.65
    ); // Commence à 65% de la timeline
  }

  readonly pillText = 'Personnalisez-le'.split('');
}
