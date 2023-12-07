import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TeamsPageComponent } from './pages/teams-page/teams-page.component';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { AdminPageComponent } from './pages/admin-page/admin-page.component';

import { DashboardRoutingModule } from './dashboard-routing.module';

import { SharedModule } from '../shared/shared.module';

import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { InputSwitchModule } from 'primeng/inputswitch';

import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    TeamsPageComponent,
    LayoutPageComponent,
    ProfilePageComponent,
    AdminPageComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    SharedModule,
    DropdownModule,
    TooltipModule,
    ReactiveFormsModule,
    InputTextModule,
    InputSwitchModule
  ]
})
export class DashboardModule { }
