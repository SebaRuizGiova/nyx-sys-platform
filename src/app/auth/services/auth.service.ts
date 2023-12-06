import { Injectable } from '@angular/core';
import { UserCredential } from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public authStatus: boolean = false;
  private currentUser: string = '';

  constructor(private fireAuth: AngularFireAuth) {
    this.currentUser = localStorage.getItem('currentUser') || '';
  }

  async login(email: string, password: string): Promise<any> {
    const user = await this.fireAuth.signInWithEmailAndPassword(
      email,
      password
    );
    if (user.user?.uid) {
      localStorage.setItem('currentUser', user.user?.uid);
    } else {
      throw new Error();
    }
    return user;
  }

  async logout(): Promise<void> {
    localStorage.removeItem('currentUser');
    return await this.fireAuth.signOut();
  }

  async resetPassword(email: string): Promise<any> {
    return await this.fireAuth.sendPasswordResetEmail(email);
  }

  isAuthenticated(): Observable<boolean> {
    return this.fireAuth.authState.pipe(
      map((user) => user?.uid === this.currentUser)
    );
  }
}
