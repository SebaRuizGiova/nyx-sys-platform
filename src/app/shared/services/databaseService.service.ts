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
  private teamsListSubject = new Subject<any[]>();
  teamsList$: Observable<any[]> = this.teamsListSubject.asObservable();

  private teamsList: any[] = [];
  private selectedTeamIndexSubject = new Subject<number>();
  selectedTeamIndex$: Observable<number> = this.selectedTeamIndexSubject.asObservable();

  private selectedTeamIndex: number = 0;

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
    if (this.authService.role === 'superAdmin') {
      this.loadingService.setLoading(true);
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
              if (this.teamsList.length) {
                const currentTeamId = localStorage.getItem('selectedTeam');
                let currentTeam;
                let currentTeamIndex;
                if (currentTeamId) {
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
                  this.setSelectedTeamIndex(currentTeamIndex);
                }
              }
              this.loadingService.setLoading(false);
            },
          });
        });
      });
    } else {
      this.loadingService.setLoading(true);
      this.getTeamsUser(this.authService.userId).subscribe({
        next: (teams) => {
          const formattedTeams = teams.map((team: any) => ({
            label: team.teamName,
            value: team.id,
          }));
          this.setTeamsList([...this.teamsList, ...formattedTeams]);
        },
        complete: () => {
          if (this.teamsList.length) {
            const currentTeamId = localStorage.getItem('selectedTeam');
            let currentTeam;
            let currentTeamIndex;
            if (currentTeamId) {
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
              this.setSelectedTeamIndex(currentTeamIndex);
            }
          }
          this.loadingService.setLoading(false);
        },
      });
    }
  }

  setTeamsList(teams: any[]): void {
    this.teamsList = teams;
    this.teamsListSubject.next(teams);
  }

  setSelectedTeamIndex(index: number): void {
    this.selectedTeamIndex = index;
    this.selectedTeamIndexSubject.next(index);
  }
}
