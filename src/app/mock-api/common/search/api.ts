import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { FuseMockApiService } from '@fuse/lib/mock-api';
import { contacts } from 'app/mock-api/apps/contacts/data';
import { tasks } from 'app/mock-api/apps/tasks/data';
import { NavigationService } from 'app/core/navigation/navigation.service';

@Injectable({
    providedIn: 'root'
})
export class SearchMockApi
{
    /*Commented on 2026-mar.-09 by spineda - Begin
    private readonly _defaultNavigation: FuseNavigationItem[] = defaultNavigation;
    Commented on 2026-mar.-09 by spineda - End*/
    private readonly _contacts: any[] = contacts;
    private readonly _tasks: any[] = tasks;

    /**
     * Constructor
     */
    constructor(
        private _fuseMockApiService: FuseMockApiService,
        /*Commented on 2026-mar.-09 by spineda - Begin*/
        private _navigationService: NavigationService
        /*Commented on 2026-mar.-09 by spineda - End*/
    )
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
        // Get the flat navigation and store it
        /*Commented on 2026-mar.-05 by spineda - Begin*/
        //const flatNavigation = this._fuseNavigationService.getFlatNavigation(this._defaultNavigation);
        /*Commented on 2026-mar.-05 by spineda - End*/
        // -----------------------------------------------------------------------------------------------------
        // @ Search results - GET
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onPost('api/common/search')
            .reply(({request}) => {

                /*Commented on 2026-mar.-09 by spineda - Begin*/
                // Get the search query
                //const query = cloneDeep(request.body.query.toLowerCase());
                const query = cloneDeep(request.body?.query?.toLowerCase?.() ?? '');
                /*Commented on 2026-mar.-09 by spineda - End*/

                // If the search query is an empty string,
                // return an empty array
                if ( query === '' )
                {
                    return [200, {results: []}];
                }

                /*Commented on 2026-mar.-09 by spineda - Begin*/
                const flatNavigation = cloneDeep(this._navigationService.flatNavigationSnapshot);
                /*Commented on 2026-mar.-09 by spineda - End*/

                // Filter the contacts
                const contactsResults = cloneDeep(this._contacts)
                    .filter(contact => contact.name.toLowerCase().includes(query));

                // Filter the navigation
                const pagesResults = cloneDeep(flatNavigation)
                    .filter(page => (page.title?.toLowerCase().includes(query) || (page.subtitle && page.subtitle.includes(query))));

                // Filter the tasks
                const tasksResults = cloneDeep(this._tasks)
                    .filter(task => task.title.toLowerCase().includes(query));

                // Prepare the results array
                const results = [];

                // If there are contacts results...
                if ( contactsResults.length > 0 )
                {
                    // Normalize the results
                    contactsResults.forEach((result) => {

                        // Add a link
                        result.link = '/apps/contacts/' + result.id;

                        // Add the name as the value
                        result.value = result.name;
                    });

                    // Add to the results
                    results.push({
                        id     : 'contacts',
                        label  : 'Contacts',
                        results: contactsResults
                    });
                }

                // If there are page results...
                if ( pagesResults.length > 0 )
                {
                    // Normalize the results
                    pagesResults.forEach((result: any) => {

                        // Add the page title as the value
                        result.value = result.title;
                    });

                    // Add to the results
                    results.push({
                        id     : 'pages',
                        label  : 'Pages',
                        results: pagesResults
                    });
                }

                // If there are tasks results...
                if ( tasksResults.length > 0 )
                {
                    // Normalize the results
                    tasksResults.forEach((result) => {

                        // Add a link
                        result.link = '/apps/tasks/' + result.id;

                        // Add the title as the value
                        result.value = result.title;
                    });

                    // Add to the results
                    results.push({
                        id     : 'tasks',
                        label  : 'Tasks',
                        results: tasksResults
                    });
                }

                // Return the response
                return [200, results];
            });
    }
}
