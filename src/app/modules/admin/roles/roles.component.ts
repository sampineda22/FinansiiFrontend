import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { RolesService } from './roles.service';
import { Role } from 'app/interfaces/admin/role';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { SharedService } from 'app/shared/shared.service';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements AfterViewInit {

  roles: Role[] = [];
  dataSource = new MatTableDataSource<Role>(this.roles);
  roleForm: FormGroup;
  buttonText: string = '';
  displayedColumns: string[] = ['number', 'description', 'creationDate', 'creationUser','actions'];
  itemsPerPage: number = 10;
  pageSize: number[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private _rolesService: RolesService
             ,public dialog: MatDialog
             ,private _formBuilder: FormBuilder
             ,private _sharedService: SharedService) {
    this.getAllRoles();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  getAllRoles(): void {
    this._rolesService.getAllRoles$().subscribe(data => {
      if (data.length <= 0) {
        console.log('No hay roles');
      } else {
        this.roles = data
        this.dataSource.data = data;
        this.pageSize = this._sharedService.setPageSize(data.length);
        this.itemsPerPage = this.pageSize[0];
      }
    })
  }

  async postRole() {
    const response: boolean = await this._sharedService.verificationSwal('¿Está seguro que desea crear el rol?');

    if (response) {
      const role: Role = this.roleForm.value;
      this._rolesService.postRole$(role).subscribe(data => {
          Swal.fire("", "Se creó el rol exitosamente", "success");
          this.getAllRoles();
        },
        error => {
          this.dialog.closeAll();
          const errorString: string = error.error as string;
          console.log(error.error);
          Swal.fire('Error', error.error.mensaje, 'error');
        }
      );
    }
  }

  async deleteRole(roleId: number){
    const response: boolean = await this._sharedService.verificationSwal("¿Está seguro que desea elminar el rol?");

    if(response){
      this._rolesService.deleteRole$(roleId).subscribe(data => {
        Swal.fire("", "Se eliminó el rol exitosamente", "success");
        this.getAllRoles();
      },
      error => {
        this.dialog.closeAll();
        const errorString: string = error.error as string;
        console.log(error.error);
        Swal.fire('Error', error.error.mensaje, 'error');
      }
    );
    }
  }

  openAddRoleDialog(roleTemplate): void {
    this.buttonText = 'Guardar';
    this.createRoleForm();

    const dialogRef = this.dialog.open(roleTemplate, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }


  createRoleForm(role: Role = null){
    this.roleForm = this._formBuilder.group({
      description: new FormControl({ value: role == null? '' : role.description, disabled: false }, Validators.required)
    });
  }

  onSubmit() {
    // TODO: Use EventEmitter with form value
    console.warn(this.roleForm.value);
  }
}