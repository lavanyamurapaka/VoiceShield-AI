import { Routes } from '@angular/router';
import { DetectionComponent } from './features/detection/detection.component';
import { VerificationComponent } from './features/verification/verification.component';
import { AlertsComponent } from './features/alerts/alerts.component';
import { AnalyticsComponent } from './features/analytics/analytics.component';
import { HealthComponent } from './features/health/health.component';

export const routes: Routes = [
  { path: '', redirectTo: 'detection', pathMatch: 'full' },
  { path: 'detection', component: DetectionComponent },
  { path: 'verification', component: VerificationComponent },
  { path: 'alerts', component: AlertsComponent },
  { path: 'analytics', component: AnalyticsComponent },
  { path: 'health', component: HealthComponent },
  { path: '**', redirectTo: 'detection' }
];
