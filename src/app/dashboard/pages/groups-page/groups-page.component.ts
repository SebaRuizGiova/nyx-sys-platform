import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ItemDropdown } from 'src/app/shared/components/dropdown/dropdown.component';
import { DatabaseService } from 'src/app/shared/services/databaseService.service';
import { LanguageService } from 'src/app/shared/services/language.service';

@Component({
  templateUrl: './groups-page.component.html',
  styleUrls: ['./groups-page.component.scss'],
})
export class GroupsPageComponent implements OnDestroy, OnInit {
  private langSubscription: Subscription;
  public periodItems: ItemDropdown[] = [
    {
      label: 'Periodo 1',
      value: 1,
    },
    {
      label: 'Periodo 2',
      value: 2,
    },
    {
      label: 'Periodo 3',
      value: 3,
    },
  ];
  public formatDownloadItems: string[] = ['PDF', 'Excel'];
  public rangeDownloadItems: string[] = [
    'Periodo actual',
    '7 días',
    '15 días',
    '30 días',
    'Histórico',
  ];
  public orderByItems: string[] = [
    'Puntaje de sueño: mayor a menor',
    'Puntaje de sueño: menor a mayor',
  ];
  public userId!: string;
  public usersList: any;
  public teamsList: any[] = [];
  public selectedTeamIndex: number = 0;

  constructor(
    private fb: FormBuilder,
    private languageService: LanguageService,
    private databaseService: DatabaseService
  ) {
    this.langSubscription = this.languageService.langChanged$.subscribe(() => {
      this.loadTranslations();
    });
  }

  ngOnInit(): void {
    this.loadTranslations();
    this.getTeamsList();
  }

  ngOnDestroy(): void {
    this.langSubscription.unsubscribe();
  }

  public periodForm: FormGroup = this.fb.group({
    period: '',
  });
  public teamForm: FormGroup = this.fb.group({
    selectedTeam: '',
  });
  public downloadForm: FormGroup = this.fb.group({
    format: ['', Validators.required],
    range: ['', Validators.required],
  });
  public filtersForm: FormGroup = this.fb.group({
    searchByName: '',
    orderBy: '',
    actualProfile: false,
  });

  private loadTranslations() {
    this.languageService
      .getTranslate('groupRangeDownloadItems')
      .subscribe((translations: any) => {
        this.rangeDownloadItems = translations;
      });
    this.languageService
      .getTranslate('groupOrderByItems')
      .subscribe((translations: any) => {
        this.orderByItems = translations;
      });
  }

  getTeamsList() {
    this.databaseService.getAllUsers().subscribe(
      (users) => {
        users.forEach((user: any) => {
          this.databaseService.getTeamsUserAdmin(user.id).subscribe((teams) => {
            const formattedTeams = teams.map((team: any) => ({
              label: team.teamName,
              value: team.id,
            }));
            this.teamsList = [...this.teamsList, ...formattedTeams];

            if (this.teamsList.length > 0 && !this.teamForm.value.selectedTeam) {
              const currentTeamId = localStorage.getItem('selectedTeam');
              let currentTeam;
              let currentTeamIndex;
              if (currentTeamId) {
                currentTeam = this.teamsList.find( team => team.value === currentTeamId)
                currentTeamIndex = this.teamsList.findIndex( team => team.value === currentTeamId)
                this.teamForm.patchValue({
                  selectedTeam: currentTeam
                });
                this.selectedTeamIndex = currentTeamIndex;
                return;
              }
              this.teamForm.patchValue({
                selectedTeam: this.teamsList[0]
              });
            }
          });
        });
      }
    );
  }

  nextGroup() {
    if (this.teamsList[this.selectedTeamIndex + 1]) {
      this.teamForm.patchValue({
        selectedTeam: this.teamsList[this.selectedTeamIndex + 1]
      })
      this.selectedTeamIndex = this.selectedTeamIndex + 1;
      localStorage.setItem('selectedTeam', this.teamForm.value.selectedTeam.value);
    }
  }

  backGroup() {
    if (this.teamsList[this.selectedTeamIndex - 1]) {
      this.teamForm.patchValue({
        selectedTeam: this.teamsList[this.selectedTeamIndex - 1]
      })
      this.selectedTeamIndex = this.selectedTeamIndex - 1;
      localStorage.setItem('selectedTeam', this.teamForm.value.selectedTeam.value);
    }
  }

  selectTeam() {
    const indexSelected = this.teamsList.findIndex( team => team.value === this.teamForm.value.selectedTeam.value);
    this.selectedTeamIndex = indexSelected;
    localStorage.setItem('selectedTeam', this.teamForm.value.selectedTeam.value);
  }
}
