import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SidebarComponent } from './components/sidebar/sidebar.component';
import { Error404PageComponent } from './pages/error404-page/error404-page.component';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { SharedRoutingModule } from './shared-routing.module';
import { ItemSidebarComponent } from './components/item-sidebar/item-sidebar.component';

import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    SidebarComponent,
    Error404PageComponent,
    LayoutPageComponent,
    ItemSidebarComponent,
  ],
  imports: [
    CommonModule,
    SharedRoutingModule,
    TooltipModule,
    DropdownModule,
    FormsModule,
    TranslateModule
  ],
  exports: [
    SidebarComponent,
    Error404PageComponent,
  ]
})
export class SharedModule { }
