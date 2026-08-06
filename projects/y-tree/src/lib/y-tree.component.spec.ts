import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YTreeComponent } from './y-tree.component';

describe('YTreeComponent', () => {
	let component: YTreeComponent;
	let fixture: ComponentFixture<YTreeComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [YTreeComponent]
		}).compileComponents();

		fixture = TestBed.createComponent(YTreeComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
