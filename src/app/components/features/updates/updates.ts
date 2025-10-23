import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

type UpdateCard = {
  id: string;
  title: string;
  subtitle?: string;
  body: string;
  bg: string; // CSS color string
  cta?: string;
  href?: string;
};

@Component({
  selector: 'app-updates',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="updates" class="updates" aria-labelledby="updates-title">
      <div class="container">
        <header class="updates-header">
          <h2 id="updates-title" class="updates-title">
            Découvrez les dernières
            <span class="break">mises</span>
            <span class="break">à</span>
            <span class="break">jour</span>
            <span class="visually-hidden"> de Chrome</span>
          </h2>

          <p class="updates-lead">
            Toutes les quatre semaines, une nouvelle mise à jour de Chrome est publiée. Ainsi, vous
            bénéficiez des dernières fonctionnalités, ainsi que d'un navigateur plus sûr et plus
            performant.
          </p>
        </header>

        <div class="updates-grid" role="list">
          <article
            role="listitem"
            *ngFor="let card of cards()"
            class="update-card"
            [attr.data-id]="card.id"
            [style.background]="card.bg"
            [attr.aria-labelledby]="'card-' + card.id"
          >
            <div class="card-inner">
              <h3 id="{{ 'card-' + card.id }}" class="card-title">{{ card.title }}</h3>
              <p class="card-body">{{ card.body }}</p>
              <div class="card-actions">
                <a
                  class="card-link"
                  [attr.href]="card.href || '#'"
                  (click)="onCta(card.id, $event)"
                  >{{ card.cta || 'En savoir plus' }}</a
                >
              </div>
            </div>
          </article>
        </div>

        <!-- optional visual block: mock UI -->
        <div class="updates-visual" aria-hidden="true">
          <div class="visual-card">
            Section d'une interface utilisateur abstraite montrant que Chrome est prêt à être mis à
            jour.
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrls: ['./updates.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Updates {
  // état immuable (signal)
  readonly cards = signal<UpdateCard[]>([
    {
      id: 'auto',
      title: 'Mises à jour automatiques',
      body: 'Toutes les quatre semaines, une nouvelle mise à jour de Chrome est publiée. Ainsi, vous bénéficiez des dernières fonctionnalités, ainsi que d’un navigateur Web plus sûr et plus rapide.',
      bg: 'rgb(232, 240, 254)', // light blue
      cta: 'En savoir plus sur les mises à jour automatiques',
      href: '#',
    },
    {
      id: 'news',
      title: 'Nouveautés de Chrome',
      body: 'De nouveaux outils et fonctionnalités sont régulièrement ajoutés à Chrome pour améliorer votre expérience.',
      bg: 'rgb(254, 247, 224)', // light yellow
      cta: 'Découvrez les nouveautés de Chrome',
      href: '#',
    },
  ]);

  // Handler du CTA — laisse la logique de navigation / tracking à toi
  onCta(id: string, ev?: Event) {
    // exemple simple : empêcher si href="#"
    if (ev) {
      // ici tu peux envoyer un event GA, ouvrir un drawer, router, etc.
      // ev.preventDefault(); // si tu veux empêcher
    }
    // debug rapide (peut être enlevé)
    // console.log('CTA clicked', id);
  }
}
