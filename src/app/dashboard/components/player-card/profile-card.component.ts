import { Component, Input } from '@angular/core';

interface SNA {
  simpatic: number;
  parasimpatic: number;
}

@Component({
  selector: 'dashboard-profile-card',
  templateUrl: './profile-card.component.html',
  styleUrls: ['./profile-card.component.scss']
})
export class ProfileCardComponent {
  @Input() playerName: string = '';
  @Input() deviceName: string = '';
  @Input() status: string = '';
  @Input() sna: SNA | null = null;
  @Input() recovery: number = 0;
  @Input() sleepScore: number = 0;
}
