import { Component, ChangeDetectionStrategy, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

// On définit un type pour nos cartes pour un code plus propre
type SafeCard = {
  id: string;
  gridArea: string; // Pour le positionnement dans la grille CSS
  variant: 'white' | 'light-blue' | 'blue' | 'dark-blue';

  // Contenu de la face AVANT
  front: {
    title: string;
    content: string;
    icon?: string;
  };

  // Contenu de la face ARRIÈRE
  back: {
    title: string;
    content: string;
    cta: string;
  };
};

@Component({
  selector: 'app-safe',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './safe.html',
  styleUrls: ['./safe.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Safe {
  // --- ÉTAT DU COMPOSANT ---

  // On stocke les données de nos cartes dans un signal
  readonly cards = signal<SafeCard[]>([
    {
      id: 'password-manager',
      gridArea: 'password',
      variant: 'white',
      front: {
        title: 'Gestionnaire de mots de passe sécurisés sur tous les sites.',
        content: 'elisa.beckett',
      },
      back: {
        title: 'Enregistrer le mot de passe?',
        content:
          'Avec le Gestionnaire de mots de passe de Google intégré à Chrome, vous pouvez facilement créer, enregistrer et renseigner vos mots de passe.',
        cta: 'En savoir plus',
      },
    },
    {
      id: 'safety-check',
      gridArea: 'check',
      variant: 'light-blue',
      front: {
        title: 'En un clic, vérifiez votre niveau de sécurité en temps réel.',
        content: '',
        icon: 'add_circle',
      },
      back: {
        title: 'Contrôle de sécurité effectué. Il y a peu.',
        content:
          'La confidentialité de votre expérience de navigation sur Internet, y compris des mots de passe, des extensions et des paramètres.',
        cta: 'En savoir plus',
      },
    },
    {
      id: 'privacy-guide',
      gridArea: 'guide',
      variant: 'dark-blue',
      front: {
        title: 'Guide sur la confidentialité',
        content:
          'Gardez le contrôle de votre confidentialité grâce à des paramètres faciles à utiliser.',
      },
      back: {
        title: 'Consulter le Guide sur la confidentialité',
        content:
          'Avec Chrome, vous savez exactement ce que vous partagez en ligne et avec qui. Consultez le Guide sur la confidentialité pour découvrir pas à pas vos paramètres de confidentialité.',
        cta: 'En savoir plus',
      },
    },
    {
      id: 'safe-browsing',
      gridArea: 'browsing',
      variant: 'white',
      front: {
        title: 'Navigation sécurisée avec protection renforcée',
        content: 'Naviguez en toute confiance, avec une meilleure protection en ligne.',
        icon: 'add_circle',
      },
      back: {
        title: 'Le site que vous allez ouvrir contient des logiciels malveillants',
        content:
          "La navigation sécurisée de Chrome vous avertit en cas d'attaque par un logiciel malveillant ou par hameçonnage.",
        cta: 'En savoir plus',
      },
    },
  ]);

  // On utilise un Map pour stocker l'état "retourné" de chaque carte.
  // La clé est l'ID de la carte, la valeur est un signal (true/false).
  readonly flippedStates = new Map<string, WritableSignal<boolean>>();

  constructor() {
    // On initialise le Map : pour chaque carte, on crée un signal initialisé à 'false'.
    this.cards().forEach((card) => {
      this.flippedStates.set(card.id, signal(false));
    });
  }

  // Méthode appelée au clic sur une carte
  flipCard(cardId: string): void {
    const cardState = this.flippedStates.get(cardId);
    if (cardState) {
      // On inverse la valeur du signal (true -> false, false -> true)
      cardState.update((value) => !value);
    }
  }

  // Méthode pour vérifier si une carte est retournée (utilisée dans le template)
  isFlipped(cardId: string): boolean {
    return this.flippedStates.get(cardId)?.() || false;
  }
}
