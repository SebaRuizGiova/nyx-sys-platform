import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, map } from 'rxjs';
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

  constructor(private firestore: AngularFirestore) {}

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

  getProfilesByGroupPromise(userId: string, teamId: string) {
    return this.firestore
      .collection(`/users/${environment.client}/content/${userId}/players`)
      .ref.where('hided', '==', false)
      .where('teamID', '==', teamId)
      .get();
  }

  getProfileByGroupPromise(userId: string, profileId: string) {
    return this.firestore
      .collection(`/users/${environment.client}/content/${userId}/players`)
      .doc(profileId)
      .ref.get();
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

  getSleepDataWithLimitPromise(userId: string, profileId: string, limit: number = 7) {
    return this.firestore
      .collection(
        `/users/nyxsys/content/${userId}/players/${profileId}/Formated-SleepData`
      )
      .ref.orderBy('to', 'desc')
      .limit(limit)
      .get();
  }

  getSleepDataWithotLimitPromise(userId: string, profileId: string) {
    return this.firestore
      .collection(
        `/users/nyxsys/content/${userId}/players/${profileId}/Formated-SleepData`
      )
      .ref.orderBy('to', 'desc')
      .get();
  }

  getLiveDataPromise(deviceId: string, limit: number = 3) {
    return this.firestore
      .collection(`/live-data/${deviceId}/data`)
      .ref.orderBy('date_occurred', 'desc')
      .limit(limit)
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
    localStorage.setItem('profiles', JSON.stringify(profiles));
  }
}
