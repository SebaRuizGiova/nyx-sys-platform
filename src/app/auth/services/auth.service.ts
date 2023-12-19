import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, catchError, first, from, map, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public authStatus: boolean = false;
  public currentUser: string = localStorage.getItem('currentUser') || '';
  public currentUserObj: any = null;
  public userId: string = localStorage.getItem('userId') || '';
  public role: string = localStorage.getItem('role') || '';

  constructor(
    private fireAuth: AngularFireAuth,
    private firestore: AngularFirestore
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
              console.error(error);
              return from([]);
            }),
            tap((userData) => {
              if (userData) {
                this.userId = userData.id;
                localStorage.setItem('userId', userData.id);
                const actualRole = localStorage.getItem('role');
                if (userData.role !== actualRole) {
                  localStorage.removeItem('selectedGroup');
                  localStorage.removeItem('selectedGroupIndex');
                }
                this.role = userData.role;
                localStorage.setItem('role', this.role);
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

  async deleteUser(): Promise<any> {
    return this.fireAuth.currentUser.then((user) => {
      if (user) {
        return user.delete();
      }
      throw new Error('Error deleting user')
    });
  }

  isAuthenticated(): Observable<boolean> {
    return this.fireAuth.authState.pipe(
      map((user) => user?.uid === this.currentUser)
    );
  }
}
