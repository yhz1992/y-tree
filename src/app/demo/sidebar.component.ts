import { AfterViewInit, Component, HostListener, Input } from '@angular/core';
import type { DemoGroup } from './types';

/**
 * 左侧功能菜单：点击平滑滚动到锚点，滚动时自动高亮当前 demo
 */
@Component({
  selector: 'demo-sidebar',
  template: `
    <aside class="demo-sidebar">
      <div class="demo-sidebar-title">
        y-tree
        <span class="demo-sidebar-sub">Angular</span>
      </div>
      <nav class="demo-sidebar-nav">
        <div class="demo-sidebar-group" *ngFor="let group of groups">
          <div class="demo-sidebar-group-title">{{ group.title }}</div>
          <ul class="demo-sidebar-list">
            <li *ngFor="let demo of group.demos">
              <button
                type="button"
                class="demo-sidebar-link"
                [class.is-active]="activeId === demo.id"
                (click)="scrollTo(demo.id)"
              >
                {{ demo.title }}
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  `,
})
export class SidebarComponent implements AfterViewInit {
  @Input() groups: Array<DemoGroup> = [];
  activeId = '';

  ngAfterViewInit(): void {
    // 延后到下一个宏任务：此时变更检测已结束，
    // 否则在 ngAfterViewInit 里改 activeId 会触发 NG0100
    setTimeout(() => this.onScroll());
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const cards = Array.from(
      document.querySelectorAll<HTMLElement>('.demo-card')
    );
    let current = cards[0]?.id ?? '';
    for (const card of cards) {
      if (card.getBoundingClientRect().top <= 120) {
        current = card.id;
      } else {
        break;
      }
    }
    this.activeId = current;
  }

  scrollTo(id: string): void {
    const el = document.getElementById(id);
    if (!el) {
      return;
    }
    const top = el.getBoundingClientRect().top + window.scrollY - 24;
    window.scrollTo({ top, behavior: 'smooth' });
    this.activeId = id;
  }
}
