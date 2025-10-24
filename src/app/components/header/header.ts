import { Component, ElementRef, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { GsapUtilsService } from '../../services/gsap-utils';
import { SidenavService } from '../../services/sidenav';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header implements OnInit {
  private gsapUtils = inject(GsapUtilsService);
  private sidenav = inject(SidenavService);
  private el = inject(ElementRef);

  ngOnInit(): void {
    this.animateEntrance();
  }

  /** Animation d’apparition du header */
  private animateEntrance(): void {
    const headerEl = this.el.nativeElement.querySelector('.header');
    this.gsapUtils.animate(headerEl, {
      y: -40,
      opacity: 0,
      duration: 0,
    });
    this.gsapUtils.animate(headerEl, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'power2.out',
      delay: 0.2,
    });
  }

  /** Ouvre ou ferme le menu latéral mobile */
  toggleMenu(): void {
    this.sidenav.toggle();
  }
}
