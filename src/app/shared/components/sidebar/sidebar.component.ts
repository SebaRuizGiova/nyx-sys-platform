import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ItemSidebar } from '../../interfaces/item-sidebar.interface';
import { Language } from '../../interfaces/language.interface';

@Component({
  selector: 'shared-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  @Input()
  show: boolean = true;

  public items: ItemSidebar[] = [];
  public configItem: ItemSidebar = {
    label: 'Configuración',
    icon: 'settings.svg',
  };
  public languageItem: ItemSidebar = {
    label: 'Idioma',
    icon: 'earth.svg'
  };
  public languages: any[] = [
    { name: 'Español', code: 'ES' },
    { name: 'Inglés', code: 'EN' },
    { name: 'Italiano', code: 'IT' }
  ];
  public selectedLanguage: Language = { name: 'Español', code: 'ES' };

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.url.subscribe((segments) => {
      this.updateItems(segments);
    });
  }

  private updateItems(segments: any[]) {
    this.items = this.getItems(segments);
  }

  private getItems(segments: any[]): ItemSidebar[] {
    return [
      {
        label: 'Vista grupal',
        icon: 'grid-icon.svg',
      },
      {
        label: 'Panel de administración',
        icon: 'settings-gear-combination.svg',
      },
    ];
  }

  toggleSidebar(value?: boolean): void {
    if (value?.toString()) {
      this.show = value;
      return;
    }
    this.show = !this.show;
  }
}
