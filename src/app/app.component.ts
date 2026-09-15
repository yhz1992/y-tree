import { Component } from '@angular/core';
import { demoGroups } from './demo/registry';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  readonly groups = demoGroups;
  readonly total = demoGroups.reduce(
    (sum, group) => sum + group.demos.length,
    0
  );
}
