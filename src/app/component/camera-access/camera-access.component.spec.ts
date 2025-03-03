import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CameraAccessComponent } from './camera-access.component';

describe('CameraAccessComponent', () => {
  let component: CameraAccessComponent;
  let fixture: ComponentFixture<CameraAccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CameraAccessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CameraAccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
