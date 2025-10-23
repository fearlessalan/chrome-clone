import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-by-google',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="by-google" class="feature-section" aria-labelledby="by-google-title">
      <div class="feature-inner">
        <h2 id="by-google-title">Par Google</h2>
        <p class="lead">
          Fonctionnalités développées par Google pour améliorer sécurité, intégration et innovation.
        </p>

        <div class="cards">
          <article class="card">
            <h3>Intégration</h3>
            <p>Connexion renforcée avec les services Google pour une expérience fluide.</p>
          </article>

          <article class="card">
            <h3>Innovations</h3>
            <p>Expériences et APIs nouvelles testées par Google pour faire avancer le web.</p>
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
export class ByGoogle {}
