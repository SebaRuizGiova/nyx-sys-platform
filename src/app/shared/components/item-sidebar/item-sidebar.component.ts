import { AfterContentInit, Component, ContentChildren, EventEmitter, Input, Output, QueryList } from '@angular/core';
import { ItemSidebar } from '../../interfaces/item-sidebar.interface';

@Component({
  selector: 'shared-item-sidebar',
  templateUrl: './item-sidebar.component.html',
  styleUrls: ['./item-sidebar.component.scss']
})
export class ItemSidebarComponent implements AfterContentInit {
  @Input() item!: ItemSidebar;
  @Input() expand: boolean = true;
  @Input() action?: Function;
  @Input() path: string = '';
  @Output() showSidebar = new EventEmitter<boolean>();

  @ContentChildren('element') elements?: QueryList<any>;

  public containElements: boolean = false;

  ngAfterContentInit() {
    if (this.elements && this.elements.length > 0) {
      this.containElements = true;
    } else {
      this.containElements = false;
    }
  }

  actionButton() {
    this.showSidebar.emit(true);
  }
}
