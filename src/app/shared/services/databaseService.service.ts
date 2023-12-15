import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  CollectionReference,
  Query,
} from '@angular/fire/compat/firestore';
import { Observable, map, forkJoin, from, mergeMap, Subject } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { environment } from 'src/environments/environment';
import { LoadingService } from './loading.service';
import { Profile } from 'src/app/dashboard/interfaces/profile.interface';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  public groupsList: any[] = [];
  private groupsListSubject = new Subject<any[]>();
  groupsList$: Observable<any[]> = this.groupsListSubject.asObservable();

  public selectedGroupId: string = '';
  private selectedGroupIdSubject = new Subject<string>();
  selectedGroupId$: Observable<string> = this.selectedGroupIdSubject.asObservable();

  public selectedGroupIndex: number = 0;
  private selectedGroupIndexSubject = new Subject<number>();
  selectedGroupIndex$: Observable<number> =
    this.selectedGroupIndexSubject.asObservable();

  public role: string | null = localStorage.getItem('role');
  public profiles: Profile[] = [];

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

  getProfilesByGroup(
    groupId: string,
    userId?: string,
    limit: number = 10
  ): Observable<any> {
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
        ),
        map((profiles) => profiles.filter((profile) => !profile.hided)),
        mergeMap((filteredProfiles) => {
          const observables = filteredProfiles.map((filteredProfile) => {
            const collectionRef = this.firestore.collection(
              `/users/${environment.client}/content/${
                userId || this.authService.userId
              }/players/${filteredProfile.id}/Formated-SleepData`
            ).ref;

            // Aplica el límite de 10 documentos
            return from(collectionRef.limit(limit).get()).pipe(
              map((snapshot) => snapshot.docs.map((doc) => doc.data() as any)),
              map((sleepData) => {
                return {
                  ...filteredProfile,
                  sleepData,
                };
              })
            );
          });

          return forkJoin(observables);
        })
      );
  }

  getProfilesByUser(
    userId: string,
    startAfter?: any,
    pageSize: number = 10
  ): Observable<any> {
    return this.firestore
      .collection(
        `/users/${environment.client}/content/${userId}/players`,
        (ref) => {
          let query: CollectionReference | Query = ref;
          query = query.limit(pageSize);
          if (startAfter) {
            query = query.startAfter(startAfter);
          }
          return query;
        }
      )
      .get()
      .pipe(map((snapshot) => snapshot.docs.map((doc) => doc.data() as any)));
  }

  getDevicesByUser(
    userId: string,
    startAfter?: any,
    pageSize: number = 10
  ): Observable<any> {
    return this.firestore
      .collection(
        `/users/${environment.client}/content/${userId}/devices`,
        (ref) => {
          let query: CollectionReference | Query = ref;
          query = query.limit(pageSize);
          if (startAfter) {
            query = query.startAfter(startAfter);
          }
          return query;
        }
      )
      .get()
      .pipe(map((snapshot) => snapshot.docs.map((doc) => doc.data() as any)));
  }

  getGroupsByUserPaginated(
    userId: string,
    startAfter?: any,
    pageSize: number = 10
  ): Observable<any> {
    return this.firestore
      .collection(
        `/users/${environment.client}/content/${userId}/teams`,
        (ref) => {
          let query: CollectionReference | Query = ref;
          query = query.limit(pageSize);
          if (startAfter) {
            query = query.startAfter(startAfter);
          }
          return query;
        }
      )
      .get()
      .pipe(map((snapshot) => snapshot.docs.map((doc) => doc.data() as any)));
  }

  getUserData(userId: string): Observable<any> {
    return this.firestore
      .collection(`/users/${environment.client}/content`)
      .doc(userId)
      .get()
      .pipe(map((user) => user.data()));
  }

  private getGroupsByUser(userId: string) {
    return this.firestore
      .collection(`/users/${environment.client}/content/${userId}/teams`)
      .get()
      .pipe(
        map((snapshot) => snapshot.docs.map((doc) => doc.data() as any)),
        map((groups) => groups.filter((group) => !group.hided))
      );
  }

  private getGroupsByUserAdmin(userId: string): Observable<any[]> {
    return this.firestore
      .collection(`/users/${environment.client}/content/${userId}/teams`)
      .get()
      .pipe(map((snapshot) => snapshot.docs.map((doc) => doc.data() as any)));
  }

  getGroupsListToDatabase() {
    this.loadingService.setLoading(true);
    if (this.role === 'superAdmin') {
      this.getAllUsers().subscribe({
        next: (users) => {
          const observables = users.map((user: any) =>
            this.getGroupsByUserAdmin(user.id).pipe(
              map((groups) =>
                groups.map((group: any) => ({
                  label: group.teamName,
                  value: group.id,
                  userId: group.userID,
                }))
              )
            )
          );

          forkJoin(observables).subscribe((formattedGroupsArray: any) => {
              const formattedGroups = formattedGroupsArray.reduce(
                (acc: any, groups: any) => acc.concat(groups),
                []
              );
              this.setGroupsList([...this.groupsList, ...formattedGroups]);
            this.setGroupData();
            });
          },
      });
    } else {
      this.getGroupsByUser(this.authService.userId).subscribe({
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

  setSelectedGroupId(groupId: string): void {
    this.selectedGroupId = groupId;
    this.selectedGroupIdSubject.next(groupId);
  }

  setSelectedGroupIndex(index: number): void {
    this.selectedGroupIndex = index;
    this.selectedGroupIndexSubject.next(index);
  }

  setProfiles(players: Profile[]): void {
    this.profiles = players;
  }

  setGroupData() {
    if (this.groupsList.length) {
      const currentGroupId = localStorage.getItem('selectedGroup');
      const existGroupInArray = this.groupsList.some(
        (group) => group.value === currentGroupId
      );
      let currentGroup;
      let currentGroupIndex;
      if (currentGroupId && existGroupInArray) {
        currentGroup = this.groupsList.find(
          (group) => group.value === currentGroupId
        );
        currentGroupIndex = this.groupsList.findIndex(
          (group) => group.value === currentGroupId
        );
        this.setSelectedGroupIndex(currentGroupIndex);
        this.setSelectedGroupId(currentGroupId);
        if (currentGroup) {
          localStorage.setItem('selectedGroup', currentGroup.value);
        }
      } else {
        currentGroup = this.groupsList[0];
        currentGroupIndex = 0;
        this.setSelectedGroupIndex(currentGroupIndex);
        this.setSelectedGroupId(this.groupsList[0].value);
        if (currentGroup) {
          localStorage.setItem('selectedGroup', currentGroup.value);
        }
      }
    }
  }
}
