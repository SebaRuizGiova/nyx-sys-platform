import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, map, forkJoin, from, mergeMap } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { environment } from 'src/environments/environment';
import { Profile } from 'src/app/dashboard/interfaces/profile.interface';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  public groupsList: any[] = [];
  public selectedGroupId: string = '';
  public selectedGroupIndex: number = 0;
  public profiles: Profile[] = [];

  public role: string | null = localStorage.getItem('role');

  constructor(
    private firestore: AngularFirestore,
    private authService: AuthService
  ) {}

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
        map((profiles) => {
          return profiles.filter((profile) => profile.teamID === groupId)
        }),
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

  getProfilesByUser(userId: string): Observable<any> {
    return this.firestore
      .collection(`/users/${environment.client}/content/${userId}/players`)
      .get()
      .pipe(map((snapshot) => snapshot.docs.map((doc) => doc.data() as any)));
  }

  getDevicesByUser(userId: string): Observable<any> {
    return this.firestore
      .collection(`/users/${environment.client}/content/${userId}/devices`)
      .get()
      .pipe(map((snapshot) => snapshot.docs.map((doc) => doc.data() as any)));
  }

  getGroupsByUserPaginated(userId: string): Observable<any> {
    return this.firestore
      .collection(`/users/${environment.client}/content/${userId}/teams`)
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

  getGroupsByUser(userId: string) {
    return this.firestore
      .collection(`/users/${environment.client}/content/${userId}/teams`)
      .get()
      .pipe(
        map((snapshot) => snapshot.docs.map((doc) => doc.data() as any)),
        map((groups) => groups.filter((group) => !group.hided)),
        map((groups) =>
          groups.map((group: any) => ({
            label: group.teamName,
            value: group.id,
            userId: group.userID,
          }))
        )
      );
  }

  setGroupsList(groups: any[]): void {
    this.groupsList = groups;
  }

  setSelectedGroupId(groupId: string): void {
    this.selectedGroupId = groupId;
  }

  setSelectedGroupIndex(index: number): void {
    this.selectedGroupIndex = index;
  }

  setProfiles(profiles: Profile[]): void {
    this.profiles = profiles;
  }
}
