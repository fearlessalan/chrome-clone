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
  imports: [CommonModule, MatIconModule],
  templateUrl: './fast.html',
  styleUrls: ['./fast.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Fast implements AfterViewInit, OnDestroy {
  @ViewChild('section', { static: true }) sectionRef!: ElementRef<HTMLElement>;
  @ViewChild('track', { static: true }) trackRef!: ElementRef<HTMLElement>;
  @ViewChild('pill', { static: true }) pillRef!: ElementRef<HTMLElement>;

  private ngZone = inject(NgZone);
  private ctx?: gsap.Context;

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
        const scroller = this.sectionRef.nativeElement.closest('.main-scroll-container');
        if (!scroller) return;

        this.initPillAnimation(scroller);

        gsap.matchMedia().add('(min-width: 601px)', () => {
          this.initHorizontalScroll(scroller);
        });
      }, this.sectionRef.nativeElement);
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
      start: 'top 85%',
      once: true,
      onEnter: () => pill.classList.add('is-animated'),
    });
  }

  private initHorizontalScroll(scroller: Element): void {
    const track = this.trackRef.nativeElement;
    const scrollDistance = track.scrollWidth - window.innerWidth;

    gsap.to(track, {
      x: -scrollDistance,
      ease: 'none',
      scrollTrigger: {
        trigger: this.sectionRef.nativeElement,
        scroller: scroller,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });
  }
}
