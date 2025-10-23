import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-safe',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="safe" class="feature-section" aria-labelledby="safe-title">
      <div class="feature-inner">
        <h2 id="safe-title">Sécurisé</h2>
        <p class="lead">
          Chrome protège votre navigation : mises à jour, navigation sécurisée et contrôle de la vie
          privée.
        </p>

        <div class="cards">
          <article class="card card-blue">
            <h3>Protection automatique</h3>
            <p>Chrome te protège contre les sites malveillants et les téléchargements suspects.</p>
          </article>

          <article class="card card-yellow">
            <h3>Contrôles de confidentialité</h3>
            <p>
              Gère les permissions des sites, efface facilement tes données et contrôle les
              trackers.
            </p>
          </article>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .feature-section {
        padding: 36px 0;
      }
      .feature-inner {
        max-width: 920px;
        margin: 0 auto;
      }
      .lead {
        color: var(--muted, #6b7280);
        margin-bottom: 18px;
      }
      .cards {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 18px;
      }
      .card {
        padding: 16px;
        border-radius: 12px;
        box-shadow: 0 8px 30px rgba(12, 18, 30, 0.04);
      }
      .card-blue {
        background: rgb(232, 240, 254);
      } /* light blue */
      .card-yellow {
        background: rgb(254, 247, 224);
      } /* light yellow */
      @media (max-width: 920px) {
        .cards {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Safe {}
