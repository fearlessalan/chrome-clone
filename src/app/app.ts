import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  effect,
  inject,
  OnInit,
  Renderer2,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';

import { Header } from './components/header/header';
import { Hero } from './components/hero/hero';
import { Features } from './components/features/features';
import { Footer } from './components/footer/footer';

import { SidenavService } from './services/sidenav';
import { Faq } from './components/faq/faq';
import { ClosingBanner } from './components/closing-banner/closing-banner';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatListModule,
    MatButtonModule,
    Header,
    Hero,
    Features,
    Footer,
    Faq,
    ClosingBanner,
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);

  constructor(public sidenavService: SidenavService) {
    // L'effect va s'executer à chaque fois que le signal 'opened' change
    effect(() => {
      if (this.sidenavService.opened()) {
        this.renderer.addClass(this.document.body, 'sidenav-open');
      } else {
        this.renderer.removeClass(this.document.body, 'sidenav-open');
      }
    });
  }

  ngOnInit(): void {
    this.sidenavService.initAutoClose(920);
  }
}
