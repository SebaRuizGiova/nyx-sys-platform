import { Component, Input } from '@angular/core';

@Component({
  selector: 'shared-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent {
  @Input() title: string = '';
  @Input() width: string = '50vw';
  @Input({ required: true }) showModal: boolean = false;
}
