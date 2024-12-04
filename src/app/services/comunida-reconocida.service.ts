import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ComunidaReconocidaService {

  private apiUrl = 'http://localhost:8081/comunidad';
  constructor(private http: HttpClient) {}
  

  //--------LISTAR COMUNIDADES------------
  listarComunidades(){
    return this.http.get('http://localhost:8081/comunidad');
  }

  //--------LISTAR COMUNIDAD por NOMBRE------------
  /*get(nam_m: string) {
    return this.http.get(`${this.apiUrl}/buscar`, { params: { nam_m } });
  }*/

 // Obtener comunidad por ID
  getById(id: number) {
    return this.http.get(`${this.apiUrl}/buscar/${id}`);
  }
 
  //------CREAR COMUNIDAD--------
  create(comunidad: any) {
    return this.http.post(this.apiUrl, comunidad, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  //ACTUALIZAR COMUNIDAD----------
  update(id: number, comunidad: any) {
    return this.http.put(`${this.apiUrl}/${id}`, comunidad);
  }

  //ELIMINAR COMUNIDAD------------
  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
