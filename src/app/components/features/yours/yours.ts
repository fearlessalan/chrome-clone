import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-yours',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="yours" class="feature-section" aria-labelledby="yours-title">
      <div class="feature-inner">
        <h2 id="yours-title">À vous</h2>
        <p class="lead">
          Personnalisez Chrome selon vos envies : thèmes, onglets, profils et synchronisation.
        </p>

        <div class="two-cards">
          <article class="card">
            <h3>Personnalisation</h3>
            <p>
              Modifier thème, couleurs et présentation pour que Chrome ressemble à votre univers.
            </p>
            <a class="card-cta" href="#">Personnaliser</a>
          </article>

          <article class="card">
            <h3>Profils & synchronisation</h3>
            <p>Accédez à vos favoris, extensions et mots de passe sur tous vos appareils.</p>
            <a class="card-cta" href="#">Gérer les profils</a>
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
      .two-cards {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 18px;
      }
      .card {
        background: linear-gradient(180deg, #fff, #fbfdff);
        padding: 16px;
        border-radius: 12px;
        box-shadow: 0 8px 30px rgba(12, 18, 30, 0.04);
      }
      .card h3 {
        margin: 0 0 8px 0;
      }
      .card p {
        margin: 0 0 12px 0;
        color: #374151;
      }
      .card-cta {
        background: var(--primary, #1a73e8);
        color: #fff;
        padding: 8px 12px;
        border-radius: 10px;
        text-decoration: none;
        font-weight: 700;
      }
      @media (max-width: 920px) {
        .two-cards {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Yours {}
