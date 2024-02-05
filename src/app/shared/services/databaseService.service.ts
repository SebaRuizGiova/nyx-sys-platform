import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Profile } from 'src/app/dashboard/interfaces/profile.interface';
import { User } from 'src/app/dashboard/interfaces/user.interface';
import { Device } from 'src/app/dashboard/interfaces/device.interface';
import { Group } from 'src/app/dashboard/interfaces/group.interface';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  public groupsList: any[] = [];
  public selectedGroupId: string = '';
  public selectedGroupIndex: number = 0;
  public profiles: Profile[] = [];
  private cloudFunctionUrl =
    'https://us-central1-honyro-55d73.cloudfunctions.net/app';

  constructor(private firestore: AngularFirestore, private http: HttpClient) {}

  getAllUsers(): Observable<any> {
    return this.firestore
      .collection(`users/${environment.client}/content`)
      .get()
      .pipe(map((snapshot) => snapshot.docs.map((doc) => doc.data() as any)));
  }

  getAllUsersCollection() {
    return this.firestore
      .collection(`users/${environment.client}/content`)
      .ref
      .where('role', 'in', ['user', 'superAdmin'])
      .get();
  }

  saveUser(email: string, UID: string, nickName: string, role: string, id: string, collaborators: any[]) {
    return new Promise(async (resolve, reject) => {
      try {
        const data = {
          id,
          email,
          UID,
          nickName,
          role,
          collaborators
        };
        const result = await this.firestore
          .collection(`/users`)
          .doc(environment.client)
          .collection('content')
          .doc(id)
          .set(data);
        resolve(result);
      } catch (error: any) {
        reject(error.message);
      }
    });
  }

  getProfilesByGroupCollection(userId: string, teamId: string) {
    return this.firestore
      .collection(`/users/${environment.client}/content/${userId}/players`)
      .ref.where('hided', '==', false)
      .where('teamID', '==', teamId)
      .get();
  }

  getProfileByGroupDoc(userId: string, profileId: string) {
    return this.firestore
      .collection(`/users/${environment.client}/content/${userId}/players`)
      .doc(profileId)
      .ref.get();
  }

  getProfilesByUser(userId: string): Observable<any> {
    return this.firestore
      .collection(`/users/${environment.client}/content/${userId}/players`)
      .get()
      .pipe(
        map((snapshot) =>
          snapshot.docs.map((doc) => {
            const profileData: User = <User>doc.data();
            return {
              ...profileData,
              id: doc.ref.id,
            };
          })
        )
      );
  }

  getDevicesByUser(userId: string): Observable<any> {
    return this.firestore
      .collection(`/users/${environment.client}/content/${userId}/devices`)
      .get()
      .pipe(
        map((snapshot) =>
          snapshot.docs.map((doc) => {
            const deviceData: Device = <Device>doc.data();
            return {
              ...deviceData,
              id: doc.ref.id,
            };
          })
        )
      );
  }

  getUserData(userId: string): Observable<any> {
    return this.firestore
      .collection(`/users/${environment.client}/content`)
      .doc(userId)
      .get()
      .pipe(map((user) => user.data()));
  }

  getUserDataDoc(userId: string) {
    return this.firestore
      .collection(`/users/${environment.client}/content`)
      .doc(userId)
      .ref.get();
  }

  getGroupsByUser(userId: string) {
    return this.firestore
      .collection(`/users/${environment.client}/content/${userId}/teams`)
      .get()
      .pipe(
        map((snapshot) =>
          snapshot.docs.map((doc) => {
            const groupData: Group = <Group>doc.data();
            return {
              ...groupData,
              id: doc.ref.id,
            };
          })
        )
      );
  }

  getGroupByIdDoc(userId: string, groupId: string) {
    return this.firestore
      .collection(`/users/${environment.client}/content/${userId}/teams`)
      .doc(groupId)
      .ref.get();
  }

  getFirstGroupCollection(userId: string) {
    return this.firestore
      .collection(`/users/${environment.client}/content/${userId}/teams`)
      .ref.where('hided', '==', false)
      .limit(1)
      .get();
  }

  getGroupsByUserCollection(userId: string) {
    return this.firestore
      .collection(`/users/${environment.client}/content/${userId}/teams`)
      .ref.where('hided', '==', false)
      .get();
  }

  getCollaboratorsCollection() {
    return this.firestore
      .collection(`users/${environment.client}/content`)
      .ref
      .where('role', 'in', ['collaborator', 'viewer'])
      .get();
  }

  getSleepDataWithLimitCollection(userId: string, profileId: string) {
    return this.firestore
      .collection(
        `/users/nyxsys/content/${userId}/players/${profileId}/Formated-SleepData`
      )
      .ref.orderBy('to', 'desc')
      .get();
  }

  getSleepDataWithotLimitCollection(userId: string, profileId: string) {
    return this.firestore
      .collection(
        `/users/nyxsys/content/${userId}/players/${profileId}/Formated-SleepData`
      )
      .ref.orderBy('to', 'desc')
      .get();
  }

  getLiveDataCollection(deviceId: string, limit: number = 3) {
    return this.firestore
      .collection(`/live-data/${deviceId}/data`)
      .ref.orderBy('date_occurred', 'desc')
      .limit(limit)
      .get();
  }

  saveCollaborator(
    email: string,
    UID: string,
    nickName: string,
    role: string,
    id: string,
    accessTo: any[]
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        const data = {
          id,
          email,
          UID,
          nickName,
          role,
          accessTo,
        };
        const result = await this.firestore
          .collection(`/users`)
          .doc(environment.client)
          .collection('content')
          .doc(id)
          .set(data);
        resolve(result);
      } catch (error: any) {
        reject(error.message);
      }
    });
  }

  sendWelcomeEmail(email: string, password: string) {
    const subject = '¡Bienvenido a Nyx-Sys!';
    const text = `Te damos la bienvenida a nuestra plataforma, a continuación te proveeremos de tus credenciales de acceso.\nRecuerda que puedes cambiar la contraseña en cualquier momento desde ajustes.\n\nUsuario: ${email}\nContraseña: ${password}\nUrl de acceso: https://nyxsys-global.web.app/login\nAtte: Nyx-Sys team.`;

    const data = {
      to: [email, 'sebastian.ruiz@nyx-sys.com', 'fernando.lerner@nyx-sys.com'],
      subject,
      text,
    };

    const url = `${this.cloudFunctionUrl}/post/welcome-email`;
    this.http.post(url, data).subscribe(
      (response) => {},
      (error) => {}
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
