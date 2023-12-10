import { Component, Input } from '@angular/core';

@Component({
  selector: 'dashboard-profile-card',
  templateUrl: './profile-card.component.html',
  styleUrls: ['./profile-card.component.scss']
})
export class ProfileCardComponent {
  @Input() playerName: string = '';
  @Input() deviceName: string = '';
  @Input() status: string = '';
  @Input() hrv: number = 0;
  @Input() recovery: number = 0;
  @Input() sleepScore: number = 0;
}
