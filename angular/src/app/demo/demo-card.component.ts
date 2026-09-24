import { Component, Input } from '@angular/core';
import type { DemoMeta } from './types';

/**
 * 单个功能点演示卡片：标题 + 说明 + 带边框实例区 + 可展开代码
 */
@Component({
  selector: 'demo-card',
  template: `
    <section class="demo-card" [attr.id]="meta.id">
      <h3 class="demo-card-title">{{ meta.title }}</h3>
      <p class="demo-card-desc">{{ meta.desc }}</p>
      <div class="demo-card-body">
        <ng-content></ng-content>
      </div>
      <div class="demo-card-code-bar">
        <button
          type="button"
          class="demo-card-code-btn"
          (click)="codeOpen = !codeOpen"
        >
          <span class="demo-card-code-caret" [class.is-open]="codeOpen">▸</span>
          {{ codeOpen ? '隐藏代码' : '显示代码' }}
        </button>
      </div>
      <pre
        class="demo-card-code"
        *ngIf="codeOpen"
      ><code>{{ meta.code }}</code></pre>
    </section>
  `,
})
export class DemoCardComponent {
  @Input() meta!: DemoMeta;
  codeOpen = false;
}
