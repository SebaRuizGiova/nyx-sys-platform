import { Component } from '@angular/core';
import { ThemeSelectionService } from 'src/app/shared/services/themeSelection.service';

@Component({
  templateUrl: './layout-page.component.html',
  styleUrls: ['./layout-page.component.scss']
})
export class LayoutPageComponent {
  constructor(private themeSelectionService: ThemeSelectionService) {
    themeSelectionService.changeTheme(true);
  }
}
