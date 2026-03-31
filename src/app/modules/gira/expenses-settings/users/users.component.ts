import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslocoService } from '@ngneat/transloco';
import { User, UserDto } from 'app/interfaces/gira/user';
import { SharedService } from 'app/shared/shared.service';
import { ExpensesSettingsService } from '../expenses-settings.service';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { Employee } from 'app/interfaces/general/employee';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { tap } from 'rxjs';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss']
})
export class UsersComponent implements AfterViewInit {
    allUsers: UserDto[] = [];
    allEmployees: Employee[] = [];
    searchEmployees: Employee[] = [];
    dataSource = new MatTableDataSource<UserDto>(this.allUsers);
    displayedColumns: string[] = ['number', 'personalCode', 'userName', 'name', 'state', 'actions', 'eraseFilters'];
    itemsPerPage: number = 10;
    pageSize: number[] = [];
    editId: number = 0;
    resetPassword: boolean = false;

    userForm: FormGroup;
    buttonText: string = "";

    codeFilterCtrl = new FormControl('');

    //#region Filters
    personalCodeUniqueValues: string[] = [];
    filteredPersonalCodeValues: string[] = [];
    userNameUniqueValues: string[] = [];
    filteredUserNameValues: string[] = [];
    nameUniqueValues: string[] = [];
    filteredNameValues: string[] = [];
    stateUniqueValues: boolean[] = [];
    filteredStateValues: boolean[] = [];

    selectedFilters = {
        personalCode: new Set<string>(),
        userName: new Set<string>(),
        name: new Set<string>(),
        state: new Set<boolean>()
    };
    //#endregion

    @ViewChild(MatPaginator) paginator: MatPaginator;

    constructor(private _translocoService: TranslocoService
        , private _sharedService: SharedService
        , private _expensesSettingsService: ExpensesSettingsService
        , private _formBuilder: FormBuilder
        , public dialog: MatDialog
    ) {
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
    }

    ngOnInit() {
        this._translocoService.langChanges$.subscribe(() => {
            this.getUsers();
            //this.getEmployees();
        });

        this.codeFilterCtrl.valueChanges.subscribe(search => {
            const value = (search || '').toLowerCase();

            this.searchEmployees = this.allEmployees.filter(x =>
                (x.personalCode || '').toLowerCase().includes(value) ||
                (x.name || '').toLowerCase().includes(value)
            );
        });
    }

    getUsers(): void {
        this._expensesSettingsService.getUsers$(this._sharedService.getCompanyCode()).subscribe(
            data => {
                if (data.data.length <= 0) {
                    Swal.fire("", "No se encontraron usuarios", "info");
                    this.allUsers = [];
                } else {
                    this.allUsers = data.data;
                }
                this.fillDatasource();
            })
    }

    getEmployees() {
        return this._expensesSettingsService.getEmployees$(this._sharedService.getCompanyCode()).pipe(
            tap(data => {
                if (data.data.length <= 0) {
                    Swal.fire("", "No se encontraron colaboradores", "info");
                    this.allEmployees = [];
                    this.searchEmployees = [];
                } else {
                    this.allEmployees = data.data;
                    this.searchEmployees = this.allEmployees;
                }
            })
        );
    }

    postStatus(user: User, event: MatSlideToggleChange): void {
        const previousValue = !event.checked;
        user.isActive = event.checked;

        this._expensesSettingsService.postUserState$(user).subscribe(
            (data) => {
                this.getUsers();
            },
            (error) => {
                console.log(error);
                user.isActive = previousValue;
                Swal.fire('Error', error.error.mensaje, 'error');
            })
    }

    postUser(): void {
        if (this.userForm.valid) {
            var newUser: User = {
                id: this.editId,
                companyCode: '',
                isTemporary: true,
                isActive: true,
                ...this.userForm.getRawValue()
            }

            if (this.resetPassword) {
                this.resetUserPassword(newUser.passwordHash);
                return;
            }

            this._expensesSettingsService.postUser$(newUser, this._sharedService.getCompanyCode()).subscribe(
                (data) => {
                    try {
                        Swal.fire(`${data.mensaje} Realizada`, `La ${data.mensaje.toLowerCase()} se realizó exitosamente`, "success");
                        this.getUsers();
                        this._sharedService.closeDialog();
                    } catch (error) {
                        console.log("Error en metodo postUser: " + error);
                        Swal.fire('Error', error.toString(), 'error');
                    }
                },
                (error) => {
                    console.log(error);
                    Swal.fire('Error', error.error.mensaje, 'error');
                })
        }
    }

    resetUserPassword(password: string): void {
        this._expensesSettingsService.resetPassword$(this.editId, password, this._sharedService.getCompanyCode()).subscribe(
            (data) => {
                try {
                    Swal.fire(`Contraseña Temporal Actualizada`, `La contraseña se actualizó exitosamente`, "success");
                    this.getUsers();
                    this._sharedService.closeDialog();
                } catch (error) {
                    console.log("Error en metodo resetUserPassword: " + error);
                    Swal.fire('Error', error.toString(), 'error');
                }
            },
            (error) => {
                console.log(error);
                Swal.fire('Error', error.error.mensaje, 'error');
            })
    }

    openUserDialog(userDialogTemplate, user: User, reset): void {
        this.getEmployees().subscribe({
            next: () => {
                this.editId = 0;
                this.buttonText = "Crear";
                this.resetPassword = reset;

                if (user?.id > 0) {
                    this.buttonText = "Actualizar";
                    this.editId = user.id
                }

                if (reset) {
                    this.buttonText = "Actualizar contraseña";
                }

                this.userForm = this._formBuilder.group({
                    personalCode: new FormControl({ value: user?.personalCode, disabled: this.editId != 0 }, Validators.required),
                    userName: new FormControl({ value: user?.username, disabled: reset }, Validators.required),
                    passwordHash: new FormControl({ value: '', disabled: false }, Validators.required)
                });

                const dialogRef = this.dialog.open(userDialogTemplate, {
                    width: '700px'
                });
            },
            error: err => {
                console.error(err);
                Swal.fire("", "Error al obtener colaboradores", "error");
            }
        });
    }

    fillDatasource(): void {
        this.dataSource.data = this.allUsers;
        this.setUniqueValues()

        this.pageSize = this._sharedService.setPageSize(this.allUsers.length);
        this.itemsPerPage = this.pageSize[0];
        this.paginator.pageSize = this.itemsPerPage;
        this.paginator._changePageSize(this.itemsPerPage);
    }

    //#region Filters
    setUniqueValues(): void {
        this.personalCodeUniqueValues = Array.from(new Set(this.allUsers.map(item => item.personalCode)));
        this.filteredPersonalCodeValues = [...this.personalCodeUniqueValues];
        this.userNameUniqueValues = Array.from(new Set(this.allUsers.map(item => item.username)));
        this.filteredUserNameValues = [...this.nameUniqueValues];
        this.nameUniqueValues = Array.from(new Set(this.allUsers.map(item => item.name)));
        this.filteredNameValues = [...this.nameUniqueValues];
        this.stateUniqueValues = Array.from(new Set(this.allUsers.map(item => item.isActive)));
        this.filteredStateValues = [...this.stateUniqueValues];
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
        let filteredData = this.allUsers;

        this.displayedColumns.forEach(property => {
            if (this.selectedFilters[property]?.size > 0) {
                filteredData = filteredData.filter(item => this.selectedFilters[property].has(item[property]));
            }
        });
        this.dataSource.data = filteredData;
    }

    resetFilters(): void {
        this.dataSource.data = this.allUsers;
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

    filterPersonalCodeValues(searchText: string): void {
        this.filteredPersonalCodeValues = this.personalCodeUniqueValues.filter(value =>
            value.toLowerCase().toString().includes(searchText.toLowerCase())
        );
    }

    filterUserNameValues(searchText: string): void {
        this.filteredUserNameValues = this.userNameUniqueValues.filter(value =>
            value.toLowerCase().toString().includes(searchText.toLowerCase())
        );
    }

    filterStateValues(searchText: string): void {
        this.filteredStateValues = this.stateUniqueValues.filter(value =>
            value.toString().includes(searchText)
        );
    }

    filterNameValues(searchText: string): void {
        this.filteredNameValues = this.nameUniqueValues.filter(value =>
            value.toString().includes(searchText)
        );
    }
    //#endregion
}