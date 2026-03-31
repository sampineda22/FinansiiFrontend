import { Injectable } from "@angular/core";
import { Resolve, Router } from "@angular/router";
import { AuthService } from "../auth/auth.service";
import { NavigationService } from "./navigation.service";
import { catchError, map, Observable, of, switchMap, take } from "rxjs";
import { SharedService } from "app/shared/shared.service";

@Injectable({
    providedIn: 'root'
})
export class AppNavigationResolver implements Resolve<boolean> {
    constructor(
        private _authService: AuthService,
        private _navigationService: NavigationService,
        private _sharedService: SharedService,
        private _router: Router
    ) { }

    resolve(): Observable<boolean> {
        return this._authService.check().pipe(
            take(1),
            switchMap((isAuthenticated: boolean) => {
                if (!isAuthenticated) {
                    this._navigationService.clear();
                    this._router.navigate(['/sign-in']);
                    return of(false);
                }

                const userId = this._sharedService.getUser();

                if (!userId) {
                    console.error('Error in AppNavigationResolver: userId not found in local storage');
                    this._navigationService.clear();
                    this._router.navigate(['/sign-in']);
                    return of(false);
                }

                return this._navigationService.loadForUser(String(userId)).pipe(
                    map(() => true),
                    catchError((error) => {
                        console.error('Error in AppNavigationResolver: loadForUser failed', error);
                        this._navigationService.clear();
                        this._router.navigate(['/sign-in']);
                        return of(false);
                    })
                );
            }),
            catchError((error) => {
                console.error('Error in AppNavigationResolver: auth check failed', error);
                this._navigationService.clear();
                this._router.navigate(['/sign-in']);
                return of(false);
            })
        );
    }
}