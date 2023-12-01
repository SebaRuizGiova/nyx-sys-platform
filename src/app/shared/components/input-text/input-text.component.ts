import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'shared-input-text',
  templateUrl: './input-text.component.html',
  styleUrls: ['./input-text.component.scss']
})
export class InputTextComponent implements OnInit {
  ngOnInit(): void {
    console.log(this.error);
  }
  @Input() placeholder: string = '';
  @Input() helper?: string = '';
  @Input() value: string = '';
  @Input() error?: boolean = false;
}
