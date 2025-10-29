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
import { Skeleton } from '../../skeleton/skeleton';
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
  imports: [CommonModule, MatIconModule, Skeleton],
  templateUrl: './fast.html',
  styleUrls: ['./fast.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Fast implements AfterViewInit, OnDestroy {
  @ViewChild('scrollContainer', { static: true }) scrollContainerRef!: ElementRef<HTMLElement>;
  @ViewChild('track', { static: true }) trackRef!: ElementRef<HTMLElement>;
  @ViewChild('pill', { static: true }) pillRef!: ElementRef<HTMLElement>;
  @ViewChild('section', { static: true }) sectionRef!: ElementRef<HTMLElement>;

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
      requestAnimationFrame(() => {
        this.ctx = gsap.context(() => {
          const scroller = this.sectionRef.nativeElement.closest('.main-scroll-container');
          if (!scroller) return;

          this.initPillAnimation(scroller);

          gsap.matchMedia().add('(min-width: 601px)', () => {
            this.initHorizontalScroll(scroller);
          });
        }, this.sectionRef.nativeElement);
      });
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

  // Dans fast.ts

  // Dans fast.ts

  private initHorizontalScroll(scroller: Element): void {
    const track = this.trackRef.nativeElement;
    const scrollContainer = this.scrollContainerRef.nativeElement;
    const featureCard = track.querySelector('.fast-card.is-feature') as HTMLElement;
    const visualContent = featureCard.querySelector('.visual-content') as HTMLElement;
    const textContent = featureCard.querySelector('.text-content') as HTMLElement;

    const scrollDistance = track.scrollWidth - window.innerWidth;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: scrollContainer,
        scroller: scroller,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    // On anime la carte "feature" pour qu'elle atteigne sa taille finale
    tl.fromTo(
      featureCard,
      {
        // FROM: État initial "large"
        width: '80vw',
        height: '70vh',
        borderRadius: 0,
        boxShadow: 'none',
        padding: 0,
      },
      {
        // TO: État final, maintenant identique aux autres cartes
        width: '35vw', // 👈 LA MODIF EST ICI
        height: '500px',
        borderRadius: '1.5rem',
        boxShadow: 'var(--shadow-soft)',
        padding: '2rem',
        ease: 'power1.inOut',
        duration: 0.3,
      },
      0
    )
      // Le reste de la timeline est parfait, on n'y touche pas
      .fromTo(
        visualContent,
        { height: '100%', top: '0%', left: '0rem', right: '0rem' },
        {
          height: '50%',
          top: '50%',
          left: '2rem',
          right: '2rem',
          ease: 'power1.inOut',
          duration: 0.3,
        },
        0
      )
      .fromTo(textContent, { opacity: 0 }, { opacity: 1, ease: 'power1.in', duration: 0.1 }, 0.15)
      .to(track, {
        x: -scrollDistance,
        ease: 'none',
        duration: 0.7,
      });
  }
}
