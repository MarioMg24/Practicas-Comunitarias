import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarComunidadComponent } from './listar-comunidad.component';

describe('ListarComunidadComponent', () => {
  let component: ListarComunidadComponent;
  let fixture: ComponentFixture<ListarComunidadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarComunidadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarComunidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
