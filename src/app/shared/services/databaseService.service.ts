import { Injectable, Injector } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Profile } from 'src/app/dashboard/interfaces/profile.interface';
import { User } from 'src/app/dashboard/interfaces/user.interface';
import { Device } from 'src/app/dashboard/interfaces/device.interface';
import { Group } from 'src/app/dashboard/interfaces/group.interface';
import { AuthService } from 'src/app/auth/services/auth.service';
import { Collaborator } from 'src/app/dashboard/interfaces/collaborator.interface';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  public groupsList: any[] = [];
  public selectedGroupId: string = '';
  public selectedGroupIndex: number = 0;
  public profiles: Profile[] = [];
  private authService?: AuthService;
  private userRole: string = '';

  constructor(private firestore: AngularFirestore, private injector: Injector) {
    setTimeout(() => (this.authService = this.injector.get(AuthService)));
  }

  getAllUsers(): Observable<any> {
    return this.firestore
      .collection(`users/${environment.client}/content`)
      .get()
      .pipe(map((snapshot) => snapshot.docs.map((doc) => doc.data() as any)));
  }

  getAllUsersCollection() {
    return this.firestore
      .collection(`users/${environment.client}/content`)
      .ref.where('role', 'in', ['user', 'superAdmin'])
      .get();
  }

  saveUser(
    email: string,
    UID: string,
    nickName: string,
    role: string,
    id: string,
    collaborators: any[]
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        const data = {
          id,
          email,
          UID,
          nickName,
          role,
          collaborators,
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
      .ref.where('role', 'in', ['collaborator', 'viewer'])
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

  addProfile(profile: Profile) {
    return new Promise((resolve, reject) => {
      if (this.authService) {
        this.authService.checkRole().subscribe((role) => {
          this.userRole = role;

          const profileRef = this.firestore.collection(
            `/users/nyxsys/content/${
              this.userRole === 'superAdmin'
                ? profile.userID
                : this.authService!.userId
            }/players`
          );

          profileRef
            .add(profile)
            .then((res) => {
              resolve(res);
            })
            .catch((error) => {
              reject(error);
            });
        });
      }
    });
  }

  editProfile(profile: Profile) {
    return new Promise((resolve, reject) => {
      if (this.authService) {
        this.authService.checkRole().subscribe((role) => {
          this.userRole = role;

          const profileRef = this.firestore.doc(
            `/users/nyxsys/content/${
              this.userRole === 'superAdmin'
                ? profile.userID
                : this.authService!.userId
            }/players/${profile.id}`
          );

          profileRef
            .set(
              {
                ...profile,
              },
              { merge: true }
            )
            .then((res) => {
              resolve(res);
            })
            .catch((error) => {
              reject(error);
            });
        });
      }
    });
  }

  deleteProfile(profileId: string, userId: string) {
    return new Promise((resolve, reject) => {
      const profileRef = this.firestore.doc(
        `/users/nyxsys/content/${userId}/players/${profileId}`
      );

      profileRef
        .delete()
        .then((res) => {
          resolve(res);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  hideProfile(userIdProfile: string, profileId: string, hideValue: boolean) {
    return new Promise((resolve, reject) => {
      const profileRef = this.firestore.doc(
        `/users/nyxsys/content/${userIdProfile}/players/${profileId}`
      );

      profileRef
        .update({ hided: !hideValue })
        .then((res) => {
          resolve(res);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  addDevice(device: Device) {
    return new Promise((resolve, reject) => {
      if (this.authService) {
        this.authService.checkRole().subscribe((role) => {
          this.userRole = role;

          const deviceRef = this.firestore.collection(
            `/users/nyxsys/content/${
              this.userRole === 'superAdmin'
                ? device.userID
                : this.authService!.userId
            }/devices`
          );

          deviceRef
            .add(device)
            .then((res) => {
              resolve(res);
            })
            .catch((error) => {
              reject(error);
            });
        });
      }
    });
  }

  editDevice(device: Device) {
    return new Promise((resolve, reject) => {
      if (this.authService) {
        this.authService.checkRole().subscribe((role) => {
          this.userRole = role;

          const deviceRef = this.firestore.doc(
            `/users/nyxsys/content/${
              this.userRole === 'superAdmin'
                ? device.userID
                : this.authService!.userId
            }/devices/${device.id}`
          );

          deviceRef
            .set(device, { merge: true })
            .then((res) => {
              resolve(res);
            })
            .catch((error) => {
              reject(error);
            });
        });
      }
    });
  }

  deleteDevice(deviceId: string, userId: string) {
    return new Promise((resolve, reject) => {
      const deviceRef = this.firestore.doc(
        `/users/nyxsys/content/${userId}/devices/${deviceId}`
      );

      deviceRef
        .delete()
        .then((res) => {
          resolve(res);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  addGroup(group: Group) {
    return new Promise((resolve, reject) => {
      if (this.authService) {
        this.authService.checkRole().subscribe((role) => {
          this.userRole = role;

          const groupRef = this.firestore.collection(
            `/users/nyxsys/content/${
              this.userRole === 'superAdmin'
                ? group.userID
                : this.authService!.userId
            }/teams`
          );

          groupRef
            .add(group)
            .then((res) => {
              resolve(res);
            })
            .catch((error) => {
              reject(error);
            });
        });
      }
    });
  }

  editGroup(group: Group) {
    return new Promise((resolve, reject) => {
      if (this.authService) {
        this.authService.checkRole().subscribe((role) => {
          this.userRole = role;

          const groupRef = this.firestore.doc(
            `/users/nyxsys/content/${
              this.userRole === 'superAdmin'
                ? group.userID
                : this.authService!.userId
            }/teams/${group.id}`
          );

          groupRef
            .set(group, { merge: true })
            .then((res) => {
              resolve(res);
            })
            .catch((error) => {
              reject(error);
            });
        });
      }
    });
  }

  deleteGroup(groupId: string, userId: string, deleteProfiles: boolean) {
    return new Promise((resolve, reject) => {
      const groupRef = this.firestore.doc(
        `/users/nyxsys/content/${userId}/teams/${groupId}`
      );

      groupRef
        .update({
          deleted: true,
        })
        .then((res) => {
          // Eliminar los perfiles vinculados al grupo
          if (deleteProfiles) {
            const profilesRef = this.firestore.collection(
              `/users/nyxsys/content/${userId}/players`,
              (ref) => ref.where('teamID', '==', groupId)
            );

            profilesRef.ref
              .get()
              .then((querySnapshot) => {
                const batch = this.firestore.firestore.batch();

                querySnapshot.forEach((doc) => {
                  batch.update(doc.ref, { deleted: true });
                });

                return batch.commit();
              })
              .then(() => {
                resolve('Grupo y perfiles eliminados correctamente.');
              })
              .catch((error) => {
                reject(error);
              });
          } else {
            resolve(res);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  hideGroup(userIdGroup: string, groupId: string, hideValue: boolean) {
    return new Promise((resolve, reject) => {
      const groupRef = this.firestore.doc(
        `/users/nyxsys/content/${userIdGroup}/teams/${groupId}`
      );

      groupRef
        .update({ hided: !hideValue })
        .then((res) => {
          resolve(res);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  addCollaborator(collaborator: Collaborator, users: User[]) {
    return new Promise((resolve, reject) => {
      if (this.authService) {
        let userId = '';

        this.authService.checkRole().subscribe((role) => {
          this.userRole = role;

          if (this.userRole === 'superAdmin') {
            userId = collaborator.UID;
          } else {
            userId = this.authService!.currentUser;
          }

          const userAccess: User | undefined = users.find((user) => {
            return user.id === userId;
          });

          const accessTo = [
            {
              email: userAccess?.email,
              id: userAccess?.id,
              nickName: userAccess?.nickName,
            },
          ];

          if (collaborator.email && collaborator.password) {
            this.authService!.registerCollaborator(
              collaborator.email,
              collaborator.password,
              collaborator.nickName,
              collaborator.role,
              accessTo
            )
              .then((res: any) => resolve(res))
              .catch((error: any) => reject(error));
          } else {
            reject(new Error('Email o password obligatorios'));
          }
        });
      }
    });
  }

  editCollaborator(collaborator: Collaborator, users: User[]) {
    return new Promise((resolve, reject) => {
      if (this.authService) {
        this.authService.checkRole().subscribe((role) => {
          debugger;
          this.userRole = role;

          const userAccessRef = this.firestore
            .collection(`/users`)
            .doc(environment.client)
            .collection('content')
            .doc(collaborator.accessTo[0].id);

          const userAccess = users.find(
            (user) => user.id === collaborator.accessTo[0].id
          );

          const filterCollaborators =
            userAccess?.collaborators.filter(
              (collab) => collab.id !== collaborator.id
            ) || [];

          const collaborators = [
            ...filterCollaborators,
            {
              id: collaborator.id,
              email: collaborator.email,
              role: collaborator.role,
              nickName: collaborator.nickName,
            },
          ];

          const accessToPromise = userAccessRef.update({
            collaborators,
          });

          const collaboratorRef = this.firestore
            .collection(`/users`)
            .doc(environment.client)
            .collection('content')
            .doc(collaborator.id);

          const collaboratorPromise = collaboratorRef.update(collaborator);

          Promise.all([accessToPromise, collaboratorPromise])
            .then((res) => {
              resolve(res);
            })
            .catch((error) => {
              reject(error);
            });
        });
      }
    });
  }

  deleteCollaborator(
    collaboratorId: string,
    userIdToAccess: string,
    collaborator: Collaborator | null,
    users: User[]
  ) {
    return new Promise(async (resolve, reject) => {
      if (this.authService) {
        try {
          const collaboratorRef = this.firestore.doc(
            `/users/nyxsys/content/${collaboratorId}`
          );

          const userAccessRef = this.firestore.doc(
            `/users/nyxsys/content/${userIdToAccess}`
          );

          await collaboratorRef.delete();

          const userToAccess = users.find(
            (user: User) => user.id === userIdToAccess
          );
          const newCollaboratorsUserToAccess =
            userToAccess?.collaborators.filter(
              (collaborator: Collaborator) => collaborator.id !== collaboratorId
            );

          await userAccessRef.update({
            collaborators: newCollaboratorsUserToAccess,
          });

          this.authService.deleteUser(collaborator);
        } catch (error) {
          throw error;
        }
      }
    });
  }

  addUser(user: User) {
    return new Promise((resolve, reject) => {
      if (this.authService) {
        this.authService
          .registerUser(
            user.email,
            user.nickName,
            user.role,
            user.collaborators
          )
          .then((res) => {
            resolve(res);
          })
          .catch((error) => {
            reject(error);
          });
      }
    });
  }

  editUser(user: User) {
    return new Promise((resolve, reject) => {
      const userRef = this.firestore.doc(`/users/nyxsys/content/${user.id}`);

      userRef
        .update({
          role: user.role,
          nickName: user.nickName,
        })
        .then((res) => {
          resolve(res);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  deleteUser(user: User | null) {
    return new Promise((resolve, reject) => {
      if (this.authService && user) {
        const userRef = this.firestore.doc(`/users/nyxsys/content/${user.id}`);

        userRef
          .update({
            deleted: true,
          })
          .then((res) => {
            resolve(res);
          })
          .catch((error) => {
            reject(error);
          });

        this.authService.deleteUser(user);
      }
    });
  }
}
