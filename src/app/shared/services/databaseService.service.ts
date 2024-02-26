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
      .pipe(
        map((snapshot) => snapshot.docs.map((doc) => doc.data() as any)),
        map((users) => users.filter((user) => !user.deleted))
      );
  }

  getAllUsersCollection() {
    return this.firestore
      .collection(`users/${environment.client}/content`)
      .ref.where('role', 'in', ['user', 'superAdmin'])
      .where('deleted', '==', false)
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
      .where('deleted', '==', false)
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
        ),
        map((users) => {
          return users.filter((user) => !user.deleted);
        })
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
        ),
        map((devices) => {
          return devices.filter((device) => !device.deleted);
        })
      );
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
        ),
        map((groups) => {
          return groups.filter((group) => !group.deleted);
        })
      );
  }

  getGroupsByUserCollection(userId: string) {
    return this.firestore
      .collection(`/users/${environment.client}/content/${userId}/teams`)
      .ref.where('hided', '==', false)
      .where('deleted', '==', false)
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
              // Actualizar el perfil con el ID establecido
              res
                .update({ id: res.id })
                .then(() => {
                  resolve(profile);
                })
                .catch((error) => {
                  reject(error);
                });
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

  deleteProfile(profile: Profile | null) {
    return new Promise((resolve, reject) => {
      if (profile) {
        const profileRef = this.firestore.doc(
          `/users/nyxsys/content/${profile.userID}/players/${profile.id}`
        );

        profileRef
          .update({
            deleted: true,
            device: false,
            deviceID: null,
            deviceSN: null,
          })
          .then((res) => {
            const deviceRef = this.firestore.doc(
              `/users/nyxsys/content/${
                this.userRole === 'superAdmin'
                  ? profile.userID
                  : this.authService!.userId
              }/devices/${profile.deviceID}`
            );

            deviceRef
              .update({
                player: false,
                playerID: null,
                playerName: null,
                teamID: null,
              })
              .then((res) => {
                resolve(res);
              })
              .catch((error) => {
                reject(error);
              });
            resolve(res);
          })
          .catch((error) => {
            reject(error);
          });
      }
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

  addDevice(device: Device, profiles: Profile[]) {
    return new Promise((resolve, reject) => {
      if (this.authService) {
        this.authService.checkRole().subscribe((role) => {
          let deviceId = '';
          this.userRole = role;

          const deviceRef = this.firestore.collection(
            `/users/nyxsys/content/${
              this.userRole === 'superAdmin'
                ? device.userID
                : this.authService!.userId
            }/devices`
          );

          const { previousUserId, ...rest } = device;

          let newDevice = { ...rest };

          if (device.playerID) {
            const profileLinked = profiles.find(
              (user) => user.id === device.playerID?.toString()
            );

            newDevice = {
              ...rest,
              playerName:
                `${profileLinked?.name} ${profileLinked?.lastName}` || false,
              teamID: profileLinked?.teamID || '',
            };
          }

          deviceRef
            .add(newDevice)
            .then((docRef) => {
              deviceId = docRef.id;
              docRef
                .update({
                  id: deviceId,
                })
                .then((res) => {
                  resolve(res);
                })
                .catch((err) => {
                  reject(err);
                });
              if (device.playerID) {
                const profileRef = this.firestore.doc(
                  `/users/nyxsys/content/${
                    this.userRole === 'superAdmin'
                      ? device.userID
                      : this.authService!.userId
                  }/players/${device.playerID}`
                );

                profileRef
                  .update({
                    device: true,
                    deviceID: deviceId,
                    deviceSN: device.serialNumber,
                  })
                  .then((res) => {
                    resolve(res);
                  })
                  .catch((error) => {
                    reject(error);
                  });
              }
              resolve(docRef);
            })
            .catch((error) => {
              reject(error);
            });
        });
      }
    });
  }

  editDevice(device: Device, profiles: Profile[]) {
    return new Promise((resolve, reject) => {
      if (this.authService) {
        this.authService.checkRole().subscribe((role) => {
          debugger;
          this.userRole = role;

          const { previousUserId, ...rest } = device;

          if (previousUserId) {
            const previousDeviceRef = this.firestore.doc(
              `/users/nyxsys/content/${previousUserId}/devices/${device.id}`
            );

            const addDevicePromise = this.addDevice(device, profiles);
            const deleteDevicePromise = previousDeviceRef.delete();
            const profileToUnlink = profiles.find(
              (profile) => profile.deviceID?.toString() === device.id
            );
            if (profileToUnlink?.id) {
              const profileToUnlinkRef = this.firestore.doc(
                `/users/nyxsys/content/${
                  this.userRole === 'superAdmin'
                    ? profileToUnlink.userID
                    : this.authService!.userId
                }/players/${profileToUnlink.id}`
              );

              const profileToUnlinkRefPromise = profileToUnlinkRef.update({
                device: false,
                deviceID: null,
                deviceSN: null,
              });

              Promise.all([
                addDevicePromise,
                deleteDevicePromise,
                profileToUnlinkRefPromise,
              ])
                .then((res) => resolve(res))
                .catch((err) => reject(err));
            }
          } else {
            const deviceRef = this.firestore.doc(
              `/users/nyxsys/content/${
                this.userRole === 'superAdmin'
                  ? device.userID
                  : this.authService!.userId
              }/devices/${device.id}`
            );

            const deviceRefPromise = deviceRef.update({
              ...rest,
              player: device.playerID ? true : false,
              playerID: device.playerID ? device.playerID : '',
              userID: device.userID ? device.userID : '',
            });

            if (device?.playerID) {
              const profileToUnlink = profiles.find(
                (profile) => profile.deviceID?.toString() === device.id
              );
              if (
                profileToUnlink?.id &&
                profileToUnlink?.id !== device.playerID?.toString()
              ) {
                const profileToUnlinkRef = this.firestore.doc(
                  `/users/nyxsys/content/${
                    this.userRole === 'superAdmin'
                      ? profileToUnlink.userID
                      : this.authService!.userId
                  }/players/${profileToUnlink.id}`
                );

                profileToUnlinkRef
                  .update({
                    device: false,
                    deviceID: null,
                    deviceSN: null,
                  })
                  .then((res) => {
                    resolve(res);
                  })
                  .catch((error) => {
                    reject(error);
                  });
              }

              const profileToLinkRef = this.firestore.doc(
                `/users/nyxsys/content/${
                  this.userRole === 'superAdmin'
                    ? device.userID
                    : this.authService!.userId
                }/players/${device.playerID}`
              );

              const profileToLinkRefPromise = profileToLinkRef.update({
                device: true,
                deviceID: device.id,
                deviceSN: device.serialNumber,
              });

              Promise.all([deviceRefPromise, profileToLinkRefPromise])
                .then((res) => {
                  resolve(res);
                })
                .catch((error) => {
                  reject(error);
                });
            } else {
              const profileToUnlink = profiles.find(
                (profile) => profile.deviceID?.toString() === device.id
              );
              if (
                profileToUnlink?.id &&
                profileToUnlink?.id !== device.playerID?.toString()
              ) {
                const profileToUnlinkRef = this.firestore.doc(
                  `/users/nyxsys/content/${
                    this.userRole === 'superAdmin'
                      ? profileToUnlink.userID
                      : this.authService!.userId
                  }/players/${profileToUnlink.id}`
                );

                const profileToUnlinkRefPromise = profileToUnlinkRef.update({
                  device: false,
                  deviceID: null,
                  deviceSN: null,
                });

                Promise.all([profileToUnlinkRefPromise, deviceRefPromise])
                  .then((res) => {
                    resolve(res);
                  })
                  .catch((error) => {
                    reject(error);
                  });
              }
            }
          }
        });
      }
    });
  }

  deleteDevice(deviceId: string, userId: string) {
    return new Promise((resolve, reject) => {
      const deviceRef = this.firestore.doc(
        `/users/nyxsys/content/${userId}/devices/${deviceId}`
      );

      // Obtener referencias a la colección de jugadores ('players')
      const playersRef = this.firestore.collection(
        `/users/nyxsys/content/${userId}/players`
      );

      // Realizar la operación de eliminación del dispositivo y la actualización de los jugadores en una transacción
      this.firestore.firestore
        .runTransaction((transaction) => {
          // Obtener el dispositivo a eliminar
          return transaction.get(deviceRef.ref).then((deviceDoc) => {
            if (!deviceDoc.exists) {
              throw new Error('El dispositivo no existe');
            }

            // Eliminar el dispositivo
            transaction.delete(deviceRef.ref);

            // Obtener el ID del dispositivo a eliminar
            const deviceId = deviceDoc.id;

            // Actualizar las propiedades 'device', 'deviceID' y 'deviceSN' de los jugadores vinculados a ese dispositivo
            return playersRef.ref
              .where('deviceID', '==', deviceId)
              .get()
              .then((playersSnapshot) => {
                playersSnapshot.forEach((playerDoc) => {
                  const playerRef = playersRef.doc(playerDoc.id);
                  transaction.update(playerRef.ref, {
                    device: false,
                    deviceID: null,
                    deviceSN: null,
                  });
                });
              });
          });
        })
        .then(() => {
          resolve('Operaciones completadas exitosamente');
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

  deleteGroup(
    groupId: string,
    userId: string,
    deleteProfiles: boolean,
    deleteDevices: boolean
  ) {
    return new Promise((resolve, reject) => {
      const groupRef = this.firestore.doc(
        `/users/nyxsys/content/${userId}/teams/${groupId}`
      );

      groupRef
        .update({
          deleted: true,
        })
        .then((res) => {
          // Batch para realizar operaciones en lote
          const batch = this.firestore.firestore.batch();

          // Eliminar los perfiles vinculados al grupo
          if (deleteProfiles) {
            const profilesRef = this.firestore.collection(
              `/users/nyxsys/content/${userId}/players`,
              (ref) => ref.where('teamID', '==', groupId)
            ).ref;

            profilesRef
              .get()
              .then((querySnapshot) => {
                querySnapshot.forEach((doc: any) => {
                  batch.update(doc.ref, { deleted: true });

                  // Eliminar dispositivos asociados a los perfiles si es necesario
                  if (deleteDevices) {
                    const deviceID = doc.data().deviceID;
                    if (deviceID) {
                      const deviceRef = this.firestore.doc(
                        `/users/nyxsys/content/${userId}/devices/${deviceID}`
                      ).ref;
                      batch.delete(deviceRef);
                    }
                  }
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
            // No eliminar perfiles, solo actualizar la referencia del equipo en los perfiles a ''
            const profilesRef = this.firestore.collection(
              `/users/nyxsys/content/${userId}/players`,
              (ref) => ref.where('teamID', '==', groupId)
            ).ref;

            profilesRef
              .get()
              .then((querySnapshot) => {
                querySnapshot.forEach((doc: any) => {
                  batch.update(doc.ref, { teamID: null });

                  // Eliminar dispositivos asociados a los perfiles si es necesario
                  if (deleteDevices) {
                    const deviceID = doc.data().deviceID;
                    if (deviceID) {
                      const deviceRef = this.firestore.doc(
                        `/users/nyxsys/content/${userId}/devices/${deviceID}`
                      ).ref;
                      batch.delete(deviceRef);
                    }
                  }
                });

                return batch.commit();
              })
              .then(() => {
                resolve('Grupo y perfiles actualizados correctamente.');
              })
              .catch((error) => {
                reject(error);
              });
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

        this.authService.checkRole().subscribe(async (role) => {
          this.userRole = role;

          let userAccess: User | undefined = undefined;

          if (this.userRole === 'superAdmin') {
            userId = collaborator.UID;

            userAccess = users.find((user) => {
              return user.id === userId;
            });
          } else {
            userId = this.authService!.userId;

            const userDataDoc = await this.getUserDataDoc(userId);
            userAccess = <User>userDataDoc.data();
          }
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

          let userToAccess: User | undefined = undefined;

          if (this.userRole === 'superAdmin') {
            userToAccess = users.find(
              (user: User) => user.id === userIdToAccess
            );
          } else {
            const userDataDoc = await this.getUserDataDoc(userIdToAccess);
            userToAccess = <User>userDataDoc.data();
          }

          const newCollaboratorsUserToAccess =
            userToAccess?.collaborators.filter(
              (collaborator: Collaborator) => collaborator.id !== collaboratorId
            );

          await userAccessRef.update({
            collaborators: newCollaboratorsUserToAccess,
          });

          this.authService.deleteUser(collaborator);
          resolve('Colaborador eliminado correctamente');
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
        const userRef = this.firestore.doc(
          `/users/nyxsys/content/${user.id}`
        ).ref;
        const batch = this.firestore.firestore.batch(); // Inicializar un lote de escritura en Firestore

        // Actualizar la propiedad 'deleted' del usuario a true
        batch.update(userRef, { deleted: true });

        // Obtener referencias a las colecciones de 'teams', 'players', 'devices' y 'collaborators'
        const teamsRef = userRef.collection('teams');
        const playersRef = userRef.collection('players');
        const devicesRef = userRef.collection('devices');

        // Obtener todos los documentos de 'teams' y 'players' para actualizar la propiedad 'deleted' a true
        teamsRef
          .get()
          .then((teamsSnapshot) => {
            teamsSnapshot.forEach((doc) => {
              const teamRef = teamsRef.doc(doc.id);
              batch.update(teamRef, { deleted: true });
            });

            // Actualizar la propiedad 'deleted', 'device', 'deviceID' y 'deviceSN' de cada jugador
            playersRef
              .get()
              .then((playersSnapshot) => {
                playersSnapshot.forEach((doc) => {
                  const playerRef = playersRef.doc(doc.id);
                  batch.update(playerRef, {
                    device: false,
                    deviceID: null,
                    deviceSN: null,
                    deleted: true,
                  });
                });

                // Eliminar todos los documentos de la colección 'devices'
                devicesRef
                  .get()
                  .then((devicesSnapshot) => {
                    devicesSnapshot.forEach((doc) => {
                      const deviceRef = devicesRef.doc(doc.id);
                      batch.delete(deviceRef);
                    });

                    // Obtener todos los colaboradores y eliminarlos
                    userRef
                      .get()
                      .then((userDoc) => {
                        const userData = <User>userDoc.data();
                        if (userData && userData.collaborators) {
                          userData.collaborators.forEach(
                            (collaboratorId: string) => {
                              const collaboratorRef = this.firestore.doc(
                                `/users/nyxsys/content/${collaboratorId}`
                              ).ref;
                              batch.delete(collaboratorRef);
                            }
                          );
                        }

                        // Ejecutar todas las operaciones en lote
                        batch
                          .commit()
                          .then(() => {
                            resolve('Operaciones completadas exitosamente');
                          })
                          .catch((error) => {
                            reject(error);
                          });
                      })
                      .catch((error) => {
                        reject(error);
                      });
                  })
                  .catch((error) => {
                    reject(error);
                  });
              })
              .catch((error) => {
                reject(error);
              });
          })
          .catch((error) => {
            reject(error);
          });
      }
    });
  }
}
