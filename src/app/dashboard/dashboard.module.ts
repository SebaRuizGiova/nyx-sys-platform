import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamsPageComponent } from './pages/teams-page/teams-page.component';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { AppRoutingModule } from '../app-routing.module';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { AdminPageComponent } from './pages/admin-page/admin-page.component';



@NgModule({
  declarations: [
    TeamsPageComponent,
    LayoutPageComponent,
    ProfilePageComponent,
    AdminPageComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule { }
