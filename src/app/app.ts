import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';

import { Header } from './components/header/header';
import { Hero } from './components/hero/hero';
import { Features } from './components/features/features';
import { Footer } from './components/footer/footer';

import { SidenavService } from './services/sidenav';

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
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  // <-- expose public pour pouvoir l'utiliser dans le template
  constructor(public sidenavService: SidenavService) {}

  ngOnInit(): void {
    this.sidenavService.initAutoClose(920);
  }
}
