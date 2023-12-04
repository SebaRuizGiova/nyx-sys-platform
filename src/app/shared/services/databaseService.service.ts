import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable, of, Subscription } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  dataCollection?: AngularFirestoreCollection<any>;
  filteredOptions?: Observable<any[]>;
  firebaseRegister?: AngularFirestoreDocument<any>;
  firebaseStorage?: AngularFireStorage;
  private accountID = '';
  private currentUserID = '';
  private cloudFunctionUrl =
    'https://us-central1-honyro-55d73.cloudfunctions.net/app';
  constructor(
    private firestore: AngularFirestore,
    private afStorage: AngularFireStorage,
    private http: HttpClient
  ) {
    this.currentUserID = JSON.parse(localStorage.getItem('currentUserID') || '{}');
  }

  /* DEVELONE CALLS  */
  /* GET DEVELONE TOKEN */
  getTokenDevelone() {
    const body = {
      user: 'develone',
      password: 'develonenyxsys',
    };

    this.http
      .post<any>('https://bedsensordata.develone.com/api/token', body)
      .subscribe(
        (response) => {
          const token = response.token;
          this.getDeviceDevelone(token);
        },
        (error) => {
          console.log(error);
        }
      );
  }

  /* GET DEVELONE NIGHT */
  getDeviceDevelone(token: string) {
    const url =
      'https://bedsensordata.develone.com/api/sensoreventsdatesn/2023-05-24/2023-05-25/0000000108/1';
    const body = '';

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }),
    };

    let arrayPrueba = [];

    this.http.post(url, body, httpOptions).subscribe(
      (response: any) => {
        const pageSize = 50;
        const totalPages = Math.ceil(
          response[0].pagination.totalObjects / pageSize
        );

        console.log(response);

        for (let i = 0; i < totalPages; i++) {
          this.http
            .post(
              `https://bedsensordata.develone.com/api/sensoreventsdatesn/2023-05-24/2023-05-25/0000000108/${
                i + 1
              }`,
              body,
              httpOptions
            )
            .subscribe(
              (response: any) => {
                response[1].events.forEach((element: any) => {
                  arrayPrueba.push(element);
                });
              },
              (error) => {
                console.log(error);
              }
            );
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  /* USER CALLS */

  getAllUsers() {
    return this.firestore
      .collection(`/users`)
      .doc(environment.client)
      .collection('content');
  }

  saveUser(email: any, UID: any, nickName: any, role: any, id: any, collaborators: any, accessTo: any) {
    return new Promise(async (resolve, reject) => {
      try {
        const data = {
          id,
          email,
          UID,
          nickName,
          role,
          collaborators,
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
  saveCollaborator(email: any, UID: any, nickName: any, role: any, id: any, accessTo: any) {
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

  updateUser(user: any) {
    const docRef = this.firestore
      .collection('users')
      .doc(environment.client)
      .collection('content')
      .doc(user.id)
      .update(user);
  }

  deleteUser(user: any) {
    const url = `${this.cloudFunctionUrl}/delete-user`;
    this.http.post(url, user).subscribe(
      (response) => {
      },
      (error) => {
      }
    );
  }

  //RAW SLEEPDATA

  recoverOldNights(userID: string, playerID: string, noche: any) {
    const id = this.firestore.createId();

    return new Promise(async (resolve, reject) => {
      try {
        const data = noche;
        const result = await this.firestore
          .collection(`/users`)
          .doc(environment.client)
          .collection('content')
          .doc(userID)
          .collection('/players')
          .doc(playerID)
          .collection('/Formated-SleepData')
          .doc(id)
          .set(data);

        resolve(result);
      } catch (error: any) {
        reject(error.message);
      }
    });
  }

  getSleepSummaryDeviceCollection(player: any) {
    return this.firestore.collection(
      `/users/${environment.client}/content/${player.userID}/players/${player.id}/Formated-SleepData`
    );
  }

  getSleepSummaryDeviceCollectionAdmin(userID: string, playerID: string) {
    return this.firestore.collection(
      `/users/${environment.client}/content/${userID}/players/${playerID}/Formated-SleepData`
    );
  }

  // DEVICE CALLS

  getAllDevices() {
    return this.firestore.collection(
      `/users/${environment.client}/content/${this.currentUserID}/devices`
    );
  }

  getAllDevicesAdmin(userID: any) {
    return this.firestore.collection(
      `/users/${environment.client}/content/${userID}/devices`
    );
  }

  getAllDevicesCollaborator(collaboratorID: string) {
    return this.firestore.collection(
      `/users/${environment.client}/content/${collaboratorID}/devices`
    );
  }

  deleteDevice(deviceID: any): any {
    this.firebaseRegister = this.firestore.doc(
      `/users/${environment.client}/content/${this.currentUserID}/devices/${deviceID}`
    );
    this.firebaseRegister.delete();
  }

  deleteDeviceAdmin(userID: any, deviceID: any): any {
    this.firebaseRegister = this.firestore.doc(
      `/users/${environment.client}/content/${userID}/devices/${deviceID}`
    );
    this.firebaseRegister.delete();
  }

  // TEAM CALLS

  getAllTeams() {
    return this.firestore.collection(
      `/users/${environment.client}/content/${this.currentUserID}/teams`
    );
  }

  getAllTeamsAdmin(userID: any) {
    return this.firestore.collection(
      `/users/${environment.client}/content/${userID}/teams`
    );
  }

  deleteTeam(team: any): any {
    this.firebaseRegister = this.firestore.doc(
      `/users/${environment.client}/content/${team.userID}/teams/${team.id}`
    );
    this.firebaseRegister.delete();

    if (team.logoUrl !== '') {
      this.deleteTeamPicture(team.id);
    }
  }

  deleteTeamPicture(teamID: any): any {
    const path = `teams-logos/${environment.client}/${teamID}/teamLogo`;
    const ref = this.afStorage.ref(path);
    ref.delete();
  }

  /* PLAYER CALLS */
  getAllPlayers() {
    return this.firestore.collection(
      `/users/${environment.client}/content/${this.currentUserID}/players`
    );
  }

  getAllPlayersAdmin(userID: any) {
    return this.firestore.collection(
      `/users/${environment.client}/content/${userID}/players`
    );
  }

  getAllPlayersCollaborator(collaboratorID: string) {
    return this.firestore.collection(
      `/users/${environment.client}/content/${collaboratorID}/players`
    );
  }

  getPlayersHided() {
    return this.firestore.collection(
      `/accounts/${environment.client}/content/${this.accountID}/players`,
      (ref) => ref.where('hided', '==', false)
    );
  }

  getPlayersFromTeam(teamID: any) {
    return this.firestore.collection(
      `/users/${environment.client}/content/${this.currentUserID}/players`,
      (ref) => ref.where('teamID', '==', teamID)
    );
  }

  getPlayersFromTeamAdmin(userID: any, teamID: any) {
    return this.firestore.collection(
      `/users/${environment.client}/content/${userID}/players`,
      (ref) => ref.where('teamID', '==', teamID)
    );
  }

  getPlayersHidedTeam(teamID: any) {
    return this.firestore.collection(
      `/accounts/${environment.client}/content/${this.accountID}/players`,
      (ref) => ref.where('hided', '==', false).where('teamID', '==', teamID)
    );
  }

  deletePlayer(playerID: any): any {
    this.firebaseRegister = this.firestore.doc(
      `/users/${environment.client}/content/${this.currentUserID}/players/${playerID}`
    );
    this.firebaseRegister.delete();

    this.deletePlayerPicture(playerID);
  }

  deletePlayerPicture(playerID: any): any {
    const path = `players-pictures/${environment.client}/${playerID}/playerPicture`;
    const ref = this.afStorage.ref(path);
    ref.delete();
  }

  deletePlayerAdmin(player: any): any {
    this.firebaseRegister = this.firestore.doc(
      `/users/${environment.client}/content/${player.userID}/players/${player.id}`
    );
    this.firebaseRegister.delete();

    if (player.teamLogo !== '') {
      this.deletePlayerPictureAdmin(player.id);
    }
  }

  deletePlayerPictureAdmin(playerID: any): any {
    const path = `players-pictures/${environment.client}/${playerID}/playerPicture`;
    const ref = this.afStorage.ref(path);
    ref.delete();
  }

  //Live-Data
  getLiveData(deviceID: string) {
    return this.firestore.collection(`/live-data/${deviceID}/data`);
  }

  /* GMT DATA */
  // formatTimeGmt(time: any) {
  //   if (time != undefined) {
  //     if (localStorage['gmt']) {
  //       const gmtSaved = localStorage.getItem('gmt');

  //       if (gmtSaved) {
  //         const date = new Date(
  //           time * 1000
  //         ); /*  Multiply by 1000 to get the date in milliseconds */
  //         const gmtOffset =
  //           this.parseGmtOffset(gmtSaved); /* We analyse the GMT shift */

  //         date.setUTCHours(
  //           date.getUTCHours() + gmtOffset.hours
  //         ); /* We adjust the times according to the GMT offset */
  //         date.setUTCMinutes(
  //           date.getUTCMinutes() + gmtOffset.minutes
  //         ); /* We adjust the minutes according to the GMT offset */

  //         const hours = String(date.getUTCHours()).padStart(
  //           2,
  //           '0'
  //         ); /* We get the hours in two-digit format */
  //         const minutes = String(date.getUTCMinutes()).padStart(
  //           2,
  //           '0'
  //         ); /* We get the minutes in two-digit format */
  //         const seconds = String(date.getUTCSeconds()).padStart(
  //           2,
  //           '0'
  //         ); /* We get the seconds in two-digit format */

  //         return `${hours}:${minutes}:${seconds}h`;
  //       }
  //     } else {
  //       return new Date(time * 1000).toString().substr(16, 8);
  //     }
  //   } else {
  //     return '';
  //   }
  // }
  // formatDateGmt(time: any) {
  //   if (time !== undefined) {
  //     if (localStorage['gmt']) {
  //       const gmtSaved = localStorage.getItem('gmt');
  //       if (gmtSaved) {
  //         const date = new Date(
  //           time * 1000
  //         ); /* Multiplica por 1000 para obtener la fecha en milisegundos */
  //         const gmtOffset =
  //           this.parseGmtOffset(
  //             gmtSaved
  //           ); /* Analizamos el desplazamiento GMT */

  //         date.setUTCHours(
  //           date.getUTCHours() + gmtOffset.hours
  //         ); /* Ajustamos las horas según el desplazamiento GMT */
  //         const year = date.getUTCFullYear();
  //         const month = String(date.getUTCMonth() + 1).padStart(
  //           2,
  //           '0'
  //         ); /* El mes se suma 1 ya que los meses son base 0 */
  //         const day = String(date.getUTCDate()).padStart(
  //           2,
  //           '0'
  //         ); /* Obtenemos el día en formato de dos dígitos */

  //         return `${day}/${month}/${year}`;
  //       }
  //     } else {
  //       const date = new Date(time * 1000);
  //       const year = date.getUTCFullYear();
  //       const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  //       const day = String(date.getUTCDate()).padStart(2, '0');

  //       return `${day}/${month}/${year}`;
  //     }
  //   }
  // }

  // formatTimeGmtDate(time: any) {
  //   if (time != undefined) {
  //     if (localStorage['gmt']) {
  //       const gmtSaved = localStorage.getItem('gmt');
  //       if (gmtSaved) {
  //         const date = new Date(time * 1000);
  //         const gmtOffset = this.parseGmtOffset(gmtSaved);

  //         date.setUTCHours(date.getUTCHours() + gmtOffset.hours);
  //         date.setUTCMinutes(date.getUTCMinutes() + gmtOffset.minutes);

  //         const day = String(date.getUTCDate()).padStart(2, '0'); // Obtenemos el día en formato de dos dígitos
  //         const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Obtenemos el mes (se suma 1 ya que los meses son base 0)
  //         const year = String(date.getUTCFullYear()); // Obtenemos el año en formato AAAA
  //         const hours = String(date.getUTCHours()).padStart(2, '0');
  //         const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  //         const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  //         return `${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`;
  //       }
  //     } else {
  //       return new Date(time * 1000).toString().substr(16, 8);
  //     }
  //   } else {
  //     return '';
  //   }
  // }

  // parseGmtOffset(gmt: string): { hours: number; minutes: number } {
  //   const regex = /^GMT ([+-])(\d{1,2}):(\d{2})$/;
  //   const matches = gmt.match(regex);

  //   if (matches) {
  //     const sign = matches[1] === '+' ? 1 : -1;
  //     const hours = parseInt(matches[2], 10) * sign;
  //     const minutes = parseInt(matches[3], 10) * sign;

  //     return { hours, minutes };
  //   }

  //   throw new Error(
  //     'Formato GMT no válido. Utiliza un formato como "GMT +2:00".'
  //   );
  // }

  /* WELCOME EMAIL */
  // sendWelcomeEmail(data: any) {
  //   const url = `${this.cloudFunctionUrl}/post/welcome-email`;
  //   this.http.post(url, data).subscribe(
  //     (response) => {},
  //     (error) => {}
  //   );
  // }
  //To compare current day to see if finished forms

  // getDate(days: Date) {
  //   // this is with a date
  //   var today = days;
  //   today.setDate(today.getDate());
  //   var dd = today.getDate();
  //   var mm = today.getMonth() + 1;
  //   var yyyy = today.getFullYear();
  //   var day = dd.toString();
  //   var month = mm.toString();
  //   if (dd < 10) {
  //     day = '0' + dd;
  //   }

  //   if (mm < 10) {
  //     month = '0' + mm;
  //   }
  //   var dateAdded = dd + '-' + mm + '-' + yyyy;
  //   return dateAdded;
  // }

  // getDateWithSeconds(daySeconds: number) {
  //   var today = new Date(daySeconds * 1000);
  //   today.setDate(today.getDate());
  //   var dd = today.getDate();
  //   var mm = today.getMonth() + 1;
  //   var yyyy = today.getFullYear();
  //   var day = dd.toString();
  //   var month = mm.toString();
  //   if (dd < 10) {
  //     day = '0' + dd;
  //   }

  //   if (mm < 10) {
  //     month = '0' + mm;
  //   }
  //   var dateAdded = dd + '-' + mm + '-' + yyyy;
  //   return dateAdded;
  // }

  //---------------------------------------SAVE NIGHT--------------------------
  // async saveNight(data: any, dialog: any, fixedNight: any, userID: any) {
  //   const array: any[] = [];
  //   const playerData = this.firestore
  //     .collection('users')
  //     .doc(environment.client)
  //     .collection('content')
  //     .doc(userID)
  //     .collection('players');
  //   const snapshotPlayers = await playerData.ref
  //     .where('deviceSN', '==', data.device)
  //     .get();
  //   await snapshotPlayers;
  //   if (!snapshotPlayers.empty) {
  //     snapshotPlayers.forEach(async (player) => {
  //       array.push(player.data());
  //     });
  //     for (const player of array) {
  //       const tempPlayer = player;

  //       const sleepData = this.firestore
  //         .collection('users')
  //         .doc(environment.client)
  //         .collection('content')
  //         .doc(userID)
  //         .collection('players')
  //         .doc(tempPlayer.id)
  //         .collection('Formated-SleepData');

  //       const snapshot = await sleepData.ref
  //         .where('from', '==', data.from)
  //         .where('device', '==', data.device)
  //         .get();
  //       if (snapshot.empty) {
  //         console.log('No duplicate.');

  //         await this.firestore
  //           .collection('users')
  //           .doc(environment.client)
  //           .collection('content')
  //           .doc(userID)
  //           .collection('players')
  //           .doc(tempPlayer.id)
  //           .collection('RAW-SleepData')
  //           .doc(data.id)
  //           .set(data);

  //         await this.firestore
  //           .collection('users')
  //           .doc(environment.client)
  //           .collection('content')
  //           .doc(userID)
  //           .collection('players')
  //           .doc(tempPlayer.id)
  //           .collection('Formated-SleepData')
  //           .doc(data.id)
  //           .set(fixedNight)
  //           .then(() => {
  //             const question = 'Success!';
  //             const explanation = 'Night has been successfully added.';
  //             // const dialogRefClose = this.dialog.open(OneAnswerComponent, {
  //             //   data: { question, explanation },
  //             //   hasBackdrop: true,
  //             // });
  //             // dialogRefClose.afterClosed().subscribe((result: any) => {});
  //             // dialog.close();
  //           })
  //           .catch((error) => {
  //             const question =
  //               'There has been an error in uploading the night!';
  //             const explanation = error;
  //             // const dialogRefClose = this.dialog.open(OneAnswerComponent, {
  //             //   data: { question, explanation },
  //             //   hasBackdrop: true,
  //             // });
  //             // dialogRefClose.afterClosed().subscribe((result) => {});
  //             // dialog.close();
  //           });
  //       } else {
  //         console.log('Duplicate.');

  //         //THIS FOREACH WILL DELETE THE PREVIOUS NIGHT WITH THE SAME FROM AND SEND IT TO THE DUPLICATE PILE
  //         snapshot.forEach(async (doc) => {
  //           const dataDuplicate: any = doc.data();

  //           await this.firestore
  //             .collection('RAW-SleepSummary-Incomplete-Data')
  //             .doc(dataDuplicate.device)
  //             .collection('sleep_data')
  //             .doc(dataDuplicate.id)
  //             .set(data);

  //           const res = await this.firestore
  //             .collection('users')
  //             .doc(environment.client)
  //             .collection('content')
  //             .doc(userID)
  //             .collection('players')
  //             .doc(tempPlayer.id)
  //             .collection('Formated-SleepData')
  //             .doc(doc.id)
  //             .delete();
  //         });

  //         setTimeout(async () => {
  //           await this.firestore
  //             .collection('users')
  //             .doc(environment.client)
  //             .collection('content')
  //             .doc(userID)
  //             .collection('players')
  //             .doc(tempPlayer.id)
  //             .collection('RAW-SleepData')
  //             .doc(data.id)
  //             .set(data);

  //           await this.firestore
  //             .collection('users')
  //             .doc(environment.client)
  //             .collection('content')
  //             .doc(userID)
  //             .collection('players')
  //             .doc(tempPlayer.id)
  //             .collection('Formated-SleepData')
  //             .doc(data.id)
  //             .set(fixedNight)
  //             .then(() => {
  //               const question = 'Success!';
  //               const explanation = 'Night has been successfully added.';
  //               // const dialogRefClose = this.dialog.open(OneAnswerComponent, {
  //               //   data: { question, explanation },
  //               //   hasBackdrop: true,
  //               // });
  //               // dialogRefClose.afterClosed().subscribe((result) => {});
  //               // dialog.close();
  //             })
  //             .catch((error) => {
  //               const question =
  //                 'There has been an error in uploading the night!';
  //               const explanation = error;
  //               // const dialogRefClose = this.dialog.open(OneAnswerComponent, {
  //               //   data: { question, explanation },
  //               //   hasBackdrop: true,
  //               // });
  //               // dialogRefClose.afterClosed().subscribe((result) => {});
  //               // dialog.close();
  //             });
  //         }, 100);
  //       }
  //     }
  //   } else {
  //     alert('Error: this device or player does not exist in this account!');
  //     return false;
  //   }
  // }
}
