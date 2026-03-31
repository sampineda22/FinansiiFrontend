import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { EMPTY, of } from 'rxjs';
import Swal from 'sweetalert2';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { SharedService } from 'app/shared/shared.service';

@Component({
    selector: 'auth-sign-in',
    templateUrl: './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class AuthSignInComponent implements OnInit {
    @ViewChild('signInNgForm') signInNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: ''
    };
    signInForm: UntypedFormGroup;
    showAlert: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
        /*Commented on 2026-mar.-06 by spineda - Begin*/
        private _navigationService: NavigationService,
        private _sharedService: SharedService
        /*Commented on 2026-mar.-06 by spineda - End*/
    ) {
        /*this._sharedService.getScreensByUserId$('spineda').subscribe((data: any) => {
            const screens: ScreenNavigation[] = data.data;
            console.log('data:', screens);
        })*/
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the form
        this.signInForm = this._formBuilder.group({
            user: ['', [Validators.required]],
            password: ['', Validators.required]
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign in
     */
    signIn(): void {
        // Return if the form is invalid
        if (this.signInForm.invalid) {
            return;
        }

        // Disable the form
        this.signInForm.disable();

        // Hide the alert
        this.showAlert = false;

        /*Commented on 2026-mar.-06 by spineda - Begin*/
        const redirectURL =
            this._activatedRoute.snapshot.queryParamMap.get('redirectURL') ||
            '/signed-in-redirect';

        this._authService.signIn(this.signInForm.value).pipe(
            switchMap(() => {
                const userId = this._sharedService.getUser();

                if (!userId) {
                    throw new Error('User ID not found after sign-in');
                }

                return this._navigationService.loadForUser(String(userId));
            }),
            switchMap((navigation) => {
                if (!navigation.default || navigation.default.length === 0) {
                    Swal.fire('', 'No se encontraron pantallas asignadas. Validar si el usuario tiene un rol asignado', 'info');

                    this.signInForm.enable();
                    this.signInNgForm?.resetForm();

                    return this._authService.signOut().pipe(
                        switchMap(() => EMPTY)
                    );
                }

                return of(navigation);
            }),
            tap(() => this._router.navigateByUrl(redirectURL)),
            catchError((error) => {
                console.error(error);

                this.signInForm.enable();
                this.signInNgForm?.resetForm();

                this.alert = {
                    type: 'error',
                    message: 'Error en usuario o contraseña'
                };

                this.showAlert = true;
                return EMPTY;
            })
        ).subscribe();
    }
}
