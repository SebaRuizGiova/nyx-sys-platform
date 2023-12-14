import { Component, Input } from '@angular/core';

interface SNA {
  sympathetic: number | null;
  parasympathetic: number | null;
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
  @Input() recovery: number | null = 0;
  @Input() sleepScore: number | null = 0;
}
