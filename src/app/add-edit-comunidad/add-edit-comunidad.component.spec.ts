import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditComunidadComponent } from './add-edit-comunidad.component';

describe('AddEditComunidadComponent', () => {
  let component: AddEditComunidadComponent;
  let fixture: ComponentFixture<AddEditComunidadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditComunidadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditComunidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
