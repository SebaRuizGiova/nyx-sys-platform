import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, catchError, first, from, map, tap } from 'rxjs';
import { User } from 'src/app/dashboard/interfaces/user.interface';
import { environment } from 'src/environments/environment';
import { DatabaseService } from 'src/app/shared/services/databaseService.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public authStatus: boolean = false;
  public currentUser: string = localStorage.getItem('currentUser') || '';
  public currentUserObj: any = null;
  public userId: string = localStorage.getItem('userId') || '';
  public role: string = '';
  private cloudFunctionUrl =
    'https://us-central1-honyro-55d73.cloudfunctions.net/app';

  constructor(
    private fireAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private databaseService: DatabaseService,
    private http: HttpClient
  ) {
    this.currentUser = localStorage.getItem('currentUser') || '';
  }

  async login(email: string, password: string): Promise<any> {
    try {
      const user = await this.fireAuth.signInWithEmailAndPassword(
        email,
        password
      );

      if (user.user?.uid) {
        this.currentUser = user.user?.uid;
        localStorage.setItem('currentUser', user.user?.uid);

        await this.firestore
          .collection(`users/${environment.client}/content`, (ref) =>
            ref.where('UID', '==', user.user?.uid)
          )
          .get()
          .pipe(
            map((snapshot) => {
              if (snapshot.docs.length === 0) {
                return null;
              }
              return snapshot.docs[0].data() as any;
            }),
            first(),
            catchError((error) => {
              return from([]);
            }),
            tap((userData) => {
              if (userData) {
                if (userData.id !== this.userId) {
                  localStorage.removeItem('selectedGroup');
                  localStorage.removeItem('selectedGroupIndex');
                }
                if (
                  userData.role === 'collaborator' ||
                  userData.role === 'viewer'
                ) {
                  this.userId = userData.accessTo[0].id;
                  localStorage.setItem('userId', this.userId);
                } else {
                  this.userId = userData.id;
                  localStorage.setItem('userId', this.userId);
                }
                this.role = userData.role;
              } else {
                this.role = '';
                this.userId = '';
                console.log('No se encontró usuario');
              }
            })
          )
          .toPromise();

        return user;
      } else {
        throw new Error();
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    const selectedGroup = localStorage.getItem('selectedGroup');
    const selectedGroupIndex = localStorage.getItem('selectedGroupIndex');
    localStorage.clear();
    if (selectedGroup && selectedGroupIndex) {
      localStorage.setItem('selectedGroup', selectedGroup);
      localStorage.setItem('selectedGroupIndex', selectedGroupIndex);
    }
    return await this.fireAuth.signOut();
  }

  async registerUser(
    email: string,
    nickName: string,
    role: string,
    collaborators: any[]
  ) {
    const emailParts = email.split('@');
    const username = emailParts[0];
    const currentYear = new Date().getFullYear();
    const password = `${username}nyxsys${currentYear}`;

    let uid = '';
    try {
      var config = {
        apiKey: 'AIzaSyBi-yZ0zwj_DcTyt39pVFAAjjf7jqcm3Yw',
        authDomain: 'honyro-55d73.firebaseapp.com',
        databaseURL: 'https://honyro-55d73.firebaseio.com',
      };
      var secondaryApp = firebase.initializeApp(config, 'Secondary');

      await secondaryApp
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then(function (firebaseUser) {
          uid = firebaseUser!.user!.uid;
        });

      const id = this.firestore.createId();
      await secondaryApp;
      this.databaseService.saveUser(
        email,
        uid,
        nickName,
        role,
        id,
        collaborators
      );

      this.databaseService.sendWelcomeEmail(email, password);
    } catch (error) {
      console.log(error);
    }
  }

  async registerCollaborator(
    email: string,
    password: string,
    nickName: string,
    role: string,
    accessTo: any
  ) {
    try {
      let uid = '';
      const config = {
        apiKey: 'AIzaSyBi-yZ0zwj_DcTyt39pVFAAjjf7jqcm3Yw',
        authDomain: 'honyro-55d73.firebaseapp.com',
        databaseURL: 'https://honyro-55d73.firebaseio.com',
      };
      var secondaryApp = firebase.initializeApp(config, 'Secondary');

      await secondaryApp
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then((firebaseUser) => {
          uid = firebaseUser?.user?.uid || '';
        });

      const id = this.firestore.createId();

      /* UPDATING THE MAIN USER */
      const userToPush = {
        id,
        email,
        role,
        nickName,
      };

      const userRef = this.firestore
        .collection(`/users`)
        .doc(environment.client)
        .collection('content')
        .doc(accessTo[0].id);

      userRef.update({
        collaborators: firebase.firestore.FieldValue.arrayUnion(userToPush),
      });

      await secondaryApp;

      await this.databaseService.saveCollaborator(
        email,
        uid,
        nickName,
        role,
        id,
        accessTo
      );
      this.databaseService.sendWelcomeEmail(email, password);
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(email: string): Promise<any> {
    return await this.fireAuth.sendPasswordResetEmail(email);
  }

  async updatePassword(
    actualPassword: string,
    newPassword: string
  ): Promise<any> {
    try {
      this.currentUserObj = await this.fireAuth.currentUser;

      if (this.currentUserObj) {
        let credential = await this.fireAuth.signInWithEmailAndPassword(
          this.currentUserObj.email,
          actualPassword
        );
        if (credential) {
          return this.currentUserObj.updatePassword(newPassword);
        }
      } else {
        throw new Error('User not authenticated');
      }
    } catch (error) {
      throw error;
    }
  }

  async deleteActualUser(): Promise<any> {
    return this.fireAuth.currentUser.then((user) => {
      if (user) {
        return user.delete();
      }
      throw new Error('Error deleting user');
    });
  }

  deleteUser(user: any) {
    const url = `${this.cloudFunctionUrl}/delete-user`;
    this.http.post(url, user).subscribe(
      (response) => {},
      (error) => {}
    );
  }

  isAuthenticated(): Observable<boolean> {
    return this.fireAuth.authState.pipe(
      map((user) => user?.uid === this.currentUser)
    );
  }

  checkRole(): Observable<string> {
    return this.firestore
      .collection(`/users/${environment.client}/content`)
      .doc(this.userId)
      .get()
      .pipe(
        map((user) => {
          const userData: User = <User>user.data();
          return userData.role;
        })
      );
  }
}
