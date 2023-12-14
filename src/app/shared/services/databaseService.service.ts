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
  private groupsList: any[] = [];
  private groupsListSubject = new Subject<any[]>();
  groupsList$: Observable<any[]> = this.groupsListSubject.asObservable();

  private selectedGroup: string = '';
  private selectedGroupSubject = new Subject<string>();
  selectedGroup$: Observable<string> = this.selectedGroupSubject.asObservable();

  private selectedGroupIndex: number = 0;
  private selectedGroupIndexSubject = new Subject<number>();
  selectedGroupIndex$: Observable<number> =
    this.selectedGroupIndexSubject.asObservable();

  private role: string | null = localStorage.getItem('role');

  constructor(
    private firestore: AngularFirestore,
    private loadingService: LoadingService,
    private authService: AuthService
  ) {
    this.getGroupsListToDatabase();
  }

  getAllUsers(): Observable<any> {
    return this.firestore
      .collection(`users/${environment.client}/content`)
      .get()
      .pipe(map((snapshot) => snapshot.docs.map((doc) => doc.data() as any)));
  }

  getProfilesByGroup(groupId: string, userId?: string): Observable<any> {
    console.log(groupId);
    return this.firestore
      .collection(
        `/users/${environment.client}/content/${
          userId || this.authService.userId
        }/players`
      )
      .get()
      .pipe(
        map((snapshot) => snapshot.docs.map((doc) => doc.data() as any)),
        map((profiles) =>
          profiles.filter((profile) => profile.teamID === groupId)
        )
      );
  }

  getGroupsUser(userId: string) {
    return this.firestore
      .collection(`/users/${environment.client}/content/${userId}/teams`)
      .get()
      .pipe(map((snapshot) => snapshot.docs.map((doc) => doc.data() as any)));
  }

  getGroupsUserAdmin(userId: string): Observable<any[]> {
    return this.firestore
      .collection(`/users/${environment.client}/content/${userId}/teams`)
      .get()
      .pipe(map((snapshot) => snapshot.docs.map((doc) => doc.data() as any)));
  }

  private getGroupsListToDatabase() {
    this.loadingService.setLoading(true);
    if (this.role === 'superAdmin') {
      this.getAllUsers().subscribe((users) => {
        users.forEach((user: any) => {
          this.getGroupsUserAdmin(user.id).subscribe({
            next: (groups) => {
              const formattedGroups = groups.map((group: any) => ({
                label: group.teamName,
                value: group.id,
                userId: group.userID,
              }));
              this.setGroupsList([...this.groupsList, ...formattedGroups]);
            },
            complete: () => {
              this.setGroupData();
            },
          });
        });
      });
    } else {
      this.getGroupsUser(this.authService.userId).subscribe({
        next: (groups) => {
          const formattedGroups = groups.map((group: any) => ({
            label: group.teamName,
            value: group.id,
          }));
          this.setGroupsList([...this.groupsList, ...formattedGroups]);
        },
        complete: () => {
          this.setGroupData();
        },
      });
    }
  }

  setGroupsList(groups: any[]): void {
    this.groupsList = groups;
    this.groupsListSubject.next(groups);
  }

  setSelectedGroup(groupId: string): void {
    this.selectedGroup = groupId;
    this.selectedGroupSubject.next(groupId);
  }

  setSelectedGroupIndex(index: number): void {
    this.selectedGroupIndex = index;
    this.selectedGroupIndexSubject.next(index);
  }

  setGroupData() {
    if (this.groupsList.length) {
      const currentGroupId = localStorage.getItem('selectedGroup');
      const existGroupInArray = this.groupsList.some( group => group.value === currentGroupId )
      let currentGroup;
      let currentGroupIndex;
      if (currentGroupId && existGroupInArray) {
        this.setSelectedGroup(currentGroupId);
        currentGroup = this.groupsList.find(
          (group) => group.value === currentGroupId
        );
        currentGroupIndex = this.groupsList.findIndex(
          (group) => group.value === currentGroupId
        );
        if (currentGroup) {
          localStorage.setItem('selectedGroup', currentGroup.value);
        }
      } else {
        currentGroup = this.groupsList[0];
        currentGroupIndex = 0;
        this.setSelectedGroup(this.groupsList[0].value);
        if (currentGroup) {
          localStorage.setItem('selectedGroup', currentGroup.value);
        }
      }
      this.setSelectedGroupIndex(currentGroupIndex);
    }
    this.loadingService.setLoading(false);
  }
}
