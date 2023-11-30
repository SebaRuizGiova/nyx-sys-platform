import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

import { LoginPageComponent } from './pages/login-page/login-page.component';

import { AuthRoutingModule } from './auth-routing.module';



@NgModule({
  declarations: [
    LoginPageComponent,
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    FormsModule,
    PasswordModule,
    InputTextModule,
    ButtonModule
  ]
})
export class AuthModule { }
