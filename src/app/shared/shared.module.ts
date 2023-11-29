import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { Error404PageComponent } from './pages/error404-page/error404-page.component';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { SharedRoutingModule } from './shared-routing.module';

@NgModule({
  declarations: [
    SidebarComponent,
    Error404PageComponent,
    LayoutPageComponent,
  ],
  imports: [
    CommonModule,
    SharedRoutingModule
  ],
  exports: [
    SidebarComponent,
    Error404PageComponent,
  ]
})
export class SharedModule { }
