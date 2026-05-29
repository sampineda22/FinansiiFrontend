import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { LoadingService } from '@fuse/components/loading/loading.service';
import { TranslocoService } from '@ngneat/transloco';
import { Journal } from 'app/interfaces/accounting/journal';
import { JournalLine } from 'app/interfaces/accounting/journalLine';
import { SharedService } from 'app/shared/shared.service';
import { Subject } from 'rxjs';
import { VendPaymentService } from './vend-payment.service';
import Swal from 'sweetalert2';
import { HttpResponse } from '@angular/common/http';

@Component({
    selector: 'app-vend-payment-report',
    templateUrl: './vend-payment-report.component.html',
    styleUrls: ['./vend-payment-report.component.scss']
})
export class VendPaymentReportComponent implements OnInit, OnDestroy {
    journalLines: JournalLine[] = [];
    journals: Journal[] = [];

    dataSource = new MatTableDataSource<JournalLine>(this.journalLines);
    displayedColumns: string[] = ['number', 'voucher', 'name', 'description', 'debit', 'paymentStatus', 'eraseFilters'];
    selectedSalesAgent: string = '';
    selectedAgent: string | null = null;
    title: string = '';
    body: string = '';
    selectedJournal: string = '';
    showOtherJournal: boolean = false;
    itemsPerPage: number = 10;
    pageSize: number[] = [];

    filteredNameValues: string[] = [];
    nameUniqueValues: string[] = [];
    filteredVoucherValues: string[] = [];
    voucherUniqueValues: string[] = [];
    filteredDescriptionValues: string[] = [];
    descriptionUniqueValues: string[] = [];
    filteredDebitValues: number[] = [];
    debitUniqueValues: number[] = [];
    filteredPaymentStatusValues: string[] = [];
    paymentStatusUniqueValues: string[] = [];

    selectedFilters = {
        name: new Set<string>(),
        voucher: new Set<string>(),
        description: new Set<string>(),
        debit: new Set<number>(),
        paymentStatus: new Set<string>()
    };

    @ViewChild(MatPaginator) paginator: MatPaginator;

    protected _onDestroy = new Subject<void>();

    constructor(private _vendPaymentService: VendPaymentService
        , private loadingService: LoadingService
        , private _sharedService: SharedService
        , public dialog: MatDialog
        , private _translocoService: TranslocoService
        , private cdr: ChangeDetectorRef) {
    }

    ngOnInit() {
        this._translocoService.langChanges$.subscribe(() => {
            this.getJournals();
            this.journalLines = [];
            this.dataSource.data = [];
        })
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
    }

    ngOnDestroy() {
        this._onDestroy.next();
        this._onDestroy.complete();
    }

    getJournals(): void {
        this.journals = [];
        this._vendPaymentService.getJournals$(this._sharedService.getCompanyCode()).subscribe(
            (data) => {
                if (data.data.length === 0) {
                    Swal.fire('', 'No se encontraron diarios abiertos.', 'info');
                    return;
                } else {
                    this.journals = data.data;
                }
                var other: Journal = {
                    journalName: "",
                    journalNum: "x",
                    name: "Otro Diario"
                }
                this.journals.unshift(other);
            }, (error) => {
                console.log(error.error.mensaje);
                Swal.fire('Error', error.error.mensaje, 'error');
            })
    }

    getJournalLines(journalNum: string): void {
        this.journalLines = [];
        this.showOtherJournal = journalNum == 'x';
        this.selectedJournal = journalNum;

        if (journalNum != 'x') {
            this._vendPaymentService.getVendPaymentLines$(journalNum, this._sharedService.getCompanyCode()).subscribe(
                (data) => {
                    if (data.data.length === 0) {
                        Swal.fire('', 'No se encontrarón las lineas del diario. Favor verificar que el diario contenga lineas.', 'info');
                        return;
                    }
                    this.journalLines = data.data;
                    this.dataSource.data = this.journalLines;
                    this.setUniqueValues();

                    this.pageSize = this._sharedService.setPageSize(this.journalLines.length);
                    this.itemsPerPage = this.pageSize[0];
                    this.paginator.pageSize = this.itemsPerPage;
                    this.paginator._changePageSize(this.itemsPerPage);
                }, (error) => {
                    console.log(error.error.mensaje);
                    Swal.fire('Error', error.error.mensaje, 'error');
                })
        }
    }

    createReport(): void {
        this.body = 'Generando Reporte...';
        this.loadingService.show();

        const companyCode = this._sharedService.getCompanyCode();
        const offSetLedgerDimension = this.journalLines[0].offSetLedgerDimension;

        this._vendPaymentService
            .createReport$(this.selectedJournal, companyCode, offSetLedgerDimension)
            .subscribe({
                next: (response) => {
                    const blob = response.body;

                    if (!blob) {
                        this.loadingService.hide();
                        Swal.fire('Error', 'No se recibió el archivo PDF.', 'error');
                        return;
                    }

                    const fileName = this.getFileNameFromResponse(response) ?? 'report.pdf';

                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');

                    this.loadingService.hide();

                    const warnings = response.headers.get('X-Report-Warnings');

                    if (warnings) {
                        Swal.fire('', warnings, 'warning');
                    }

                    link.href = url;
                    link.download = fileName;
                    link.click();
                    window.URL.revokeObjectURL(url);
                },
                error: async (error) => {
                    this.loadingService.hide();
                    let message = 'Error al generar el reporte.';

                    if (error.error instanceof Blob) {
                        const text = await error.error.text();

                        try {
                            const json = JSON.parse(text);
                            message = json.mensaje ?? json.message ?? message;
                        } catch {
                            message = text || message;
                        }
                    }

                    Swal.fire('Error', message, 'error');
                }
            });
    }

    private getFileNameFromResponse(response: HttpResponse<Blob>): string | null {
        const contentDisposition = response.headers.get('content-disposition');

        if (!contentDisposition) return null;
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        return match ? match[1] : null;
    }

    readJournalNum(journalNum: string): void {
        if (!journalNum.includes('LD-')) {
            journalNum = 'LD-' + journalNum;
        }
        this.getJournalLines(journalNum);
    }

    //#region FILTER METHODS
    setUniqueValues(): void {
        this.nameUniqueValues = Array.from(new Set(this.journalLines.map(item => item.name)));
        this.filteredNameValues = [...this.nameUniqueValues];
        this.voucherUniqueValues = Array.from(new Set(this.journalLines.map(item => item.voucher)));
        this.filteredVoucherValues = [...this.voucherUniqueValues];
        this.descriptionUniqueValues = Array.from(new Set(this.journalLines.map(item => item.description)));
        this.filteredDescriptionValues = [...this.descriptionUniqueValues];
        this.debitUniqueValues = Array.from(new Set(this.journalLines.map(item => item.debit)));
        this.filteredDebitValues = [...this.debitUniqueValues];
        this.paymentStatusUniqueValues = Array.from(new Set(this.journalLines.map(item => item.paymentStatus)));
        this.filteredPaymentStatusValues = [...this.paymentStatusUniqueValues];
    }

    clearColumnFilter(column: string): void {
        this.selectedFilters[column].clear();
        this.applyFilters();
    }

    applyFilters(): void {
        let filteredData = this.journalLines;

        this.displayedColumns.forEach(property => {
            if (this.selectedFilters[property]?.size > 0) {
                filteredData = filteredData.filter(item => this.selectedFilters[property].has(item[property]));
            }
        });
        this.dataSource.data = filteredData;
    }

    resetFilters(): void {
        this.dataSource.data = this.journalLines;
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

    filterNameValues(searchText: string): void {
        this.filteredNameValues = this.nameUniqueValues.filter(value =>
            value.toLowerCase().toString().includes(searchText.toLowerCase())
        );
    }

    filterDescriptionValues(searchText: string): void {
        this.filteredDescriptionValues = this.descriptionUniqueValues.filter(value =>
            value.toLowerCase().toString().includes(searchText.toLowerCase())
        );
    }

    filterDebitValues(searchText: string): void {
        this.filteredDebitValues = this.debitUniqueValues.filter(value =>
            value.toString().includes(searchText)
        );
    }

    filterPaymentStatusValues(searchText: string): void {
        this.filteredPaymentStatusValues = this.paymentStatusUniqueValues.filter(value =>
            value.toLowerCase().toString().includes(searchText.toLowerCase())
        );
    }

    filterVoucherValues(searchText: string): void {
        this.filteredVoucherValues = this.voucherUniqueValues.filter(value =>
            value.toLowerCase().toString().includes(searchText.toLowerCase())
        );
    }
    //#endregion
}
