import {
  Component,
  ChangeDetectionStrategy,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  NgZone,
  inject,
  signal,
  computed,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';

// On définit le type de nos slides pour un code propre
type AccordionItem = {
  id: string;
  title: string;
  description: string;
  cta?: string;
};

@Component({
  selector: 'app-timed-accordion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timed-accordion.html',
  styleUrls: ['./timed-accordion.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimedAccordion implements AfterViewInit, OnDestroy {
  private elementRef = inject(ElementRef);
  private ngZone = inject(NgZone);

  // --- ÉTAT DU COMPOSANT (SIGNALS) ---
  readonly items = signal<AccordionItem[]>([
    {
      id: 'customize',
      title: 'Personnalisez Chrome',
      description:
        "Personnalisez votre navigateur Web grâce à des thèmes, au mode sombre ainsi qu'à d'autres options conçues juste pour vous.",
      cta: 'Découvrir les thèmes',
    },
    {
      id: 'devices',
      title: 'Naviguez sur tous les appareils',
      description:
        "Connectez-vous à Chrome sur l'appareil de votre choix pour accéder à vos favoris, mots de passe enregistrés et bien plus encore.",
    },
    {
      id: 'autofill',
      title: 'Gagnez du temps avec la saisie automatique',
      description:
        'Enregistrez des adresses, des mots de passe et bien plus dans Chrome pour la saisie automatique de vos informations.',
    },
  ]);

  readonly activeIndex = signal(0);
  readonly isPaused = signal(false); // Mis à true au survol

  // Signal calculé pour obtenir l'ID du slide actif
  readonly activeId = computed(() => this.items()[this.activeIndex()]?.id || '');

  private timer: any;
  private observer?: IntersectionObserver;

  constructor() {
    // Effet qui redémarre le timer quand on n'est plus en pause
    effect(() => {
      if (!this.isPaused()) {
        this.startTimer();
      } else {
        this.stopTimer();
      }
    });
  }

  ngAfterViewInit(): void {
    // L'IntersectionObserver va démarrer/arrêter le carrousel
    // quand il entre ou sort de l'écran.
    this.ngZone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(
        ([entry]) => {
          this.ngZone.run(() => {
            this.isPaused.set(!entry.isIntersecting);
          });
        },
        { threshold: 0.1 }
      );

      this.observer.observe(this.elementRef.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.stopTimer();
    this.observer?.disconnect();
  }

  // --- LOGIQUE DU CARROUSEL ---
  private startTimer(): void {
    this.stopTimer(); // On s'assure qu'il n'y a pas de doublons
    this.timer = setInterval(() => {
      this.next();
    }, 7000); // 7 secondes par slide
  }

  private stopTimer(): void {
    clearInterval(this.timer);
  }

  private next(): void {
    this.activeIndex.update((currentIndex) => (currentIndex + 1) % this.items().length);
  }

  // --- MÉTHODES POUR LE TEMPLATE ---
  selectItem(index: number): void {
    this.activeIndex.set(index);
    this.isPaused.set(true); // Pause au clic
  }
}
