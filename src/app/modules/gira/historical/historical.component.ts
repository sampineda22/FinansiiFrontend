import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslocoService } from '@ngneat/transloco';
import { ExpenseDetails } from 'app/interfaces/gira/expenseDetails';
import { SharedService } from 'app/shared/shared.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { SalesAgent } from 'app/interfaces/credits/salesAgent';
import { ReceiptBreakdownService } from 'app/modules/credits/receipt-breakdown/receipt-breakdown.service';
import { HistoricalService } from './historical.service';
import { ExpensesSettingsService } from '../expenses-settings/expenses-settings.service';

import * as _moment from 'moment';
import { default as _rollupMoment } from 'moment';
import 'moment/locale/es';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { combineLatest, distinctUntilChanged, filter, map, startWith } from 'rxjs';
import { LoadingService } from '@fuse/components/loading/loading.service';
import { ExpenseType } from 'app/interfaces/gira/expenseType';

const moment = _rollupMoment || _moment;
moment.locale('es');

@Component({
  selector: 'app-historical',
  templateUrl: './historical.component.html',
  styleUrl: './historical.component.scss'
})
export class HistoricalComponent implements AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();

  details: ExpenseDetails[] = [];
  salesAgents: SalesAgent[] = [];
  searchSalesAgents: SalesAgent[] = [];
  expenseTypes: ExpenseType[] = [];
  searchExpenseTypes: ExpenseType[] = [];
  dataSource = new MatTableDataSource<ExpenseDetails>(this.details);
  displayedColumns: string[] = ['number', 'expenseType', 'expenseCategory', 'seriesNum', 'invoiceId', 'description', 'gravadoAmount',
    'invoiceAmount', 'invoiceDate', 'status', 'actions', 'eraseFilters'];
  selectedAgent: string = '';
  body: string = '';
  selectedStartDate: Date | string;
  selectedEndDate: Date | string;
  selectedExpenseType: number = 0;
  itemsPerPage: number = 10;
  pageSize: number[] = [];
  salesAgentFilterCtrl = new FormControl('');
  expenseFilterCtrl = new FormControl('');
  filtersForm: FormGroup;

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
  invoiceAmountUniqueValues: number[] = [];
  filteredInvoiceAmountValues: number[] = [];
  statusUniqueValues: string[] = [];
  filteredStatusValues: string[] = [];

  selectedFilters: Record<string, Set<string>> = {
    expenseType: new Set<string>(),
    expenseCategory: new Set<string>(),
    seriesNum: new Set<string>(),
    invoiceId: new Set<string>(),
    description: new Set<string>(),
    gravadoAmount: new Set<string>(),
    invoiceAmount: new Set<string>(),
    status: new Set<string>()
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

    this.filtersForm = this._formBuilder.group({
      dates: this._formBuilder.group({
        start: new FormControl({ value: '', disabled: false }, Validators.required),
        end: new FormControl({ value: '', disabled: false }, Validators.required),
      }),
      salesAgent: new FormControl({ value: '', disabled: false }, Validators.required),
      expenseType: new FormControl({ value: '', disabled: false }, Validators.required)
    });
  }

  ngOnDestroy(): void {
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
      this.details = [];
      this.getSalesAgents();
      this.getExpensesTypes();
    });

    const startCtrl = this.filtersForm.get('dates.start');
    const endCtrl = this.filtersForm.get('dates.end');
    const salesAgentCtrl = this.filtersForm.get('salesAgent');
    const expenseTypeCtrl = this.filtersForm.get('expenseType');

    if (!startCtrl || !endCtrl || !salesAgentCtrl || !expenseTypeCtrl) {
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
      salesAgentCtrl.valueChanges.pipe(startWith(salesAgentCtrl.value)),
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
        this.selectedAgent = salesAgent!;
        this.selectedStartDate = startDate!.toISOString();
        this.selectedEndDate = endDate!.toISOString();
        this.selectedExpenseType = +expenseType!;

        this.getHistorical();
      });
  }

  getSalesAgents(): void {
    this._receiptBreakdownService.getSalesAgents$(this._sharedService.getCompanyCode()).subscribe(
      (data) => {
        if (data.data.length <= 0) {
          Swal.fire("", "No se encontraron asesores de ventas", "info");
          this.searchSalesAgents = [];
        } else {
          this.salesAgents = data.data;
          this.searchSalesAgents = data.data;
        }
      }, (error) => {
        Swal.fire('Error', error.error.mensaje, 'error');
      })
  }

  getExpensesTypes(): void {
    this._expensesSettingsService.getExpensesTypes$(this._sharedService.getCompanyCode()).subscribe(
      data => {
        if (data.data.length <= 0) {
          Swal.fire("", "No se encontraron tipos de gastos", "info");
          this.expenseTypes = [];
          this.searchExpenseTypes = [];
        } else {
          this.expenseTypes = data.data;
          this.searchExpenseTypes = data.data;
        }
      })
  }

  getHistorical(): void {
    this.body = 'Obteniendo gastos...';
    this.loadingService.show();

    this._historicalService.getDetails$(this._sharedService.getCompanyCode(), this.selectedAgent, this.selectedExpenseType, this.selectedStartDate, this.selectedEndDate).subscribe(
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
    this._historicalService.downloadExcel$(this._sharedService.getCompanyCode(), this.selectedAgent, this.selectedExpenseType, this.selectedStartDate, this.selectedEndDate).subscribe({
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

  /* FILTER */
  setUniqueValues(): void {
    this.expenseTypeUniqueValues = Array.from(new Set(this.details.map(item => item.expenseCategory?.expenseType?.name).filter(name => name !== undefined)));
    this.filteredExpenseTypeValues = [...this.expenseTypeUniqueValues];
    this.expenseCategoryUniqueValues = Array.from(new Set(this.details.map(item => item.expenseCategory?.name).filter(name => name !== undefined)));
    this.filteredExpenseCategoryValues = [...this.expenseCategoryUniqueValues];
    this.seriesNumUniqueValues = Array.from(new Set(this.details.map(item => item.seriesNum).filter(value => value !== undefined)));
    this.filteredSeriesNumValues = [...this.seriesNumUniqueValues];
    this.invoiceIdUniqueValues = Array.from(new Set(this.details.map(item => item.invoiceId)));
    this.filteredInvoiceIdValues = [...this.invoiceIdUniqueValues];
    this.descriptionUniqueValues = Array.from(new Set(this.details.map(item => item.description).filter(desc => desc !== undefined)));
    this.filteredDescriptionValues = [...this.descriptionUniqueValues];
    this.gravadoUniqueValues = Array.from(new Set(this.details.map(item => item.gravadoAmount).filter(v => v !== undefined).map(v => v)));
    this.filteredGravadoValues = [...this.gravadoUniqueValues];
    this.invoiceAmountUniqueValues = Array.from(new Set(this.details.map(item => item.invoiceAmount).filter(v => v !== undefined).map(v => v)));
    this.filteredInvoiceAmountValues = [...this.invoiceAmountUniqueValues];
    this.statusUniqueValues = Array.from(new Set(this.details.map(item => item.status?.name).filter(v => v !== undefined).map(v => v)));
    this.filteredStatusValues = [...this.statusUniqueValues];
  }

  clearColumnFilter(column: string): void {
    this.selectedFilters[column].clear();
    this.applyFilters();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  private getFilterValue(item: ExpenseDetails, property: string): string | number | undefined {
    switch (property) {
      case 'expenseType':
        return item.expenseCategory?.expenseType?.name;
      case 'expenseCategory':
        return item.expenseCategory?.name;
      case 'status':
        return item.status?.name;
      default:
        return (item as any)[property];
    }
  }

  applyFilters(): void {
    let filteredData = this.details;

    Object.keys(this.selectedFilters).forEach(property => {
      if (this.selectedFilters[property]?.size > 0) {
        filteredData = filteredData.filter(item => {
          const value = this.getFilterValue(item, property);
          return this.selectedFilters[property].has(value?.toString() ?? '');
        });
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

  sortTable(column: keyof ExpenseDetails, direction: 'asc' | 'desc'): void {
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
  /**********************/
}
