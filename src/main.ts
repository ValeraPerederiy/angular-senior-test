import { DEFAULT_CURRENCY_CODE, LOCALE_ID } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withHashLocation } from '@angular/router';

import { AppComponent } from './app/app.component';
import { APP_ROUTES } from './app/app.routing';

const isStackBlitz =
  location.hostname.endsWith('.webcontainer.io') ||
  location.hostname.includes('stackblitz') ||
  (navigator.userAgent || '').toLowerCase().includes('webcontainer');

const routerProviders = isStackBlitz ? provideRouter(APP_ROUTES, withHashLocation()) : provideRouter(APP_ROUTES);

bootstrapApplication(AppComponent, {
  providers: [
    routerProviders,
    { provide: LOCALE_ID, useValue: 'uk-UA' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: '₴' },
    provideAnimations(),
  ],
}).catch((err) => console.error(err));
