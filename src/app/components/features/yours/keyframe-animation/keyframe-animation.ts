import {
  Component,
  ChangeDetectionStrategy,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  NgZone,
  inject,
  ViewChild,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-keyframe-animation',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './keyframe-animation.html',
  styleUrls: ['./keyframe-animation.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KeyframeAnimation implements AfterViewInit, OnDestroy {
  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLElement>;
  @ViewChildren('layer') layers!: QueryList<ElementRef<HTMLElement>>;

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
          const container = this.containerRef.nativeElement;
          const layerElements = this.layers.map((elRef) => elRef.nativeElement);

          if (!scroller || layerElements.length < 5) {
            console.error('Keyframe Animation: Éléments critiques manquants.');
            return;
          }

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: container,
              scroller: scroller,
              start: 'top 80%',
              end: 'bottom 20%',
              scrub: 1,
            },
          });

          // ON NE TOUCHE PLUS AU FOND. IL EST STABLE.
          // La ligne qui animait layerElements[0] a été SUPPRIMÉE.

          // Calque 2 : Panier (bleu)
          tl.fromTo(layerElements[1], { x: 0, y: 0, scale: 1 }, { x: 20, y: -40, scale: 0.8 }, 0);

          // Calque 3 : Presse-papier (blanc)
          tl.fromTo(layerElements[2], { x: 0, y: 0 }, { x: -30, y: 50 }, 0);

          // Calque 4 : Calendrier (rouge)
          tl.fromTo(layerElements[3], { x: 0, y: 0, scale: 1 }, { x: 40, y: -40, scale: 1.2 }, 0);

          // Calque 5 : Crayon (vert)
          tl.fromTo(layerElements[4], { x: 0, y: 0 }, { x: -50, y: 30 }, 0);
        }, this.elementRef.nativeElement);
      }, 100);
    });
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }
}
