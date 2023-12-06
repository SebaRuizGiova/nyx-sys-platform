import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, map, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class isAuthenticatedGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  private checkAuthStatus(): boolean | Observable<boolean> {
    return this.authService.isAuthenticated().pipe(
      map((isAuthenticated) => {
        if (!isAuthenticated) {
          this.router.navigateByUrl('/auth/login');
        }
        return isAuthenticated;
      })
    );
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | Observable<boolean> {
    return this.checkAuthStatus();
  }
}
