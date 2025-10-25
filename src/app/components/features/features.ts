import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
  signal,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { Updates } from './updates/updates';
import { Yours } from './yours/yours';
import { Safe } from './safe/safe';
import { Fast } from './fast/fast';
import { ByGoogle } from './by-google/by-google';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [CommonModule, Updates, Yours, Safe, Fast, ByGoogle, MatIcon],
  templateUrl: './features.html',
  styleUrls: ['./features.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Features implements AfterViewInit, OnDestroy {
  @ViewChild('root', { static: true }) rootRef!: ElementRef<HTMLElement>;
  @ViewChild('navContainer', { static: true }) navContainerRef!: ElementRef<HTMLElement>;
  @ViewChild('navList', { static: true }) navListRef!: ElementRef<HTMLUListElement>;
  @ViewChild('glider', { static: true }) gliderRef!: ElementRef<HTMLElement>;

  activeAnchor = signal<string>('updates');
  isMobileMenuOpen = signal<boolean>(false);

  private io?: IntersectionObserver;
  private navVisibilityObserver?: IntersectionObserver;
  private sections: HTMLElement[] = [];
  private st?: ScrollTrigger;

  constructor(private ngZone: NgZone) {
    gsap.registerPlugin(ScrollTrigger);
    effect(() => {
      this.updateGliderPosition(this.activeAnchor());
    });
  }

  ngAfterViewInit(): void {
    const host = this.rootRef.nativeElement;
    this.sections = Array.from(host.querySelectorAll<HTMLElement>('section[id]'));

    this.ngZone.runOutsideAngular(() => {
      this.setupIntersectionObserver();
      this.setupStickyBehavior();
      this.setupNavVisibilityObserver();
    });
  }

  ngOnDestroy(): void {
    this.io?.disconnect();
    this.navVisibilityObserver?.disconnect();
    this.st?.kill();
  }

  private setupNavVisibilityObserver(): void {
    const scroller = this.rootRef.nativeElement.closest('.main-scroll-container');
    const nav = this.navContainerRef.nativeElement;
    const host = this.rootRef.nativeElement;

    this.navVisibilityObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          nav.classList.add('is-visible-on-mobile');
        } else {
          nav.classList.remove('is-visible-on-mobile');
        }
      },
      { root: scroller, threshold: 0.01 }
    );

    this.navVisibilityObserver.observe(host);
  }

  private setupIntersectionObserver(): void {
    const scroller = this.rootRef.nativeElement.closest('.main-scroll-container');
    this.io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) {
          const id = visible.target.getAttribute('id') || '';
          this.ngZone.run(() => this.activeAnchor.set(id));
        }
      },
      { root: scroller, threshold: [0.25, 0.5, 0.75] }
    );
    this.sections.forEach((s) => this.io!.observe(s));
  }

  private setupStickyBehavior(): void {
    const scroller = this.rootRef.nativeElement.closest('.main-scroll-container');
    const nav = this.navContainerRef.nativeElement;
    this.st = ScrollTrigger.create({
      scroller: scroller,
      trigger: 'app-header',
      start: 'bottom top',
      onEnter: () => gsap.to(nav, { top: '2vh', duration: 0.3 }),
      onLeaveBack: () => gsap.to(nav, { top: '7vh', duration: 0.3 }),
    });
  }

  private updateGliderPosition(activeId: string): void {
    const navList = this.navListRef.nativeElement;
    const activeLink = navList.querySelector(`a[href="#${activeId}"]`) as HTMLElement;
    const glider = this.gliderRef.nativeElement;

    if (activeLink) {
      gsap.to(glider, {
        x: activeLink.offsetLeft,
        width: activeLink.offsetWidth,
        duration: 0.4,
        ease: 'power3.out',
      });
    }
  }

  isActive(id: string): boolean {
    return this.activeAnchor() === id;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.set(!this.isMobileMenuOpen());
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }
}
