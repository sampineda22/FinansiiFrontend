import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { LoadingService } from '@fuse/components/loading/loading.service';
import { TranslocoService } from '@ngneat/transloco';
import { CertificateDeposit } from 'app/interfaces/accounting/certificateDeposit';
import { SharedService } from 'app/shared/shared.service';
import { CertificateDepositService } from './certificate-deposit.service';
import Swal from 'sweetalert2';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AXBank } from 'app/interfaces/accounting/axBank';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { WeeklyRecordsDto } from 'app/interfaces/accounting/weeklyRecordsDto';
import { FiscalWeek } from 'app/interfaces/credits/fiscalWeek';
import { ReceiptBreakdownService } from 'app/modules/credits/receipt-breakdown/receipt-breakdown.service';
import { FiscalYear } from 'app/interfaces/credits/fiscalYear';

@Component({
  selector: 'app-certificate-deposit',
  templateUrl: './certificate-deposit.component.html',
  styleUrl: './certificate-deposit.component.scss'
})
export class CertificateDepositComponent implements AfterViewInit {
  newCertificateForm: FormGroup;
  journalForm: FormGroup;
  allCertificatesDeposit: CertificateDeposit[] = [];
  filteredCertificatesDeposit: CertificateDeposit[] = [];
  renovationCDs: CertificateDeposit[] = [];
  selectedCertificate: CertificateDeposit;
  weeklyRecords: WeeklyRecordsDto[] = [];
  allBanks: AXBank[] = [];
  fiscalYears: FiscalYear[] = [];
  fiscalWeeks: FiscalWeek[] = [];
  allcurrencies: string[] = [];
  bankUniqueValues: string[] = [];
  filteredBankValues: string[] = [];
  cdUniqueValues: string[] = [];
  filteredCDValues: string[] = [];
  currencyUniqueValues: string[] = [];
  filteredCurrencyValues: string[] = [];
  body: string = '';
  buttonText: string = '';
  amountUniqueValues: number[] = [];
  filteredAmountValues: number[] = [];
  rateUniqueValues: number[] = [];
  filteredRateValues: number[] = [];
  dailyUniqueValues: number[] = [];
  filteredDailyValues: number[] = [];
  selectedFiscalYear: number | null = null;
  hasRecords: boolean = false;
  /*Commented by spineda on june/03/2025 - Begin*/
  isChecked : boolean = false;
 /*Commented by spineda on june/03/2025 - End*/

  dataSource = new MatTableDataSource<CertificateDeposit>(this.filteredCertificatesDeposit);
  displayedColumns: string[] = ['number', 'bank', 'cdNumber', 'currency', 'startDate', 'endDate', 'amount', 'ratePercentage', 'dailyIncome', 'actions', 'eraseFilters'];
  dataSourceRecords = new MatTableDataSource<WeeklyRecordsDto>(this.weeklyRecords);
  /*Commented by spineda on may/31/2025 - Begin*/
  //displayedColumnsRecords: string[] = ['week', 'datesRange', 'amountInCurrency', 'amount', 'journal'];
  displayedColumnsRecords: string[] = ['week', 'datesRange', 'amountInCurrency', 'journal'];
  /*Commented by spineda on may/31/2025 - End*/
  itemsPerPage: number = 10;
  pageSize: number[] = [];

  selectedFilters = {
    bank: new Set<string>(),
    cdNumber: new Set<string>(),
    currency: new Set<string>(),
    amount: new Set<number>(),
    ratePercentage: new Set<number>(),
    dailyIncome: new Set<number>(),
  };

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private _certificateDepositService: CertificateDepositService
    , private _receiptBreakdownService: ReceiptBreakdownService
    , private _sharedService: SharedService
    , private loadingService: LoadingService
    , public dialog: MatDialog
    , private _translocoService: TranslocoService
    , private _formBuilder: FormBuilder) {
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit() {
    this._translocoService.langChanges$.subscribe(() => {
      this.getAllCertificatesDeposit();
      this.getAllBanks();
      this.getFiscalYears();
    });
  }

  getAllCertificatesDeposit(): void {
    this._certificateDepositService.getAllCertificatesDeposit$(this._sharedService.getCompanyCode()).subscribe(data => {
      if (data.length <= 0) {
        Swal.fire("", "No se encontraron certificados de depósito", "info");
      } else {
        this.allCertificatesDeposit = data.data;
        this.filteredCertificatesDeposit = this.allCertificatesDeposit.filter(x => x.isEnabled == true);
        /*Commented by spineda on june/03/2025 - Begin*/
        this.fillDatasource();
        /*Commented by spineda on june/03/2025 - End*/
      }
    })
  }

  /*Commented by spineda on june/03/2025 - Begin*/
  onCheckboxChange() {
    if (this.isChecked) {
        this.filteredCertificatesDeposit = this.allCertificatesDeposit;
        this.fillDatasource();
    } else {
        this.filteredCertificatesDeposit = this.allCertificatesDeposit.filter(x => x.isEnabled == true);
        this.fillDatasource();
    }
  }

  fillDatasource() : void
  {
    this.dataSource.data = this.filteredCertificatesDeposit;
    this.weeklyRecords = [];
    this.dataSourceRecords.data = [];
    this.setUniqueValues()

    this.pageSize = this._sharedService.setPageSize(this.filteredCertificatesDeposit.length);
    this.itemsPerPage = this.pageSize[0];
    this.paginator.pageSize = this.itemsPerPage;
    this.paginator._changePageSize(this.itemsPerPage);
  }
  /*Commented by spineda on june/03/2025 - End*/

  getWeeklyRecords(id: number, showSwal: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      this._certificateDepositService.getWeeklyRecords$(id).subscribe(data => {
        if (data.data.length <= 0) {
          if (showSwal) {
            Swal.fire("", "No se encontrarón los detalles semanales del certificado", "info");
          }
        } else {
          this.hasRecords = true;
          this.weeklyRecords = data.data;
          this.dataSourceRecords.filter = '';
          this.dataSourceRecords.data = this.weeklyRecords;
        }
        resolve();
      },
        error => {
          reject(error);
        })
    });
  }

  getAllBanks(): void {
    this._certificateDepositService.getAllBanks$(this._sharedService.getCompanyCode()).subscribe(data => {
      if (data.length <= 0) {
        Swal.fire("", "No se encontraron bancos disponibles", "info");
      } else {
        this.allBanks = data.data;
        this.allcurrencies = Array.from(
          new Set(this.allBanks.map(bank => bank.currencyCode))
        );
      }
    })
  }

  openCreateJournal(createTempalte): void {
    const todaysDate = new Date();

    var yearRecId: string = this.fiscalYears.find(x => x.year == todaysDate.getFullYear()).recId;
    this.getFiscalWeeks(yearRecId);

    this.journalForm = this._formBuilder.group({
      year: new FormControl({ value: yearRecId, disabled: false }, Validators.required),
      week: new FormControl({ value: '', disabled: false }, Validators.required)
    });

    const dialogRef = this.dialog.open(createTempalte, {
      width: '700px'
    });
  }

  openDialogWeekly(weeklyTemplate, certificate: CertificateDeposit): void {
    this.hasRecords = false;
    this.weeklyRecords = [];
    this.dataSourceRecords.data = [];
    this.getWeeklyRecords(certificate.id, true);

    const dialogRef = this.dialog.open(weeklyTemplate, {
      width: '900px'
    });
  }

  async openDialog(certificateTemplate, certificate: CertificateDeposit = null): Promise<void> {
    this.hasRecords = false;
    this.buttonText = 'Crear Certificado';
    this.weeklyRecords = [];
    this.dataSourceRecords.data = [];
    this.selectedCertificate = null;

    if (certificate != null) {
      await this.getWeeklyRecords(certificate.id, false);
    }

    this.fillForm(certificate);

    const dialogRef = this.dialog.open(certificateTemplate, {
      width: '900px',
      disableClose: true
    });

    if (certificate != null) {
      this.selectedCertificate = certificate;
      this.renovationCDs = this.allCertificatesDeposit;
      this.buttonText = 'Modificar Certificado';
    }

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  fillForm(certificate: CertificateDeposit): void {
    const disable: boolean = certificate == null ? false : true;
    const isRenovationValue: boolean = certificate == null ? false : certificate.renovationCertificate != null ? true : false;
    const isCapitalizableValue: boolean = certificate == null ? false : certificate.isCapitalizable;
    let disableOtherForms: boolean = this.hasRecords;

    const commentDisable: boolean = certificate == null ? true : disableOtherForms;

    this.newCertificateForm = this._formBuilder.group({
      bank: new FormControl({ value: certificate == null ? '' : certificate.bank, disabled: disable }, Validators.required),
      currencyCode: new FormControl({ value: certificate == null ? '' : certificate.currency, disabled: disable }, Validators.required),
      cdNumber: new FormControl({ value: certificate == null ? '' : certificate.cdNumber, disabled: disableOtherForms }, Validators.required),
      startDate: new FormControl({ value: certificate == null ? '' : certificate.startDate, disabled: disableOtherForms }, Validators.required),
      endDate: new FormControl({ value: certificate == null ? '' : certificate.endDate, disabled: disableOtherForms }, Validators.required),
      amount: new FormControl({ value: certificate == null ? '' : certificate.amount, disabled: disableOtherForms }, Validators.required),
      rate: new FormControl({ value: certificate == null ? '' : certificate.ratePercentage, disabled: disableOtherForms }, Validators.required),
      isRenovation: new FormControl({ value: isRenovationValue, disabled: disable }),
      renovationCertificate: new FormControl({ value: certificate == null ? '' : certificate.renovationCertificate, disabled: true }),
      comment: new FormControl({ value: certificate == null ? '' : certificate.comment, disabled: !isRenovationValue }),
      isCapitalizable: new FormControl({ value: isCapitalizableValue, disabled: disableOtherForms }),
    });
  }

  async postCertificate(): Promise<void> {
    if (this.newCertificateForm.get('isRenovation').value) {
      if (this.newCertificateForm.get('renovationCertificate').value == '') {
        Swal.fire("", "Debe de seleccionar el certificado que se renovará", "error");
        return;
      }
    }

    const response: boolean = await this._sharedService.verificationSwal("¿Está seguro que desea crear el nuevo certificado?");

    if (response) {
      this.body = 'Creando Certificado...';
      this.loadingService.show();

      const todaysDate = new Date();
      const startDate: string | Date = this.newCertificateForm.get('startDate').value;
      const endDate: string | Date = this.newCertificateForm.get('endDate').value;

      const certificate: CertificateDeposit = {
        id: this.selectedCertificate != null ? this.selectedCertificate.id : 0,
        companyCode: this._sharedService.getCompanyCode(),
        bank: this.newCertificateForm.get('bank').value,
        cdNumber: this.newCertificateForm.get('cdNumber').value,
        currency: this.newCertificateForm.get('currencyCode').value,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        amount: this.newCertificateForm.get('amount').value,
        ratePercentage: this.newCertificateForm.get('rate').value,
        dailyIncome: 0,
        isEnabled: true,
        renovationCertificate: this.newCertificateForm.get('renovationCertificate').value == '' ? null : 
                               this.newCertificateForm.get('renovationCertificate').value,
        comment: this.newCertificateForm.get('comment').value,
        isCapitalizable: this.newCertificateForm.get('isCapitalizable').value,
        creationDate: todaysDate.toISOString(),
        creationUser: this._sharedService.getUser()
      }

      this._certificateDepositService.postCertificate$(certificate).subscribe(
        (data) => {
          this.loadingService.hide();
          Swal.fire("Certificado Creado", "Se generó el nuevo certificado exitosamente", "success");
          this.getAllCertificatesDeposit();
          this.closeDialog();
        },
        (error) => {
          this.loadingService.hide();
          console.log(error);
          Swal.fire('Error', error.error.mensaje, 'error');
        })
    }
  }

  async postJournals(): Promise<void> {
    const response: boolean = await this._sharedService.verificationSwal("¿Está seguro que desea crear el nuevo diario?");

    if (response) {
      this.body = 'Creando Diario...';
      this.loadingService.show();

      var selectedYear: string = this.journalForm.get('year').value;
      var selectedWeek: string = this.journalForm.get('week').value;

      console.log(selectedYear + ", " + selectedWeek)

      this._certificateDepositService.postJournal$(this._sharedService.getCompanyCode(), selectedYear, selectedWeek).subscribe(
        (data) => {
          this.loadingService.hide();
          Swal.fire("Diario Creado", `Se generó el diario ${data.data} exitosamente`, "success");
          this.getAllCertificatesDeposit();
          this.closeDialog();
        },
        (error) => {
          this.loadingService.hide();
          console.log(error);
          Swal.fire('Error', error.error.mensaje, 'error');
        })
    }
  }

  async postFinalJournal(certificate: CertificateDeposit): Promise<void> {
    const response: boolean = await this._sharedService.verificationSwal("¿Está seguro que desea finalizar el certificado?");

    if (response) {
      this.body = 'Finalizando Certificado...';
      this.loadingService.show();

      this._certificateDepositService.postFinalJournal$(this._sharedService.getCompanyCode(), certificate.id).subscribe(
        (data) => {
          console.log(data);
          this.loadingService.hide();
          Swal.fire("Certificado Finalizado", data.data, "success");
          this.getAllCertificatesDeposit();
          this.closeDialog();
        },
        (error) => {
          this.loadingService.hide();
          console.log(error);
          Swal.fire('Error', error.error.mensaje, 'error');
        })

    }
  }

  downloadExcel(): void {
    this._certificateDepositService.downloadExcel$(this._sharedService.getCompanyCode()).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Certificados de Depósito.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (error: any) => {
        debugger
        if (error.mensaje) {
          Swal.fire('Error', error.mensaje, 'error');
        } else if (error.error.mensaje) {
          Swal.fire('Error', error.error.mensaje, 'error');
        }else{
          Swal.fire('Error', 'Ocurrió un error', 'error');
        }
      }
    });
  }

  async deleteCertificate(certificate: CertificateDeposit): Promise<void> {
    const response: boolean = await this._sharedService.verificationSwal("¿Está seguro que desea eliminar el certificado?");

    if (response) {
      this.body = 'Eliminando Certificado...';
      this.loadingService.show();

      this._certificateDepositService.deleteCertificate$(certificate.id).subscribe(
        (data) => {
          this.loadingService.hide();
          Swal.fire("Certificado Eliminado", "Se eliminó el certificado exitosamente", "success");
          this.getAllCertificatesDeposit();
          this.closeDialog();
        },
        (error) => {
          this.loadingService.hide();
          console.log(error);
          Swal.fire('Error', error.error.mensaje, 'error');
        })
    }
  }

  getFiscalYears(): void {
    this._receiptBreakdownService.getFiscalYears$().subscribe(
      (data) => {
        if (data.data.length <= 0) {
          Swal.fire("", "No se encontraron años disponibles", "info");
        } else {
          this.fiscalYears = data.data;
        }
      }, (error) => {
        Swal.fire('Error', error.error.mensaje, 'error');
      })
  }

  getFiscalWeeks(recId: string): void {
    this.fiscalWeeks = [];

    this._receiptBreakdownService.getFiscalWeaks$(recId).subscribe(
      (data) => {
        if (data.data.length <= 0) {
          Swal.fire("", "No se encontraron semanas disponibles", "info");
        } else {
          this.fiscalWeeks = data.data;
        }
      }, (error) => {
        Swal.fire('Error', error.error.mensaje, 'error');
      })
  }

  filterRenovationCDs(): void {
    const currency: string = this.newCertificateForm.get('currencyCode').value;
    const bank: string = this.newCertificateForm.get('bank').value;

    if (currency != "" && bank != "") {
      this.renovationCDs = this.filteredCertificatesDeposit.filter(x => x.bank == bank && x.currency == currency);
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceRecords.filter = filterValue.trim().toLowerCase();
  }

  closeDialog() {
    this.dialog.closeAll();
  }

  showOptions(event: MatCheckboxChange): void {
    if (event.checked) {
      this.filterRenovationCDs();
      this.newCertificateForm.controls['renovationCertificate'].enable({});
      this.newCertificateForm.controls['comment'].enable({});
    } else {
      this.renovationCDs = [];
      this.newCertificateForm.setValue({
        comment: '',
      });
      this.newCertificateForm.controls['renovationCertificate'].disable({});
      this.newCertificateForm.controls['comment'].disable({});
    }
  }

  setUniqueValues(): void {
    this.bankUniqueValues = Array.from(new Set(this.filteredCertificatesDeposit.map(item => item.bank)));
    this.filteredBankValues = [...this.bankUniqueValues];
    this.cdUniqueValues = Array.from(new Set(this.filteredCertificatesDeposit.map(item => item.cdNumber)));
    this.filteredCDValues = [...this.cdUniqueValues];
    this.currencyUniqueValues = Array.from(new Set(this.filteredCertificatesDeposit.map(item => item.currency)));
    this.filteredCurrencyValues = [...this.currencyUniqueValues];
    this.amountUniqueValues = Array.from(new Set(this.filteredCertificatesDeposit.map(item => item.amount)));
    this.filteredAmountValues = [...this.amountUniqueValues];
    this.rateUniqueValues = Array.from(new Set(this.filteredCertificatesDeposit.map(item => item.ratePercentage)));
    this.filteredRateValues = [...this.rateUniqueValues];
    this.dailyUniqueValues = Array.from(new Set(this.filteredCertificatesDeposit.map(item => item.dailyIncome)));
    this.filteredDailyValues = [...this.dailyUniqueValues];
  }

  clearColumnFilter(column: string): void {
    this.selectedFilters[column].clear();
    this.applyFilters();
  }

  applyFilters(): void {
    let filteredData = this.filteredCertificatesDeposit;

    this.displayedColumns.forEach(property => {
      if (this.selectedFilters[property]?.size > 0) {
        filteredData = filteredData.filter(item => this.selectedFilters[property].has(item[property]));
      }
    });
    this.dataSource.data = filteredData;
  }

  resetFilters(): void {
    this.dataSource.data = this.filteredCertificatesDeposit;
    this.displayedColumns.forEach(property => {
      if (this.selectedFilters[property]?.size > 0) {
        this.selectedFilters[property].clear();
      }
    });
  }

  filterBankValues(searchText: string): void {
    this.filteredBankValues = this.bankUniqueValues.filter(value =>
      value.toLowerCase().toString().includes(searchText.toLowerCase())
    );
  }

  filterCDValues(searchText: string): void {
    this.filteredCDValues = this.cdUniqueValues.filter(value =>
      value.toLowerCase().toString().includes(searchText.toLowerCase())
    );
  }

  filterCurrencyValues(searchText: string): void {
    this.filteredCurrencyValues = this.currencyUniqueValues.filter(value =>
      value.toLowerCase().toString().includes(searchText.toLowerCase())
    );
  }

  filterAmountValues(searchText: string): void {
    this.filteredAmountValues = this.amountUniqueValues.filter(value =>
      value.toString().includes(searchText)
    );
  }

  filterRateValues(searchText: string): void {
    this.filteredRateValues = this.rateUniqueValues.filter(value =>
      value.toString().includes(searchText)
    );
  }

  filterDailyValues(searchText: string): void {
    this.filteredDailyValues = this.dailyUniqueValues.filter(value =>
      value.toString().includes(searchText)
    );
  }

  onFilterChange(column: string, value: string, checked: boolean): void {
    if (checked) {
      this.selectedFilters[column].add(value);
    } else {
      this.selectedFilters[column].delete(value);
    }

    this.applyFilters();
  }

  sortTable(column: string, direction: 'asc' | 'desc'): void {
    const sortedData = this.dataSource.data.sort((a, b) => {
      let compareA = a[column];
      let compareB = b[column];

      if (typeof compareA === 'string') {
        compareA = compareA.toLowerCase();
        compareB = compareB.toLowerCase();
      }

      if (direction === 'asc') {
        return compareA > compareB ? 1 : compareA < compareB ? -1 : 0;
      } else {
        return compareA < compareB ? 1 : compareA > compareB ? -1 : 0;
      }
    });

    this.dataSource.data = sortedData;
  }
}