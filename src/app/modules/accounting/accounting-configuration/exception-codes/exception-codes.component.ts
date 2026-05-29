import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ExceptionCode } from 'app/interfaces/accounting/exceptionCodes';
import { AccountingConfigurationService } from '../accounting-configuration.service';
import { SharedService } from 'app/shared/shared.service';
import { MatDialog } from '@angular/material/dialog';
import { TranslocoService } from '@ngneat/transloco';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { TransactionType } from 'app/enum/transactionType';
import { BankConfiguration } from 'app/interfaces/accounting/bankConfiguration';

@Component({
    selector: 'app-exception-codes',
    templateUrl: './exception-codes.component.html',
    styleUrls: ['./exception-codes.component.scss']
})
export class ExceptionCodesComponent implements OnInit, AfterViewInit {
    exceptionCodes: ExceptionCode[] = [];
    banks: BankConfiguration[] = [];
    codeForm: FormGroup;
    dataSource = new MatTableDataSource<ExceptionCode>(this.exceptionCodes);
    displayedColumns: string[] = ['number', 'accountId', 'code', 'transactionType', 'actions', 'eraseFilters'];
    itemsPerPage: number = 10;
    pageSize: number[] = [];
    accountIds: string[] = [];
    transactionTypes = Object.keys(TransactionType)
        .filter(key => isNaN(Number(key)))
        .map(key => ({
            label: key,
            value: TransactionType[key as keyof typeof TransactionType]
        }));

    filteredAccountValues: string[] = [];
    accountUniqueValues: string[] = [];
    filteredCodeValues: string[] = [];
    codeUniqueValues: string[] = [];
    filteredTypeValues: number[] = [];
    typeUniqueValues: number[] = [];

    selectedFilters = {
        accountId: new Set<string>(),
        code: new Set<string>(),
        transactionType: new Set<number>(),
    };

    @ViewChild(MatPaginator) paginator: MatPaginator;

    constructor(private _accountingService: AccountingConfigurationService
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
            this.getExceptionCodes();
            this.getMT940Banks();
        });
    }

    getExceptionCodes(): void {
        this._accountingService.getExceptionCodes$(this._sharedService.getCompanyCode()).subscribe(
            (data) => {
                if (data.data.length === 0) {
                    Swal.fire('', 'No se encontrarón códigos de excepción configurados.', 'info');
                    return;
                }
                this.exceptionCodes = data.data;
                this.dataSource.data = this.exceptionCodes;
                this.setUniqueValues();

                this.pageSize = this._sharedService.setPageSize(this.exceptionCodes.length);
                this.itemsPerPage = this.pageSize[0];
                this.paginator.pageSize = this.itemsPerPage;
                this.paginator._changePageSize(this.itemsPerPage);
            }, (error) => {
                Swal.fire('Error', error.error.mensaje, 'error');
            })
    }

    getMT940Banks(): void {
        this._accountingService.getMT940Banks$(this._sharedService.getCompanyCode()).subscribe(
            (data) => {
                if (data.data.length === 0) {
                    Swal.fire('', 'No se encontrarón los bancos.', 'info');
                    return;
                }
                this.banks = data.data;

                this.accountIds = [
                    ...new Set(
                        this.banks
                            .map(x => x.accountId)
                            .filter((x): x is string => !!x)
                    )
                ];

            }, (error) => {
                Swal.fire('Error', error.error.mensaje, 'error');
            })
    }

    openCreateCode(newCodeDialog): void {
        this.codeForm = this._formBuilder.group({
            accountId: new FormControl({ value: '', disabled: false }, Validators.required),
            code: new FormControl({ value: '', disabled: false }, Validators.required),
            transactionType: new FormControl({ value: '', disabled: false }, Validators.required),
        });

        const dialogRef = this.dialog.open(newCodeDialog, {
            width: '700px'
        });
    }

    postCode(): void {
        var date: ExceptionCode = {
            ...this.codeForm.value
            , companyCode: this._sharedService.getCompanyCode()
        };

        this._accountingService.postExceptionCode$(date).subscribe(
            (data) => {
                Swal.fire("Código Agregado", `Se generó el código de excepción exitosamente`, "success");
                this.getExceptionCodes();
                this.dialog.closeAll();
            },
            (error) => {
                console.log(error);
                Swal.fire('Error', error.error.mensaje, 'error');
            })
    }

    async deleteCode(exceptionCode: ExceptionCode): Promise<void> {
        const response: boolean = await this._sharedService.verificationSwal("¿Está seguro que desea eliminar el código?");

        if (response) {
            this._accountingService.deleteExceptionCode$(exceptionCode).subscribe(
                (data) => {
                    Swal.fire("Código Eliminado", "Se eliminó el código exitosamente", "success");
                    this.getExceptionCodes();
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
        this.accountUniqueValues = Array.from(new Set(this.exceptionCodes.map(item => item.accountId)));
        this.filteredAccountValues = [...this.accountUniqueValues];
        this.codeUniqueValues = Array.from(new Set(this.exceptionCodes.map(item => item.code)));
        this.filteredCodeValues = [...this.codeUniqueValues];
        this.typeUniqueValues = Array.from(new Set(this.exceptionCodes.map(item => item.transactionType)));
        this.filteredTypeValues = [...this.typeUniqueValues];
    }

    clearColumnFilter(column: string): void {
        this.selectedFilters[column].clear();
        this.applyFilters();
    }

    applyFilters(): void {
        let filteredData = this.exceptionCodes;

        this.displayedColumns.forEach(property => {
            if (this.selectedFilters[property]?.size > 0) {
                filteredData = filteredData.filter(item => this.selectedFilters[property].has(item[property]));
            }
        });
        this.dataSource.data = filteredData;
    }

    resetFilters(): void {
        this.dataSource.data = this.exceptionCodes;
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

    filterAccountValues(searchText: string): void {
        this.filteredAccountValues = this.accountUniqueValues.filter(value =>
            value.toString().includes(searchText)
        );
    }

    filterCodeValues(searchText: string): void {
        this.filteredCodeValues = this.codeUniqueValues.filter(value =>
            value.toString().includes(searchText)
        );
    }

    filterTypeValues(searchText: string): void {
        this.filteredTypeValues = this.typeUniqueValues.filter(value =>
            value.toString().includes(searchText)
        );
    }
    //#endregion

}