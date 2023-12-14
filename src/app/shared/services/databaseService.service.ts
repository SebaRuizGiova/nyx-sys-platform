import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, Subject, map } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { environment } from 'src/environments/environment';
import { LoadingService } from './loading.service';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private teamsList: any[] = [];
  private teamsListSubject = new Subject<any[]>();
  teamsList$: Observable<any[]> = this.teamsListSubject.asObservable();

  private selectedTeam: string = '';
  private selectedTeamSubject = new Subject<string>();
  selectedTeam$: Observable<string> = this.selectedTeamSubject.asObservable();

  private selectedTeamIndex: number = 0;
  private selectedTeamIndexSubject = new Subject<number>();
  selectedTeamIndex$: Observable<number> = this.selectedTeamIndexSubject.asObservable();

  constructor(
    private firestore: AngularFirestore,
    private loadingService: LoadingService,
    private authService: AuthService
  ) {
    this.getTeamsListToDatabase();
  }

  getAllUsers(): Observable<any> {
    return this.firestore
      .collection(`users/${environment.client}/content`)
      .get()
      .pipe(map((snapshot) => snapshot.docs.map((doc) => doc.data() as any)));
  }

  getProfilesByTeam(teamId: string): Observable<any> {
    return this.firestore
      .collection(`/users/${environment.client}/content/${this.authService.userId}/players`)
      .get()
      .pipe(
        map((snapshot) => snapshot.docs.map((doc) => doc.data() as any)),
        map( players => players.filter( player => player.teamID === teamId))
      );
  }

  getTeamsUser(userId: string) {
    return this.firestore
      .collection(`/users/${environment.client}/content/${userId}/teams`)
      .get()
      .pipe(map((snapshot) => snapshot.docs.map((doc) => doc.data() as any)));
  }

  getTeamsUserAdmin(userId: string): Observable<any[]> {
    return this.firestore
      .collection(`/users/${environment.client}/content/${userId}/teams`)
      .get()
      .pipe(map((snapshot) => snapshot.docs.map((doc) => doc.data() as any)));
  }

  private getTeamsListToDatabase() {
    this.loadingService.setLoading(true);
    if (this.authService.role === 'superAdmin') {
      this.getAllUsers().subscribe((users) => {
        users.forEach((user: any) => {
          this.getTeamsUserAdmin(user.id).subscribe({
            next: (teams) => {
              const formattedTeams = teams.map((team: any) => ({
                label: team.teamName,
                value: team.id,
              }));
              this.setTeamsList([...this.teamsList, ...formattedTeams]);
            },
            complete: () => {
              this.setTeamData();
            },
          });
        });
      });
    } else {
      this.getTeamsUser(this.authService.userId).subscribe({
        next: (teams) => {
          const formattedTeams = teams.map((team: any) => ({
            label: team.teamName,
            value: team.id,
          }));
          this.setTeamsList([...this.teamsList, ...formattedTeams]);
        },
        complete: () => {
          this.setTeamData();
        },
      });
    }
  }

  setTeamsList(teams: any[]): void {
    this.teamsList = teams;
    this.teamsListSubject.next(teams);
  }

  setSelectedTeam(teamId: string): void {
    this.selectedTeam = teamId;
    this.selectedTeamSubject.next(teamId);
  }

  setSelectedTeamIndex(index: number): void {
    this.selectedTeamIndex = index;
    this.selectedTeamIndexSubject.next(index);
  }

  setTeamData() {
    if (this.teamsList.length) {
      const currentTeamId = localStorage.getItem('selectedTeam');
      let currentTeam;
      let currentTeamIndex;
      if (currentTeamId) {
        this.setSelectedTeam(currentTeamId);
        currentTeam = this.teamsList.find(
          (team) => team.value === currentTeamId
        );
        currentTeamIndex = this.teamsList.findIndex(
          (team) => team.value === currentTeamId
        );
        if (currentTeam) {
          localStorage.setItem(
            'selectedTeam',
            currentTeam.value.toString()
          );
        }
      } else {
        currentTeam = this.teamsList[0];
        currentTeamIndex = 0;
        if (currentTeam) {
          localStorage.setItem(
            'selectedTeam',
            currentTeam.value.toString()
          );
          this.setSelectedTeam(currentTeam.id);
        }
      }
      this.setSelectedTeamIndex(currentTeamIndex);
    }
    this.loadingService.setLoading(false);
  }
}
