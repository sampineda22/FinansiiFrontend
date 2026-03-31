import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject, tap, map } from 'rxjs';
import { Navigation } from 'app/core/navigation/navigation.types';
import { FuseNavigationItem } from '@fuse/components/navigation';
import { ScreenNavigation } from 'app/core/navigation/screenNavigation';
import { SharedService } from 'app/shared/shared.service';
import { AppNavigationMapper } from './app-navigation.mapper';
import { FuseNavigationService } from '@fuse/components/navigation';

@Injectable({
    providedIn: 'root'
})
export class NavigationService {
    private _navigation: ReplaySubject<Navigation> = new ReplaySubject<Navigation>(1);

    /*Commented on 2026-mar.-06 by spineda - Begin*/
    private _flatNavigation: ReplaySubject<FuseNavigationItem[]> = new ReplaySubject<FuseNavigationItem[]>(1);
    private _screens: ReplaySubject<ScreenNavigation[]> = new ReplaySubject<ScreenNavigation[]>(1);

    private _navigationSnapshot: Navigation = {
        compact: [],
        default: [],
        futuristic: [],
        horizontal: []
    };

    private _flatNavigationSnapshot: FuseNavigationItem[] = [];
    private _screensSnapshot: ScreenNavigation[] = [];
    /*Commented on 2026-mar.-06 by spineda - End*/

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient,
        /*Commented on 2026-mar.-06 by spineda - Begin*/
        private _sharedService: SharedService,
        private _appNavigationMapper: AppNavigationMapper,
        private _fuseNavigationService: FuseNavigationService
        /*Commented on 2026-mar.-06 by spineda - End*/) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for navigation
     */
    get navigation$(): Observable<Navigation> {
        return this._navigation.asObservable();
    }

    /*Commented on 2026-mar.-06 by spineda - Begin*/
    get flatNavigation$(): Observable<FuseNavigationItem[]> {
        return this._flatNavigation.asObservable();
    }

    get screens$(): Observable<ScreenNavigation[]> {
        return this._screens.asObservable();
    }

    get navigationSnapshot(): Navigation {
        return this._navigationSnapshot;
    }

    get flatNavigationSnapshot(): FuseNavigationItem[] {
        return this._flatNavigationSnapshot;
    }

    get screensSnapshot(): ScreenNavigation[] {
        return this._screensSnapshot;
    }
    /*Commented on 2026-mar.-06 by spineda - End*/

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get all navigation data
     */
    get(): Observable<Navigation> {
        return this._httpClient.get<Navigation>('api/common/navigation').pipe(
            tap((navigation) => {
                /*Commented on 2026-mar.-06 by spineda - Begin*/
                this._navigationSnapshot = navigation;
                /*Commented on 2026-mar.-06 by spineda - End*/
                this._navigation.next(navigation);

                /*Commented on 2026-mar.-06 by spineda - Begin*/
                const safeDefaultNavigation = Array.isArray(navigation?.default)
                    ? navigation.default
                    : [];

                const flat = this._fuseNavigationService.getFlatNavigation(safeDefaultNavigation);
                this._flatNavigationSnapshot = flat;
                this._flatNavigation.next(flat);
                /*Commented on 2026-mar.-06 by spineda - End*/
            })
        );
    }

    loadForUser(userId: string): Observable<Navigation> {
        return this._sharedService.getScreensByUserId$(userId).pipe(
            map((response: any) => Array.isArray(response?.data) ? response.data : []),
            tap((screens: ScreenNavigation[]) => {
                this._screensSnapshot = screens;
                this._screens.next(screens);
            }),
            map((screens: ScreenNavigation[]) => this._appNavigationMapper.toFuseNavigation(screens)),
            map((defaultNavigation: FuseNavigationItem[]) => {
                const navigation: Navigation = {
                    compact: [],
                    default: Array.isArray(defaultNavigation) ? defaultNavigation : [],
                    futuristic: [],
                    horizontal: []
                };
                return navigation;
            }),
            tap((navigation: Navigation) => {
                this._navigationSnapshot = navigation;
                this._navigation.next(navigation);

                const safeDefaultNavigation = Array.isArray(navigation?.default)
                    ? navigation.default
                    : [];

                const flat = this._fuseNavigationService.getFlatNavigation(safeDefaultNavigation);
                this._flatNavigationSnapshot = flat;
                this._flatNavigation.next(flat);
            })
        );
    }

    setScreens(screens: ScreenNavigation[]): void {
        this._screensSnapshot = screens;
        this._screens.next(screens);

        const defaultNavigation = this._appNavigationMapper.toFuseNavigation(screens);

        const navigation: Navigation = {
            compact: [],
            default: defaultNavigation,
            futuristic: [],
            horizontal: []
        };

        this._navigationSnapshot = navigation;
        this._navigation.next(navigation);

        const flat = this._fuseNavigationService.getFlatNavigation(defaultNavigation);
        this._flatNavigationSnapshot = flat;
        this._flatNavigation.next(flat);
    }

    clear(): void {
        this._screensSnapshot = [];
        this._screens.next([]);

        const emptyNavigation: Navigation = {
            compact: [],
            default: [],
            futuristic: [],
            horizontal: []
        };

        this._navigationSnapshot = emptyNavigation;
        this._navigation.next(emptyNavigation);

        this._flatNavigationSnapshot = [];
        this._flatNavigation.next([]);
    }
}
