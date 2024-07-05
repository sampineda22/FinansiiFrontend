import { Component, OnInit } from '@angular/core';
import { SharedService } from 'app/shared/shared.service';
import { FuseNavigationService, FuseVerticalNavigationComponent } from '@fuse/components/navigation';
import { environment } from 'environments/environment.development';
import { Observable, take } from 'rxjs';
import { AvailableLangs, TranslocoService } from '@ngneat/transloco';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BankTransfersService } from 'app/modules/accounting/bank-transfers/bank-transfers.service';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.scss']
})
export class CompaniesComponent implements OnInit {

  availableLangs: AvailableLangs;
  activeLang: string;
  flagCodes: any;

  constructor(
    private _fuseNavigationService: FuseNavigationService,
    private _translocoService: TranslocoService,
    private _sharedService: SharedService,
    private _authService: AuthService
  ) {
    this.availableLangs = this._translocoService.getAvailableLangs();

    // Set the country iso codes for languages for flags
    this.flagCodes = {
      'IMHN': 'IMHN',
      'IMGT': 'IMGT',
      'IMCR': 'IMCR',
      'IMSL': 'IMSL'
    };
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    // Get the available languages from transloco
    this._translocoService.langChanges$.subscribe((activeLang) => {
      this.activeLang = this._sharedService.getCompanyCode()

      // Update the navigation
      this._updateNavigation(this.activeLang);
    });
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Set the active lang
   *
   * @param lang
   */
  setActiveLang(lang: string): void {
    this._sharedService.setCompanyCode(lang)
    this._translocoService.setActiveLang(lang);
  }

  /**
   * Track by function for ngFor loops
   *
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Update the navigation
   *
   * @param lang
   * @private
   */
  private _updateNavigation(lang: string): void {
    // For the demonstration purposes, we will only update the Dashboard names
    // from the navigation but you can do a full swap and change the entire
    // navigation data.
    //
    // You can import the data from a file or request it from your backend,
    // it's up to you.

    // Get the component -> navigation data -> item
    const navComponent = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>('mainNavigation');

    // Return if the navigation component does not exist
    if (!navComponent) {
      return null;
    }

    // Get the flat navigation data
    const navigation = navComponent.navigation;

    // Get the Project dashboard item and update its title
    const projectDashboardItem = this._fuseNavigationService.getItem('dashboards.project', navigation);
    if (projectDashboardItem) {
      this._translocoService.selectTranslate('Project').pipe(take(1))
        .subscribe((translation) => {

          // Set the title
          projectDashboardItem.title = translation;

          // Refresh the navigation component
          navComponent.refresh();
        });
    }

    // Get the Analytics dashboard item and update its title
    const analyticsDashboardItem = this._fuseNavigationService.getItem('dashboards.analytics', navigation);
    if (analyticsDashboardItem) {
      this._translocoService.selectTranslate('Analytics').pipe(take(1))
        .subscribe((translation) => {

          // Set the title
          analyticsDashboardItem.title = translation;

          // Refresh the navigation component
          navComponent.refresh();
        });
    }
  }

  /*activeCompanyCode: string

  companies: Companies[] = [
    { code: 'IMHN', name: 'Intermoda' },
    { code: 'IMGT', name: 'Modinter' }
  ]

  constructor(private _sharedService: SharedService
    , private _fuseNavigationService: FuseNavigationService
  ) {
    this.getCompanyCode();
  }

  ngOnInit(): void {
    this._updateNavigation(this.activeCompanyCode);
  }

  setCompanyCode(code: string): void {
    this._sharedService.setCompanyCode(code);
  }

  getCompanyCode(): void {
    this._sharedService.getCompanyCode().subscribe(value => this.activeCompanyCode = value);
  }

  private _updateNavigation(lang: string): void {
    const navComponent = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>('mainNavigation');

    if (!navComponent) {
      return null;
    }
  }

  /**
 * Track by function for ngFor loops
 *
 * @param index
 * @param item
 */
  /*trackByFn(index: number, item: any): any {
    return item.id || index;
  }
*/
}