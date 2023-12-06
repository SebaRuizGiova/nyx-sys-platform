import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { LoginPageComponent } from './pages/login-page/login-page.component';

import { AuthRoutingModule } from './auth-routing.module';
import { SharedModule } from '../shared/shared.module';

import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';



@NgModule({
  declarations: [
    LoginPageComponent,
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    FormsModule,
    SharedModule,
    TranslateModule,
    ReactiveFormsModule,
    TooltipModule,
    ToastModule
  ]
})
export class AuthModule { }
