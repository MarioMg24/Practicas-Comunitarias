import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComunidaReconocidaService } from '../services/comunida-reconocida.service';
import { Router,RouterModule } from '@angular/router';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PageEvent, MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSort,MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field'; // Importación agregada
import { MatInputModule } from '@angular/material/input'; // Importación agregada

@Component({
  selector: 'app-listar-comunidad',
  standalone: true,
  imports: [CommonModule, RouterModule, 
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule, // Módulo agregado
    MatInputModule ],
  templateUrl: './listar-comunidad.component.html',
  styleUrl: './listar-comunidad.component.css'
})
export default class ListarComunidadComponent implements OnInit {
  private ComunidaReconocidaService = inject(ComunidaReconocidaService);
  private router = inject(Router);  // Inyecta Router aquí

  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ['id', 'nombre', 'coordenadas','acciones' ];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  filterValue: string = '';  // Agregado para el filtro

  ngOnInit(): void {
    this.ComunidaReconocidaService.listarComunidades()
      .subscribe((comunidad: any) =>{
        // Ordenar comunidades por ID de menor a mayor
        comunidad.sort((a: any, b:any) => a.id - b.id);
        // Asignar datos al dataSource y paginador
        this.dataSource.data = comunidad;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });
  }
  ngAfterViewInit() {
    // Configurar paginador y ordenamiento después de que la vista se haya inicializado
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  //filtro
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  editComunidad(id: number) {
    // Redirigir a la página de edición con el ID de la comunidad
    this.router.navigate(['/edit', id]);
  }

  deleteComunidad(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar esta comunidad?')) {
      this.ComunidaReconocidaService.delete(id).subscribe({
        next: () => {
          // Filtrar el elemento eliminado del dataSource
          this.dataSource.data = this.dataSource.data.filter(comunidad => comunidad.id !== id);
        },
        error: (error) => console.error('Error al eliminar la comunidad:', error)
      });
    }
  }
}
