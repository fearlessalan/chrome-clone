import { Injectable, NgZone } from '@angular/core';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

@Injectable({ providedIn: 'root' })
export class GsapUtilsService {
  private readonly scrollerSelector = '.main-scroll-container';
  private pluginRegistered = false;

  constructor(private ngZone: NgZone) {
    this.registerScrollTrigger();
  }

  /** Enregistre ScrollTrigger une seule fois */
  private registerScrollTrigger(): void {
    if (typeof window === 'undefined') return;

    if (!this.pluginRegistered) {
      gsap.registerPlugin(ScrollTrigger);
      this.pluginRegistered = true;
    }
  }

  /** Crée un ScrollTrigger préconfiguré avec notre scroller custom */
  createScrollTrigger(options: ScrollTrigger.Vars): ScrollTrigger {
    return this.ngZone.runOutsideAngular(() =>
      ScrollTrigger.create({
        scroller: this.scrollerSelector,
        ...options,
      })
    );
  }

  /** Setter ultra rapide pour les props CSS (optimisé FPS) */
  quickSetter(target: Element, property: string, unit?: string) {
    return gsap.quickSetter(target, property, unit);
  }

  /** Force un refresh global (utile après resize ou lazy load) */
  refreshAll(): void {
    this.ngZone.runOutsideAngular(() => {
      ScrollTrigger.refresh();
    });
  }

  /** Kill tous les triggers du projet (utile pour cleanup global) */
  killAll(): void {
    this.ngZone.runOutsideAngular(() => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    });
  }

  /** Création basique d'une animation GSAP dans la zone Angular-safe */
  animate(target: gsap.TweenTarget, vars: gsap.TweenVars): gsap.core.Tween {
    return this.ngZone.runOutsideAngular(() => gsap.to(target, vars));
  }
}
