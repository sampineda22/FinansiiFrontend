import { Injectable } from '@angular/core'
import { cloneDeep } from 'lodash-es';
import { FuseMockApiService } from '@fuse/lib/mock-api';
import { NavigationService } from 'app/core/navigation/navigation.service';

@Injectable({
    providedIn: 'root'
})
export class NavigationMockApi
{
    //private readonly _compactNavigation: FuseNavigationItem[] = compactNavigation;
    /*Commented on 2026-feb.-27 by spineda - Begin*/
    //private /*readonly*/ _defaultNavigation: FuseNavigationItem[] = defaultNavigation;
    /*Commented on 2026-feb.-27 by spineda - End*/
    //private readonly _futuristicNavigation: FuseNavigationItem[] = futuristicNavigation;
    //private readonly _horizontalNavigation: FuseNavigationItem[] = horizontalNavigation;

    /**
     * Constructor
     */
    constructor(private _fuseMockApiService: FuseMockApiService,
                /*Commented on 2026-mar.-05 by spineda - Begin*/
                private _navigationService: NavigationService
                /*Commented on 2026-mar.-05 by spineda - End*/)
    {
        // Register Mock API handlers
        this.registerHandlers();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Register Mock API handlers
     */
    registerHandlers(): void
    {
        // -----------------------------------------------------------------------------------------------------
        // @ Navigation - GET
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onGet('api/common/navigation')
            .reply(() => {
                
                // Fill compact navigation children using the default navigation
                /*this._compactNavigation.forEach((compactNavItem) => {
                    debugger
                    this._defaultNavigation.forEach((defaultNavItem) => {
                        debugger
                        if ( defaultNavItem.id === compactNavItem.id )
                        {
                            compactNavItem.children = cloneDeep(defaultNavItem.children);
                        }
                    });
                });
                
                // Fill futuristic navigation children using the default navigation
                this._futuristicNavigation.forEach((futuristicNavItem) => {
                    this._defaultNavigation.forEach((defaultNavItem) => {
                        if ( defaultNavItem.id === futuristicNavItem.id )
                        {
                            futuristicNavItem.children = cloneDeep(defaultNavItem.children);
                        }
                    });
                });

                // Fill horizontal navigation children using the default navigation
                
                this._horizontalNavigation.forEach((horizontalNavItem) => {
                    this._defaultNavigation.forEach((defaultNavItem) => {
                        if ( defaultNavItem.id === horizontalNavItem.id )
                        {
                            horizontalNavItem.children = cloneDeep(defaultNavItem.children);
                        }
                    });
                });
                // Return the response*/
                
                return [
                    200,
                    //{
                        //compact   : cloneDeep(this._compactNavigation),
                        /*Commented on 2026-mar.-05 by spineda - Begin*/
                        //default   : cloneDeep(this._defaultNavigation)
                        cloneDeep(this._navigationService.navigationSnapshot)
                        /*Commented on 2026-mar.-05 by spineda - End*/
                        //futuristic: cloneDeep(this._futuristicNavigation),
                        //horizontal: cloneDeep(this._horizontalNavigation)
                    //}
                ];
            });
    }
}
