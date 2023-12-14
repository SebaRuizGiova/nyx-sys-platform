import { Component, Input } from '@angular/core';

interface SNA {
  sympathetic: number;
  parasympathetic: number;
}

@Component({
  selector: 'dashboard-profile-card',
  templateUrl: './profile-card.component.html',
  styleUrls: ['./profile-card.component.scss']
})
export class ProfileCardComponent {
  @Input() playerName: string = '';
  @Input() deviceName: string | boolean = '';
  @Input() status: string = '';
  @Input() sna: SNA | null = null;
  @Input() recovery: number = 0;
  @Input() sleepScore: number = 0;
}
