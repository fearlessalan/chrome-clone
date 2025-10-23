import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { Updates } from './updates/updates';
import { Yours } from './yours/yours';
import { Safe } from './safe/safe';
import { Fast } from './fast/fast';
import { ByGoogle } from './by-google/by-google';

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [CommonModule, Updates, Yours, Safe, Fast, ByGoogle],
  templateUrl: './features.html',
  styleUrls: ['./features.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Features implements AfterViewInit, OnDestroy {
  @ViewChild('root', { static: true }) rootRef!: ElementRef<HTMLElement>;

  // signal to track active anchor id for lateral navbar
  activeAnchor = signal<string>('by-google');

  private io?: IntersectionObserver;
  private sections: HTMLElement[] = [];

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    // query sections inside this component
    const host = this.rootRef.nativeElement;
    this.sections = Array.from(host.querySelectorAll<HTMLElement>('section[id]'));

    // run observer outside angular for perf
    this.ngZone.runOutsideAngular(() => {
      this.io = new IntersectionObserver(
        (entries) => {
          // find the most visible section (largest intersectionRatio)
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

          if (visible) {
            const id = visible.target.getAttribute('id') || '';
            // re-enter angular zone to update signal (so templates update)
            this.ngZone.run(() => this.activeAnchor.set(id));
          }
        },
        { threshold: [0.25, 0.5, 0.75] }
      );

      this.sections.forEach((s) => this.io!.observe(s));
    });
  }

  ngOnDestroy(): void {
    if (this.io) {
      this.io.disconnect();
      this.io = undefined;
    }
  }

  // helper used in template
  isActive(id: string): boolean {
    return this.activeAnchor() === id;
  }
}
