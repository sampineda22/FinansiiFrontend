import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { PaymentDate } from 'app/interfaces/accounting/paymentDate';
import { AccountingConfigurationService } from '../accounting-configuration.service';
import { SharedService } from 'app/shared/shared.service';
import { MatDialog } from '@angular/material/dialog';
import { TranslocoService } from '@ngneat/transloco';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { FiscalYear } from 'app/interfaces/credits/fiscalYear';
import { ReceiptBreakdownService } from 'app/modules/credits/receipt-breakdown/receipt-breakdown.service';
import { Months } from 'app/enum/months';

@Component({
    selector: 'app-payment-dates',
    templateUrl: './payment-dates.component.html',
    styleUrls: ['./payment-dates.component.scss']
})
export class PaymentDatesComponent implements OnInit, AfterViewInit {
    paymentDates: PaymentDate[] = [];
    fiscalYears: FiscalYear[] = [];
    paymentDatesForm: FormGroup;
    dataSource = new MatTableDataSource<PaymentDate>(this.paymentDates);
    displayedColumns: string[] = ['number', 'month', 'startDate', 'endDate', 'actions', 'eraseFilters'];
    itemsPerPage: number = 10;
    pageSize: number[] = [];
    months = Object.keys(Months)
        .filter(key => isNaN(Number(key)))
        .map(key => ({
            label: key,
            value: Months[key as keyof typeof Months]
        }));

    filteredMonthValues: number[] = [];
    monthUniqueValues: number[] = [];
    filteredStartValues: number[] = [];
    startUniqueValues: number[] = [];
    filteredEndValues: number[] = [];
    endUniqueValues: number[] = [];

    selectedFilters = {
        month: new Set<number>(),
        startDate: new Set<number>(),
        endDate: new Set<number>(),
    };

    @ViewChild(MatPaginator) paginator: MatPaginator;

    constructor(private _accountingService: AccountingConfigurationService
        , private _receiptBreakdownService: ReceiptBreakdownService
        , private _sharedService: SharedService
        , public dialog: MatDialog
        , private _translocoService: TranslocoService
        , private _formBuilder: FormBuilder) {
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
    }

    ngOnInit(): void {
        this._translocoService.langChanges$.subscribe(() => {
            this.getPaymentDates();
            this.getFiscalYears();
        });
    }

    getPaymentDates(): void {
        this._accountingService.getPaymentDates$(this._sharedService.getCompanyCode()).subscribe(
            (data) => {
                if (data.data.length === 0) {
                    Swal.fire('', 'No se encontrarón fechas de pago configurados.', 'info');
                    return;
                }
                this.paymentDates = data.data;
                this.dataSource.data = this.paymentDates;
                this.setUniqueValues();

                this.pageSize = this._sharedService.setPageSize(this.paymentDates.length);
                this.itemsPerPage = this.pageSize[0];
                this.paginator.pageSize = this.itemsPerPage;
                this.paginator._changePageSize(this.itemsPerPage);
            }, (error) => {
                Swal.fire('Error', error.error.mensaje, 'error');
            })
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

    openCreateDate(newDateDialog): void {
        const todaysDate = new Date();
        var year: number = this.fiscalYears.find(x => x.year == todaysDate.getFullYear()).year;

        this.paymentDatesForm = this._formBuilder.group({
            year: new FormControl({ value: year, disabled: false }, Validators.required),
            month: new FormControl({ value: '', disabled: false }, Validators.required),
            startDate: new FormControl({ value: '', disabled: false }, Validators.required),
            endDate: new FormControl({ value: '', disabled: false }, Validators.required)
        });

        const dialogRef = this.dialog.open(newDateDialog, {
            width: '700px'
        });
    }

    postDate(): void {
        var date: PaymentDate = {
            ...this.paymentDatesForm.value
            , companyCode: this._sharedService.getCompanyCode()
        };

        this._accountingService.postPaymentDate$(date).subscribe(
            (data) => {
                Swal.fire("Fecha Agregada", `Se generó la fecha de pago exitosamente`, "success");
                this.getPaymentDates();
                this.dialog.closeAll();
            },
            (error) => {
                console.log(error);
                Swal.fire('Error', error.error.mensaje, 'error');
            })
    }

    async deleteDate(paymentDate: PaymentDate): Promise<void> {
        const response: boolean = await this._sharedService.verificationSwal("¿Está seguro que desea eliminar la fecha de pago?");

        if (response) {
            this._accountingService.deletePaymentDate$(paymentDate).subscribe(
                (data) => {
                    Swal.fire("Fecha Eliminada", "Se eliminó la fecha exitosamente", "success");
                    this.getPaymentDates();
                    this.dialog.closeAll();
                },
                (error) => {
                    console.log(error);
                    Swal.fire('Error', error.error.mensaje, 'error');
                })
        }
    }

    //#region FILTER METHODS
    setUniqueValues(): void {
        this.monthUniqueValues = Array.from(new Set(this.paymentDates.map(item => item.month)));
        this.filteredMonthValues = [...this.monthUniqueValues];
        this.startUniqueValues = Array.from(new Set(this.paymentDates.map(item => item.startDate)));
        this.filteredStartValues = [...this.startUniqueValues];
        this.endUniqueValues = Array.from(new Set(this.paymentDates.map(item => item.endDate)));
        this.filteredEndValues = [...this.endUniqueValues];
    }

    clearColumnFilter(column: string): void {
        this.selectedFilters[column].clear();
        this.applyFilters();
    }

    applyFilters(): void {
        let filteredData = this.paymentDates;

        this.displayedColumns.forEach(property => {
            if (this.selectedFilters[property]?.size > 0) {
                filteredData = filteredData.filter(item => this.selectedFilters[property].has(item[property]));
            }
        });
        this.dataSource.data = filteredData;
    }

    resetFilters(): void {
        this.dataSource.data = this.paymentDates;
        this.displayedColumns.forEach(property => {
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

    filterMonthValues(searchText: string): void {
        this.filteredMonthValues = this.monthUniqueValues.filter(value =>
            value.toString().includes(searchText)
        );
    }

    filterStartValues(searchText: string): void {
        this.filteredStartValues = this.startUniqueValues.filter(value =>
            value.toString().includes(searchText)
        );
    }

    filterEndValues(searchText: string): void {
        this.filteredEndValues = this.endUniqueValues.filter(value =>
            value.toString().includes(searchText)
        );
    }
    //#endregion
}