import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="fast" class="feature-section" aria-labelledby="fast-title">
      <div class="feature-inner">
        <h2 id="fast-title">Rapide</h2>
        <p class="lead">
          Des performances optimisées : chargement, moteur JavaScript et optimisations réseau.
        </p>

        <div class="cards">
          <article class="card">
            <h3>Vitesse de chargement</h3>
            <p>Chrome optimise le rendu et priorise le contenu visible.</p>
          </article>

          <article class="card">
            <h3>Outils dev</h3>
            <p>Des outils pour mesurer et améliorer les performances de tes pages.</p>
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
        background: #fff;
        box-shadow: 0 8px 30px rgba(12, 18, 30, 0.04);
      }
      @media (max-width: 920px) {
        .cards {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Fast {}
