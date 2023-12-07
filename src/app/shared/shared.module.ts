import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SidebarComponent } from './components/sidebar/sidebar.component';
import { Error404PageComponent } from './pages/error404-page/error404-page.component';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { SharedRoutingModule } from './shared-routing.module';
import { ItemSidebarComponent } from './components/item-sidebar/item-sidebar.component';

import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from './components/button/button.component';
import { InputTextComponent } from './components/input-text/input-text.component';
import { InputPasswordComponent } from './components/input-password/input-password.component';
import { DropdownComponent } from './components/dropdown/dropdown.component';
import { SelectComponent } from './components/select/select.component';

@NgModule({
  declarations: [
    SidebarComponent,
    Error404PageComponent,
    LayoutPageComponent,
    ItemSidebarComponent,
    ButtonComponent,
    InputTextComponent,
    InputPasswordComponent,
    DropdownComponent,
    SelectComponent
  ],
  imports: [
    CommonModule,
    SharedRoutingModule,
    TooltipModule,
    DropdownModule,
    FormsModule,
    TranslateModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    ReactiveFormsModule
  ],
  exports: [
    SidebarComponent,
    Error404PageComponent,
    ButtonComponent,
    InputTextComponent,
    InputPasswordComponent,
    DropdownComponent,
    SelectComponent
  ]
})
export class SharedModule { }
