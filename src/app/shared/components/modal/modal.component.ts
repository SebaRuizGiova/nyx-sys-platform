import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'shared-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent {
  @Input() title: string = '';
  @Input() width: string = '50vw';
  @Input({ required: true }) showModal: boolean = false;
  @Output() onCloseEvent: EventEmitter<void> = new EventEmitter<void>();

  onClose(event: any) {
    this.onCloseEvent.emit(event);
  }
}
