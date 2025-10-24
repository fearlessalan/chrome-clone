import { Component, ChangeDetectionStrategy, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

// Type mis à jour pour inclure un "eyebrow" (le petit titre)
type GoogleCard = {
  id: string;
  gridArea: string;
  variant: 'yellow' | 'white';
  front: {
    eyebrow: string;
    title: string;
  };
  back: {
    content: string;
    cta: string;
  };
};

@Component({
  selector: 'app-by-google',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './by-google.html',
  styleUrls: ['./by-google.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ByGoogle {
  // --- Données corrigées : seulement 2 cartes ---
  readonly cards = signal<GoogleCard[]>([
    {
      id: 'search',
      gridArea: 'a',
      variant: 'yellow',
      front: {
        eyebrow: 'MOTEUR DE RECHERCHE GOOGLE',
        title: 'Une barre de recherche à votre image, directement intégrée.',
      },
      back: {
        content:
          "Tout un univers de connaissances, à portée de main. Consultez la météo, résolvez des équations mathématiques et profitez de résultats de recherche instantanés, le tout depuis la barre d'adresse de votre navigateur.",
        cta: 'Découvrir la recherche intégrée',
      },
    },
    {
      id: 'workspace',
      gridArea: 'b',
      variant: 'white',
      front: {
        eyebrow: 'GOOGLE WORKSPACE',
        title: 'Travaillez, avec ou sans Wi-Fi.',
      },
      back: {
        content:
          'Utilisez Gmail, Google Docs, Google Slides, Google Sheets, Google Traduction et Google Drive même sans connexion Internet.',
        cta: 'Découvrez comment travailler hors connexion',
      },
    },
  ]);

  // La logique de flip reste la même, elle est déjà parfaite
  readonly flippedStates = new Map<string, WritableSignal<boolean>>();

  constructor() {
    this.cards().forEach((card) => {
      this.flippedStates.set(card.id, signal(false));
    });
  }

  toggleCard(cardId: string): void {
    const cardState = this.flippedStates.get(cardId);
    if (cardState) {
      cardState.update((value) => !value);
    }
  }

  isFlipped(cardId: string): boolean {
    return this.flippedStates.get(cardId)?.() || false;
  }
}
