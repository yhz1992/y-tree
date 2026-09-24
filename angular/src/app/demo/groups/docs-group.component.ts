import { Component } from '@angular/core';
import { demoMeta } from '../registry';
import {
  eventRows,
  methodRows,
  nodeInputRows,
  nodeModelRows,
  propsRows,
} from '../api-docs';

@Component({
  selector: 'demo-docs-group',
  template: `
    <demo-card [meta]="m.apiProps">
      <div class="demo-api-wrap">
        <table class="demo-api-table">
          <thead>
            <tr>
              <th>名称</th>
              <th>类型</th>
              <th>默认</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of propsRows">
              <td><code [textContent]="row.name"></code></td>
              <td><code [textContent]="row.type"></code></td>
              <td [textContent]="row.defaultValue || '—'"></td>
              <td [textContent]="row.desc"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </demo-card>

    <demo-card [meta]="m.apiEvents">
      <div class="demo-api-wrap">
        <table class="demo-api-table">
          <thead>
            <tr>
              <th>名称</th>
              <th>类型</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of eventRows">
              <td><code [textContent]="row.name"></code></td>
              <td><code [textContent]="row.type"></code></td>
              <td [textContent]="row.desc"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </demo-card>

    <demo-card [meta]="m.apiMethods">
      <div class="demo-api-wrap">
        <table class="demo-api-table">
          <thead>
            <tr>
              <th>名称</th>
              <th>类型</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of methodRows">
              <td><code [textContent]="row.name"></code></td>
              <td><code [textContent]="row.type"></code></td>
              <td [textContent]="row.desc"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </demo-card>

    <demo-card [meta]="m.apiNodeModel">
      <p class="demo-col-label">入参字段（YTreeNode / YTreeFlatNode）</p>
      <div class="demo-api-wrap">
        <table class="demo-api-table">
          <thead>
            <tr>
              <th>名称</th>
              <th>类型</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of nodeInputRows">
              <td><code [textContent]="row.name"></code></td>
              <td><code [textContent]="row.type"></code></td>
              <td [textContent]="row.desc"></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="demo-col-label" style="margin-top: 16px">
        运行时字段（YTreeModel，方法返回值）
      </p>
      <div class="demo-api-wrap">
        <table class="demo-api-table">
          <thead>
            <tr>
              <th>名称</th>
              <th>类型</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of nodeModelRows">
              <td><code [textContent]="row.name"></code></td>
              <td><code [textContent]="row.type"></code></td>
              <td [textContent]="row.desc"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </demo-card>
  `,
})
export class DocsGroupComponent {
  readonly m = {
    apiProps: demoMeta('api-props'),
    apiEvents: demoMeta('api-events'),
    apiMethods: demoMeta('api-methods'),
    apiNodeModel: demoMeta('api-node-model'),
  };
  readonly propsRows = propsRows;
  readonly eventRows = eventRows;
  readonly methodRows = methodRows;
  readonly nodeInputRows = nodeInputRows;
  readonly nodeModelRows = nodeModelRows;
}
