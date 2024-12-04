import { Component, inject, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ComunidaReconocidaService } from '../services/comunida-reconocida.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import proj4 from 'proj4';

// Definir la proyección para EPSG:32718 (UTM zona 18S)
proj4.defs("EPSG:32718", "+proj=utm +zone=18 +south +datum=WGS84 +units=m +no_defs");

// Solución de íconos para Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

@Component({
  selector: 'app-add-edit-comunidad',
  standalone: true,
  imports: [
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    CommonModule
  ],
  templateUrl: './add-edit-comunidad.component.html',
  styleUrls: ['./add-edit-comunidad.component.css']
})
export default class AddEditComunidadComponent implements OnInit, AfterViewInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private comunidadService = inject(ComunidaReconocidaService);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  form: FormGroup;
  comunidadId: number | null = null;
  private map: L.Map | null = null;
  private marker: L.Marker | null = null;
  private initialLatLng: [number, number] | null = null;

  constructor() {
    this.form = this.fb.group({
      nam_m: ['', [Validators.required]],
      x: ['', [Validators.required]],
      y: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.comunidadId = +id;
      this.comunidadService.getById(+id).subscribe({
        next: (comunidad: any) => {
          // Extraer las coordenadas UTM del MultiPoint
          const utmX = comunidad.geom.coordinates[0][0];
          const utmY = comunidad.geom.coordinates[0][1];

          // Transformar de UTM (EPSG:32718) a LatLng (EPSG:4326) para el mapa
          const [lng, lat] = proj4("EPSG:32718", "EPSG:4326", [utmX, utmY]);

          // Establecer valores UTM en el formulario
          this.form.patchValue({
            nam_m: comunidad.nam_m,
            x: utmX,
            y: utmY
          });

          // Guardar las coordenadas para cuando el mapa se inicialice
          this.initialLatLng = [lat, lng];

          // Si el mapa ya está inicializado, actualizar el marcador
          if (this.marker && this.map) {
            this.marker.setLatLng([lat, lng]);
            this.map.setView([lat, lng], this.map.getZoom());
          }
        },
        error: (error) => {
          this.showErrorSnackBar("Error al cargar la comunidad.");
          console.error("Error al cargar la comunidad:", error);
        }
      });
    }

    // Escuchar cambios en el formulario
    this.form.valueChanges.subscribe(() => {
      this.updateMapFromUTM();
    });
  }

  ngAfterViewInit() {
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        this.initializeMap();
      }, 0);
    }
  }

  initializeMap() {
    // Inicializar con coordenadas por defecto o las guardadas
    const initialCoords = this.initialLatLng || [-0.46645, -76.98719];

    this.map = L.map('map', {
      center: initialCoords,
      zoom: 12
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.marker = L.marker(initialCoords, { draggable: true }).addTo(this.map);

    // Manejar el evento de arrastre del marcador
    this.marker.on('dragend', () => {
      if (this.marker) {
        const latLng = this.marker.getLatLng();
        // Convertir de LatLng a UTM
        const [utmX, utmY] = proj4("EPSG:4326", "EPSG:32718", [latLng.lng, latLng.lat]);

        // Actualizar formulario con coordenadas UTM
        this.form.patchValue({
          x: utmX,
          y: utmY
        }, { emitEvent: false }); // Evitar bucle infinito
      }
    });
  }

  updateMapFromUTM() {
    const utmX = parseFloat(this.form.get('x')?.value);
    const utmY = parseFloat(this.form.get('y')?.value);

    if (!isNaN(utmX) && !isNaN(utmY) && this.marker && this.map) {
      try {
        // Convertir de UTM a LatLng
        const [lng, lat] = proj4("EPSG:32718", "EPSG:4326", [utmX, utmY]);

        this.marker.setLatLng([lat, lng]);
        this.map.setView([lat, lng], this.map.getZoom());
      } catch (error) {
        this.showErrorSnackBar("Error al convertir las coordenadas.");
        console.error("Error al convertir coordenadas:", error);
      }
    }
  }

  createOrUpdate() {
    if (this.form.valid) {
      const { nam_m, x, y } = this.form.value;

      if (isNaN(x) || isNaN(y)) {
        this.showErrorSnackBar("Las coordenadas x o y no son números válidos.");
        return;
      }

      const comunidad = {
        nam_m: nam_m,
        geom: {
          type: "MultiPoint",
          coordinates: [[parseFloat(x), parseFloat(y)]]
        }
      };

      if (this.comunidadId) {
        this.comunidadService.update(this.comunidadId, comunidad).subscribe({
          next: () => {
            this.showSuccessSnackBar("Comunidad actualizada correctamente.");
            this.router.navigate(['/']);
          },
          error: (error) => {
            this.showErrorSnackBar("Error al actualizar la comunidad.");
            console.error("Error en la actualización:", error);
          }
        });
      } else {
        this.comunidadService.create(comunidad).subscribe({
          next: () => {
            this.showSuccessSnackBar("Comunidad creada correctamente.");
            this.router.navigate(['/']);
          },
          error: (error) => {
            this.showErrorSnackBar("Error al crear la comunidad.");
            console.error("Error en la creación:", error);
          }
        });
      }
    }
  }

  private showSuccessSnackBar(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showErrorSnackBar(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  }

  // Método de limpieza al destruir el componente
  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }
}