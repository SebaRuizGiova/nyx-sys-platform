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
import {RoundProgressModule} from 'angular-svg-round-progressbar';
import { YouTubePlayerModule } from '@angular/youtube-player';
import { AccordionModule } from 'primeng/accordion';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DialogModule } from 'primeng/dialog';

import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from './components/button/button.component';
import { InputTextComponent } from './components/input-text/input-text.component';
import { InputPasswordComponent } from './components/input-password/input-password.component';
import { DropdownComponent } from './components/dropdown/dropdown.component';
import { SelectComponent } from './components/select/select.component';
import { CircleProgressBarComponent } from './components/circle-progress-bar/circle-progress-bar.component';
import { LoadingComponent } from './components/loading/loading.component';
import { SettingsPageComponent } from './pages/settings-page/settings-page.component';
import { ModalComponent } from './components/modal/modal.component';
import { UserDropdownComponent } from './components/user-dropdown/user-dropdown.component';

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
    SelectComponent,
    CircleProgressBarComponent,
    LoadingComponent,
    SettingsPageComponent,
    ModalComponent,
    UserDropdownComponent,
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
    ReactiveFormsModule,
    RoundProgressModule,
    YouTubePlayerModule,
    AccordionModule,
    InputTextareaModule,
    DialogModule
  ],
  exports: [
    SidebarComponent,
    Error404PageComponent,
    ButtonComponent,
    InputTextComponent,
    InputPasswordComponent,
    SelectComponent,
    DropdownComponent,
    CircleProgressBarComponent,
    LoadingComponent,
    UserDropdownComponent
  ]
})
export class SharedModule { }
