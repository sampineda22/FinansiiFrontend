import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslocoService } from '@ngneat/transloco';
import { ExpenseDetailsDto } from 'app/interfaces/gira/expenseDetailsDto';
import { SharedService } from 'app/shared/shared.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { SalesAgent } from 'app/interfaces/credits/salesAgent';
import { ReceiptBreakdownService } from 'app/modules/credits/receipt-breakdown/receipt-breakdown.service';
import { HistoricalService } from './historical.service';
import { ExpensesSettingsService } from '../expenses-settings/expenses-settings.service';
import { CurrencyByCompanyPipe } from '@fuse/pipes/currency-by-company.pipe';

import * as _moment from 'moment';
import { default as _rollupMoment } from 'moment';
import 'moment/locale/es';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { combineLatest, distinctUntilChanged, filter, map, startWith } from 'rxjs';
import { LoadingService } from '@fuse/components/loading/loading.service';
import { ExpenseType } from 'app/interfaces/gira/expenseType';
import { DatePipe, registerLocaleData } from '@angular/common';
import localeEsHN from '@angular/common/locales/es-HN';

registerLocaleData(localeEsHN);
const moment = _rollupMoment || _moment;
moment.locale('es');

@Component({
  selector: 'app-historical',
  templateUrl: './historical.component.html',
  styleUrl: './historical.component.scss'
})
export class HistoricalComponent implements AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();

  details: ExpenseDetailsDto[] = [];
  salesAgents: SalesAgent[] = [];
  searchSalesAgents: SalesAgent[] = [];
  expenseTypes: ExpenseType[] = [];
  searchExpenseTypes: ExpenseType[] = [];
  expenseDetailOpen: ExpenseDetailsDto | null = null;
  dataSource = new MatTableDataSource<ExpenseDetailsDto>(this.details);
  displayedColumns: string[] = [];
  selectedRequester: string = '';
  body: string = '';
  title: string = '';
  subTitle: string = '';
  iconName: string = '';
  serieNum: string = '';
  fuel: string = '';
  previewImageUrl: string = '';
  exemptColumnName: string = '';
  companyCode: string = this._sharedService.getCompanyCode();
  selectedStartDate: Date | string;
  selectedEndDate: Date | string;
  selectedExpenseType: number = 0;
  itemsPerPage: number = 10;
  pageSize: number[] = [];
  salesAgentFilterCtrl = new FormControl('');
  expenseFilterCtrl = new FormControl('');
  displayImageDialog: boolean = false;
  isRejected: boolean = false;
  disabledExcelButton: boolean = false;
  showNames: boolean = true;
  filtersForm: FormGroup;
  detailForm: FormGroup;
  today = new Date();
  twoWeeksAgo = new Date(this.today);

  pipe = new DatePipe('es-HN');

  private resettingEndDate = false;
  private lastStartTimestamp: number | null = null;

  //#region Filter
  expenseTypeUniqueValues: string[] = [];
  filteredExpenseTypeValues: string[] = [];
  expenseCategoryUniqueValues: string[] = [];
  filteredExpenseCategoryValues: string[] = [];
  seriesNumUniqueValues: string[] = [];
  filteredSeriesNumValues: string[] = [];
  invoiceIdUniqueValues: string[] = [];
  filteredInvoiceIdValues: string[] = [];
  descriptionUniqueValues: string[] = [];
  filteredDescriptionValues: string[] = [];
  gravadoUniqueValues: number[] = [];
  filteredGravadoValues: number[] = [];
  exemptUniqueValues: number[] = [];
  filteredExemptValues: number[] = [];
  invoiceAmountUniqueValues: number[] = [];
  filteredInvoiceAmountValues: number[] = [];
  statusUniqueValues: string[] = [];
  filteredStatusValues: string[] = [];
  nameUniqueValues: string[] = [];
  filteredNameValues: string[] = [];

  selectedFilters = {
    expenseTypeName: new Set<string>(),
    expenseCategoryName: new Set<string>(),
    seriesNum: new Set<string>(),
    invoiceId: new Set<string>(),
    description: new Set<string>(),
    gravadoAmount: new Set<number>(),
    exemptAmount: new Set<number>(),
    invoiceAmount: new Set<number>(),
    status: new Set<string>(),
    name: new Set<string>()
  };
  //#endregion

  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;

  constructor(private _translocoService: TranslocoService
    , private _sharedService: SharedService
    , private _historicalService: HistoricalService
    , private _formBuilder: FormBuilder
    , public dialog: MatDialog
    , private _receiptBreakdownService: ReceiptBreakdownService
    , private loadingService: LoadingService
    , private _expensesSettingsService: ExpensesSettingsService
    , private currencyByCompanyPipe: CurrencyByCompanyPipe
  ) {
    this.salesAgentFilterCtrl.valueChanges.subscribe(search => {
      const value = (search || '').toLowerCase();

      this.searchSalesAgents = this.salesAgents.filter(x =>
        (x.personalCode || '').toLowerCase().includes(value) ||
        (x.name || '').toLowerCase().includes(value)
      );
    });

    this.expenseFilterCtrl.valueChanges.subscribe(search => {
      const value = (search || '').toLowerCase();

      this.searchExpenseTypes = this.expenseTypes.filter(x =>
        (x.name || '').toLowerCase().includes(value)
      );
    });

    this.twoWeeksAgo.setDate(this.twoWeeksAgo.getDate() - 14);

    this.detailForm = this._formBuilder.group({
      invoiceId: new FormControl({ value: '', disabled: true }),
      invoiceDate: new FormControl({ value: '', disabled: true }),
      seriesNum: new FormControl({ value: '', disabled: true }),
      gravadoAmount: new FormControl({ value: '', disabled: true }),
      exemptAmount: new FormControl({ value: '', disabled: true }),
      invoiceAmount: new FormControl({ value: '', disabled: true }),
      vendAccount: new FormControl({ value: '', disabled: true }),
      fuelType: new FormControl({ value: '', disabled: true }),
      name: new FormControl({ value: '', disabled: true }),
      description: new FormControl({ value: '', disabled: true }),
      creationDate: new FormControl({ value: '', disabled: true }),
      rejectionMotive: new FormControl({ value: '', disabled: true }),
    });
  }

  ngOnDestroy(): void {
    if (this.previewImageUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(this.previewImageUrl);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  ngOnInit() {
    this._translocoService.langChanges$.subscribe(() => {
      this.displayedColumns = this._historicalService.showColumns(true);
      this.displayedColumns = this.displayedColumns.filter(col => col !== 'journalNum');
      this.companyCode = this._sharedService.getCompanyCode();

      if (this.companyCode === 'IMGT') {
        this.exemptColumnName = 'Cantidad/Exento';
      } else {
        this.exemptColumnName = 'Importe Exento';
      }

      this.details = [];
      this.getSalesAgents();
      this.getExpensesTypes();

      this.filtersForm = this._formBuilder.group({
        dates: this._formBuilder.group({
          start: new FormControl({ value: (this.twoWeeksAgo), disabled: false }, Validators.required),
          end: new FormControl({ value: this.today, disabled: false }, Validators.required),
        }),
        salesAgent: new FormControl({ value: '', disabled: false }, Validators.required),
        expenseType: new FormControl({
          value: '', disabled: false
        }, Validators.required)
      });

      const startCtrl = this.filtersForm.get('dates.start');
      const endCtrl = this.filtersForm.get('dates.end');
      const requesterCtrl = this.filtersForm.get('salesAgent');
      const expenseTypeCtrl = this.filtersForm.get('expenseType');

      if (!startCtrl || !endCtrl || !requesterCtrl || !expenseTypeCtrl) {
        return;
      }

      // 1) Detect when startDate changes and clear endDate
      startCtrl.valueChanges
        .pipe(
          takeUntil(this.destroy$),
          map(value => this.getDateTimestamp(value)),
          distinctUntilChanged()
        )
        .subscribe(currentStartTs => {
          // ignore first load
          if (this.lastStartTimestamp === null) {
            this.lastStartTimestamp = currentStartTs;
            return;
          }

          // if start date changed, clear end date
          if (currentStartTs !== this.lastStartTimestamp) {
            this.resettingEndDate = true;

            // Let Angular Material finish its internal update first
            setTimeout(() => {
              endCtrl.reset(null, { emitEvent: true });
              this.resettingEndDate = false;
            });

            this.lastStartTimestamp = currentStartTs;
          }
        });

      // 2) Call getHistorical only when all 3 values are filled
      combineLatest([
        startCtrl.valueChanges.pipe(startWith(startCtrl.value)),
        endCtrl.valueChanges.pipe(startWith(endCtrl.value)),
        requesterCtrl.valueChanges.pipe(startWith(requesterCtrl.value)),
        expenseTypeCtrl.valueChanges.pipe(startWith(expenseTypeCtrl.value))
      ])
        .pipe(
          takeUntil(this.destroy$),
          filter(() => !this.resettingEndDate),
          map(([startDate, endDate, salesAgent, expenseType]) => ({
            startDate: this.toNativeDate(startDate),
            endDate: this.toNativeDate(endDate),
            salesAgent: salesAgent as string | null,
            expenseType: expenseType as string | null
          })),
          filter(({ startDate, endDate, salesAgent, expenseType }) => !!startDate && !!endDate && !!salesAgent && !!expenseType),
          distinctUntilChanged((prev, curr) =>
            prev.salesAgent === curr.salesAgent &&
            prev.startDate!.getTime() === curr.startDate!.getTime() &&
            prev.endDate!.getTime() === curr.endDate!.getTime() &&
            prev.expenseType === curr.expenseType
          )
        )
        .subscribe(({ startDate, endDate, salesAgent, expenseType }) => {
          this.selectedRequester = salesAgent!;
          this.selectedStartDate = startDate!.toISOString();
          this.selectedEndDate = endDate!.toISOString();
          this.selectedExpenseType = +expenseType!;

          this.disabledExcelButton = (this.selectedExpenseType === 100 || this.selectedRequester === 'x');
          this.getHistorical();
          this.displayedColumns = this._historicalService.showColumns(this.selectedRequester === 'x');
          this.displayedColumns = this.displayedColumns.filter(col => col !== 'journalNum');

        });
    });
  }

  getSalesAgents(): void {
    var allAgents: SalesAgent = {
      personalCode: "x",
      name: "Todos",
      agentCompanyCode: this.companyCode
    };
    this._receiptBreakdownService.getSalesAgents$(this.companyCode).subscribe(
      (data) => {
        if (data.data.length <= 0) {
          Swal.fire("", "No se encontraron asesores de ventas", "info");
          this.salesAgents = [];
          this.searchSalesAgents = [];
          this.fillDatasource();
        } else {
          this.salesAgents = data.data;
          this.searchSalesAgents = data.data;

          this.salesAgents.unshift(allAgents);
          this.filtersForm.get("salesAgent")?.setValue('x');
        }
      }, (error) => {
        Swal.fire('Error', error.error.mensaje, 'error');
      })
  }

  getExpensesTypes(): void {
    var allExpenseTypes: ExpenseType = {
      id: 100,
      name: "Todos",
      companyCode: this.companyCode
    };
    this._expensesSettingsService.getExpensesTypes$(this.companyCode).subscribe(
      data => {
        if (data.data.length <= 0) {
          Swal.fire("", "No se encontraron tipos de gastos", "info");
          this.expenseTypes = [];
          this.searchExpenseTypes = [];
          this.fillDatasource();
        } else {
          this.expenseTypes = data.data;
          this.searchExpenseTypes = data.data;

          this.expenseTypes.unshift(allExpenseTypes);
          const travelTypeId: number = this.expenseTypes.find(et => et.name.toLowerCase().replace(/\s+/g, "") === 'GastodeViaje'.toLowerCase())?.id ?? 100;

          this.filtersForm.get("expenseType")?.setValue(travelTypeId);
        }
      })
  }

  getHistorical(): void {
    this.body = 'Obteniendo gastos...';
    this.loadingService.show();

    this._historicalService.getDetails$(this.companyCode, this.selectedExpenseType == 100 ? 0 : this.selectedExpenseType, this.selectedStartDate, this.selectedEndDate, this.selectedRequester == 'x' ? "" : this.selectedRequester).subscribe(
      (data) => {
        this.loadingService.hide();
        if (data.data.length <= 0) {
          Swal.fire("", "No se encontraron detalles de gastos del asesor", "info");
          this.details = [];
        } else {
          this.details = data.data;
        }
        this.fillDatasource();
      },
      (error) => {
        this.loadingService.hide();
        Swal.fire('Error', error.error.mensaje, 'error');
      })
  }

  downloadExcel(): void {
    this._historicalService.downloadExcel$(this.companyCode, this.selectedRequester, this.selectedExpenseType, this.selectedStartDate, this.selectedEndDate).subscribe({
      next: (response) => {
        const blob = response.body;
        if (!blob) return;

        const contentDisposition = response.headers.get('content-disposition');
        const fileName = this.getFileNameFromHeader(contentDisposition);

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: async (err) => {
        console.error('Download error', err);
        let message = 'An error occurred while downloading the file';

        try {
          if (err?.error instanceof Blob) {
            const text = await err.error.text();
            const errorObj = JSON.parse(text);
            message = errorObj?.mensaje || message;
          } else if (err?.error?.mensaje) {
            message = err.error.mensaje;
          } else if (err?.message) {
            message = err.message;
          }
        } catch {
          message = err?.message || message;
        }

        Swal.fire('Error', message, 'error');
      }
    });
  }

  downloadImage(): void {
    this._historicalService
      .getImage$(this.expenseDetailOpen.id, this.companyCode)
      .subscribe({
        next: (blob) => {
          const objectUrl = URL.createObjectURL(blob);

          const agentName =
            this.searchSalesAgents.find(x => x.personalCode == this.selectedRequester)?.name || 'imagen';

          const fileName =
            `${this.expenseDetailOpen.expenseTypeName} - ` +
            `${this.expenseDetailOpen.expenseCategoryName} - ` +
            `${agentName}.jpg`;

          const link = document.createElement('a');
          link.href = objectUrl;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          URL.revokeObjectURL(objectUrl);
        },
        error: (error) => {
          console.error(error);
          Swal.fire('Error', 'No se pudo descargar la imagen.', 'error');
        }
      });
  }

  private getFileNameFromHeader(contentDisposition: string | null): string {
    if (!contentDisposition) return 'HistoricalReport.xlsx';

    const match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (match && match[1]) {
      return decodeURIComponent(match[1].trim());
    }

    return 'Reporte de Gastos de Viaje.xlsx';
  }

  fillDatasource(): void {
    this.dataSource.data = this.details;
    this.setUniqueValues()

    this.pageSize = this._sharedService.setPageSize(this.details.length);
    this.itemsPerPage = this.pageSize[0];
    if (this.paginator) {
      this.paginator.pageSize = this.itemsPerPage;
      this.paginator._changePageSize(this.itemsPerPage);
    }
  }

  openImagePreview(element: ExpenseDetailsDto): void {
    this.displayImageDialog = true;
    this.expenseDetailOpen = element;
    this.title = element.expenseTypeName;
    this.subTitle = element.expenseCategoryName;
    this.iconName = element.icon;
    this.isRejected = element.statusId === 3;
    this.serieNum = element.seriesNum;
    this.fuel = element.fuelTypeName || '';
    this.previewImageUrl = '';

    this.loadingService.show();

    this.detailForm.patchValue({
      invoiceId: element.invoiceId,
      invoiceDate: this.pipe.transform(element.invoiceDate, 'dd/MMM/yyyy'),
      seriesNum: element.seriesNum,
      gravadoAmount: this.currencyByCompanyPipe.transform(element.gravadoAmount),
      exemptAmount: this.currencyByCompanyPipe.transform(element.exemptAmount),
      invoiceAmount: this.currencyByCompanyPipe.transform(element.invoiceAmount),
      vendAccount: element.vendAccount,
      fuelType: element.fuelTypeName,
      name: element.personalCode + " - " + element.name,
      description: element.description,
      creationDate: this.pipe.transform(element.creationDate, 'dd/MMM/yyyy'),
      rejectionMotive: element.rejectionMotive == '' || element.rejectionMotive == null ? 'Sin motivo.' : element.rejectionMotive,
    });

    this._historicalService.getImage$(element.id, this.companyCode).subscribe({
      next: (blob) => {
        if (this.previewImageUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(this.previewImageUrl);
        }

        this.previewImageUrl = URL.createObjectURL(blob);
        this.displayImageDialog = true;
        this.loadingService.hide();
      },
      error: async (error) => {
        this.loadingService.hide();
        console.error(error);

        let backendMessage = 'Ocurrió un error al obtener la imagen.';

        if (error?.error instanceof Blob) {
          try {
            const text = await error.error.text();
            const json = JSON.parse(text);
            backendMessage = json?.message || json?.message || backendMessage;
          } catch {
            // si no viene json válido, usa mensaje genérico
          }
        } else if (typeof error?.error === 'object') {
          backendMessage = error?.error?.mensaje || error?.error?.Mensaje || backendMessage;
        } else if (typeof error?.error === 'string') {
          backendMessage = error.error;
        }

        if (error.status === 404) {
          Swal.fire({
            title: 'Imagen no encontrada',
            text: backendMessage,
            icon: 'warning',
            customClass: {
              container: 'swal-dialog-front'
            }
          });
          return;
        }

        Swal.fire({
          title: 'Error',
          text: backendMessage,
          icon: 'error',
          customClass: {
            container: 'swal-dialog-front'
          }
        });
      }
    });
  }

  private toNativeDate(value: any): Date | null {
    if (!value) {
      return null;
    }

    if (value instanceof Date) {
      return value;
    }

    if (typeof value.toDate === 'function') {
      return value.toDate();
    }

    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  private getDateTimestamp(value: any): number | null {
    const date = this.toNativeDate(value);
    return date ? date.getTime() : null;
  }

  //#region FILTERS
  setUniqueValues(): void {
    this.expenseTypeUniqueValues = Array.from(new Set(this.details.map(item => item.expenseTypeName).filter(name => name !== undefined)));
    this.filteredExpenseTypeValues = [...this.expenseTypeUniqueValues];
    this.expenseCategoryUniqueValues = Array.from(new Set(this.details.map(item => item.expenseCategoryName).filter(name => name !== undefined)));
    this.filteredExpenseCategoryValues = [...this.expenseCategoryUniqueValues];
    this.seriesNumUniqueValues = Array.from(new Set(this.details.map(item => item.seriesNum).filter(value => value !== undefined)));
    this.filteredSeriesNumValues = [...this.seriesNumUniqueValues];
    this.invoiceIdUniqueValues = Array.from(new Set(this.details.map(item => item.invoiceId)));
    this.filteredInvoiceIdValues = [...this.invoiceIdUniqueValues];
    this.descriptionUniqueValues = Array.from(new Set(this.details.map(item => item.description).filter(desc => desc !== undefined)));
    this.filteredDescriptionValues = [...this.descriptionUniqueValues];
    this.gravadoUniqueValues = Array.from(new Set(this.details.map(item => item.gravadoAmount).filter(v => v !== undefined).map(v => v)));
    this.filteredGravadoValues = [...this.gravadoUniqueValues];
    this.exemptUniqueValues = Array.from(new Set(this.details.map(item => item.exemptAmount).filter(v => v !== undefined).map(v => v)));
    this.filteredExemptValues = [...this.exemptUniqueValues];
    this.invoiceAmountUniqueValues = Array.from(new Set(this.details.map(item => item.invoiceAmount).filter(v => v !== undefined).map(v => v)));
    this.filteredInvoiceAmountValues = [...this.invoiceAmountUniqueValues];
    this.statusUniqueValues = Array.from(new Set(this.details.map(item => item.statusName).filter(v => v !== undefined).map(v => v)));
    this.filteredStatusValues = [...this.statusUniqueValues];
    this.nameUniqueValues = Array.from(new Set(this.details.map(item => item.name).filter(name => name !== undefined)));
    this.filteredNameValues = [...this.nameUniqueValues];
  }

  clearColumnFilter(column: string): void {
    this.selectedFilters[column].clear();
    this.applyFilters();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  applyFilters(): void {
    let filteredData = this.details;

    this.displayedColumns.forEach(property => {
      if (this.selectedFilters[property]?.size > 0) {
        filteredData = filteredData.filter(item => this.selectedFilters[property].has(item[property]));
      }
    });
    this.dataSource.data = filteredData;
  }

  resetFilters(): void {
    this.dataSource.data = this.details;
    Object.keys(this.selectedFilters).forEach(property => {
      if (this.selectedFilters[property]?.size > 0) {
        this.selectedFilters[property].clear();
      }
    });
  }

  onFilterChange(column: string, value: string, checked: boolean): void {
    if (checked) {
      this.selectedFilters[column].add(value);
    } else {
      this.selectedFilters[column].delete(value);
    }

    this.applyFilters();
  }

  sortTable(column: keyof ExpenseDetailsDto, direction: 'asc' | 'desc'): void {
    const sortedData = this.dataSource.data.sort((a, b) => {
      let compareA = a[column];
      let compareB = b[column];

      if (compareA == null) compareA = '';
      if (compareB == null) compareB = '';

      if (typeof compareA === 'string') {
        compareA = compareA.toLowerCase();
        compareB = compareB?.toString().toLowerCase();
      }

      if (direction === 'asc') {
        return compareA > compareB ? 1 : compareA < compareB ? -1 : 0;
      } else {
        return compareA < compareB ? 1 : compareA > compareB ? -1 : 0;
      }
    });

    this.dataSource.data = sortedData;
  }
  filterExpenseTypeValues(searchText: string): void {
    this.filteredExpenseTypeValues = this.expenseTypeUniqueValues.filter(value =>
      value.toLowerCase().toString().includes(searchText.toLowerCase())
    );
  }

  filterExpenseCategoryValues(searchText: string): void {
    this.filteredExpenseCategoryValues = this.expenseCategoryUniqueValues.filter(value =>
      value.toLowerCase().toString().includes(searchText.toLowerCase())
    );
  }

  filterSeriesNumValues(searchText: string): void {
    this.filteredSeriesNumValues = this.seriesNumUniqueValues.filter(value =>
      value.toLowerCase().toString().includes(searchText.toLowerCase())
    );
  }

  filterInvoiceIdValues(searchText: string): void {
    this.filteredInvoiceIdValues = this.invoiceIdUniqueValues.filter(value =>
      value.toLowerCase().toString().includes(searchText.toLowerCase())
    );
  }

  filterDescriptionValues(searchText: string): void {
    this.filteredDescriptionValues = this.descriptionUniqueValues.filter(value =>
      value.toLowerCase().toString().includes(searchText.toLowerCase())
    );
  }

  filterGravadoValues(searchText: string): void {
    this.filteredGravadoValues = this.gravadoUniqueValues.filter(value =>
      value.toString().includes(searchText)
    );
  }

  filterExemptValues(searchText: string): void {
    this.filteredExemptValues = this.exemptUniqueValues.filter(value =>
      value.toString().includes(searchText)
    );
  }

  filterInvoiceAmountValues(searchText: string): void {
    this.filteredInvoiceAmountValues = this.invoiceAmountUniqueValues.filter(value =>
      value.toString().includes(searchText)
    );
  }

  filterStatusValues(searchText: string): void {
    this.filteredStatusValues = this.statusUniqueValues.filter(value =>
      value.toString().includes(searchText)
    );
  }

  filterNameValues(searchText: string): void {
    this.filteredNameValues = this.nameUniqueValues.filter(value =>
      value.toLowerCase().toString().includes(searchText.toLowerCase())
    );
  }
  //#endregion
}
