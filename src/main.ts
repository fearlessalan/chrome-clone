import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { App } from './app/app';

bootstrapApplication(App, {
  providers: [provideRouter([]), provideAnimationsAsync()],
}).catch((err) => console.error(err));
