import { Component, Input } from '@angular/core';
import { SleepData } from '../../interfaces/profile.interface';

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
  @Input() profileId: string = '';
  @Input() userId: string = '';
  @Input() profileName: string = '';
  @Input() deviceName: string | boolean = '';
  @Input() status: string = '';
  @Input() sna: SNA | null = null;
  @Input() recovery: number | null = 0;
  @Input() sleepScore: number | null = 0;
  @Input() previousSleepData?: SleepData | null;

  public previousRecovery: number = 0;

  constructor() {
    if (this.previousSleepData) {
      this.previousRecovery = this.previousSleepData.hrv_data[0].totalRecovery
    }
  }
}
