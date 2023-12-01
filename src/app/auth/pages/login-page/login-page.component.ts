import { Component } from '@angular/core';
import { ThemeSelectionService } from 'src/app/shared/services/themeSelection.service';

@Component({
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent {
  public emailText: string = '';
  public passwordText: string = '';
  public isFlipped: boolean = true;

  constructor(private themeSelectionService: ThemeSelectionService) {
    themeSelectionService.changeTheme(false)
  }

  toggleCard() {
    this.isFlipped = !this.isFlipped;
  }
}
