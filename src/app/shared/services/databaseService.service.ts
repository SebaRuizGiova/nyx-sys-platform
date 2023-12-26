import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, map, forkJoin, from, mergeMap } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { environment } from 'src/environments/environment';
import { Profile } from 'src/app/dashboard/interfaces/profile.interface';
import { HelpersService } from './helpers.service';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  public groupsList: any[] = [];
  public selectedGroupId: string = '';
  public selectedGroupIndex: number = 0;
  public profiles: Profile[] = [];

  constructor(
    private firestore: AngularFirestore,
    private authService: AuthService,
    private helpersService: HelpersService
  ) {}

  getAllUsers(): Observable<any> {
    return this.firestore
      .collection(`users/${environment.client}/content`)
      .get()
      .pipe(map((snapshot) => snapshot.docs.map((doc) => doc.data() as any)));
  }

  getAllUsersPromise() {
    return this.firestore
      .collection(`users/${environment.client}/content`)
      .ref.get();
  }

  getProfilesByGroup(
    groupId: string,
    userId?: string,
    limit: number = 7
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
          return profiles.filter((profile) => profile.teamID === groupId);
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
                const sortedSleepData = sleepData.sort((a, b) =>
                  this.helpersService.compareDates(
                    this.helpersService.formatTimestamp(a.to),
                    this.helpersService.formatTimestamp(b.to)
                  )
                );
                return {
                  ...filteredProfile,
                  sleepData: sortedSleepData,
                };
              })
            );
          });

          return forkJoin(observables);
        })
      );
  }

  getProfilesByGroupPromise(userId: string, teamId: string) {
    return this.firestore
      .collection(`/users/${environment.client}/content/${userId}/players`)
      .ref.where('hided', '==', false)
      .where('teamID', '==', teamId)
      .get();
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

  getUserData(userId: string): Observable<any> {
    return this.firestore
      .collection(`/users/${environment.client}/content`)
      .doc(userId)
      .get()
      .pipe(map((user) => user.data()));
  }

  getUserDataPromise(userId: string) {
    return this.firestore
      .collection(`/users/${environment.client}/content`)
      .doc(userId)
      .ref.get();
  }

  getGroupsByUser(userId: string) {
    return this.firestore
      .collection(`/users/${environment.client}/content/${userId}/teams`)
      .get()
      .pipe(map((snapshot) => snapshot.docs.map((doc) => doc.data() as any)));
  }

  getGroupsByUserPromise(userId: string) {
    return this.firestore
      .collection(`/users/${environment.client}/content/${userId}/teams`)
      .ref.where('hided', '==', false)
      .get();
  }

  getSleepDataPromise(userId: string, profileId: string) {
    return this.firestore
      .collection(
        `/users/nyxsys/content/${userId}/players/${profileId}/Formated-SleepData`
      )
      .ref.limit(7)
      .get();
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
