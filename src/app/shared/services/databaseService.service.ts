import { Injectable } from '@angular/core';
import {
  AngularFirestore,
} from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private UID: string | null = this.authService.currentUser || localStorage.getItem('currentUser');
  private teamsList: any;

  constructor(
    private firestore: AngularFirestore,
    private authService: AuthService
  ) {}

  getAllUsers(): Observable<any> {
    const usersCollection = this.firestore.collection(`users/${environment.client}/content`);

    return usersCollection.valueChanges();
  }

  getUserByUID(): Observable<any> {
    const usersCollection = this.firestore.collection(`users/${environment.client}/content`, (ref) =>
      ref.where('UID', '==', this.UID)
    );

    return usersCollection.valueChanges();
  }

  getTeamsUser(userId: string) {
    return this.firestore.collection(
      `/users/${environment.client}/content/${userId}/teams`
    ).valueChanges();
  }

  getTeamsUserAdmin(userId: string) {
    return this.firestore.collection(
      `/users/${environment.client}/content/${userId}/teams`
    ).valueChanges();
  }
}
