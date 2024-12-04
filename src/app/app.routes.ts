import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path:'',
        loadComponent:() => import('./listar-comunidad/listar-comunidad.component')
    },
    {
        path:'new',
        loadComponent:() => import('./add-edit-comunidad/add-edit-comunidad.component')
    },
    {
        path:'edit/:id',
        loadComponent:() => import('./add-edit-comunidad/add-edit-comunidad.component')
    }
];
