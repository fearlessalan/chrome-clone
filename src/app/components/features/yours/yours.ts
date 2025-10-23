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
      // On attend un cycle de rendu pour être sûr que tout le DOM est en place
      setTimeout(() => {
        this.ctx = gsap.context(() => {
          const scroller = this.elementRef.nativeElement.closest('.main-scroll-container');

          if (!scroller) {
            // Si on ne trouve pas le scroller, on arrête et on crie.
            console.error(
              "ERREUR CRITIQUE : Le conteneur de scroll '.main-scroll-container' est INTROUVABLE. Les animations de la section 'Yours' ne peuvent pas démarrer."
            );
            return;
          }

          // Si on arrive ici, c'est que le scroller est trouvé. Bonne nouvelle.
          console.log("Scroller trouvé pour la section 'Yours'", scroller);

          this.initPillAnimation(scroller);
          this.initTakeOverAnimation(scroller);

          // On force un refresh de ScrollTrigger au cas où les dimensions n'étaient pas prêtes.
          ScrollTrigger.refresh();
        }, this.sectionRef.nativeElement);
      }, 100); // On met un petit délai de 100ms pour être large.
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
      // markers: true, // Décommente pour débugger la pilule si besoin
      onEnter: () => pill.classList.add('is-animated'),
    });
  }

  private initTakeOverAnimation(scroller: Element): void {
    const stickyContainer = this.stickyContainerRef.nativeElement;
    const animationWrapper = this.animationWrapperRef.nativeElement;

    console.log("Initialisation de l'animation TakeOver. Trigger:", stickyContainer);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: stickyContainer,
        scroller: scroller,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1, // Mettre 1 ou un chiffre est souvent plus smooth que 'true'
      },
    });

    tl.to(animationWrapper, { '--mask-scale': 12, duration: 0.3 }).to(
      animationWrapper,
      { '--mask-radius': 0, duration: 0.3 },
      '<'
    );
    tl.to(animationWrapper, { '--title-translate-y': '50px', duration: 0.3 }, 0).to(
      animationWrapper,
      { '--title-opacity': 0, duration: 0.2 },
      0.1
    );
    tl.to(animationWrapper, { '--first-image-clip': 0, duration: 0.35 }, 0.3);
    tl.to(animationWrapper, { '--second-image-clip': 0, duration: 0.35 }, 0.65);
  }

  readonly pillText = 'Personnalisez-le'.split('');
}
