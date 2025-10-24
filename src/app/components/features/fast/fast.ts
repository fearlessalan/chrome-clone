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
  @ViewChild('carousel', { static: true }) carouselRef!: ElementRef<HTMLElement>;
  @ViewChild('carouselWrapper', { static: true }) wrapperRef!: ElementRef<HTMLElement>;

  private elementRef = inject(ElementRef);
  private ngZone = inject(NgZone);
  private ctx?: gsap.Context;

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
    gsap.registerPlugin(ScrollTrigger);
  }

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.ctx = gsap.context(() => {
          const scroller = this.elementRef.nativeElement.closest('.main-scroll-container');
          if (!scroller) return;

          const section = this.sectionRef.nativeElement;
          const carousel = this.carouselRef.nativeElement;
          const wrapper = this.wrapperRef.nativeElement;
          const cards = gsap.utils.toArray<HTMLElement>('.fast-card');
          const featureCard = cards[0];
          const normalCards = cards.slice(1);

          // --- Fonctions de calcul dynamique (comme dans le code original) ---
          const getGap = () => parseFloat(getComputedStyle(wrapper).gap) || 24;
          const calculateGridWidth = (columns: number) => {
            const gap = getGap();
            return ((carousel.offsetWidth - 11 * gap) / 12) * columns + (columns - 1) * gap;
          };
          const calculateWrapperX = () => {
            return -(wrapper.scrollWidth - carousel.offsetWidth);
          };

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              scroller: scroller,
              pin: true,
              scrub: 1,
              start: 'top top',
              end: () => `+=${wrapper.scrollWidth}`, // La durée du pin dépend de la largeur totale
              invalidateOnRefresh: true, // Recalcule tout au resize
            },
          });

          // LA VRAIE CHORÉGRAPHIE

          // Acte 1 & 2 : Transformation de la carte vedette et des autres cartes
          tl.fromTo(
            featureCard,
            {
              width: () => `${calculateGridWidth(12)}px`, // Pleine largeur
              height: '80vh',
            },
            {
              width: () => `${calculateGridWidth(4)}px`, // Taille normale (4 colonnes sur 12)
              height: '500px',
              ease: 'sine.inOut',
            }
          )
            .fromTo(
              normalCards,
              {
                x: () => carousel.offsetWidth, // Commence hors-champ à droite
              },
              {
                x: 0,
                ease: 'sine.inOut',
                stagger: 0.05, // Léger décalage pour un effet plus naturel
              },
              '<'
            ) // '<' = en même temps que l'animation précédente

            // Acte 3 : Scroll horizontal du carrousel
            .to(wrapper, {
              x: () => calculateWrapperX(),
              ease: 'none', // Le scroll est linéaire
            });
        }, this.sectionRef.nativeElement);
      }, 100);
    });
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
  }
}
