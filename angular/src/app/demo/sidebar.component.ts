import { AfterViewInit, Component, HostListener, Input } from '@angular/core';
import type { DemoGroup } from './types';

/**
 * 左侧功能菜单：点击平滑滚动到锚点，滚动时自动高亮当前 demo。
 * 小屏改为抽屉，由「目录」按钮打开。
 */
@Component({
  selector: 'demo-sidebar',
  template: `
    <div class="demo-nav" [class.is-open]="navOpen">
      <button
        type="button"
        class="demo-sidebar-toggle"
        [attr.aria-expanded]="navOpen"
        aria-controls="demo-sidebar"
        (click)="openNav()"
      >
        目录
      </button>
      <button
        type="button"
        class="demo-sidebar-mask"
        aria-label="关闭目录"
        (click)="closeNav()"
      ></button>
      <aside id="demo-sidebar" class="demo-sidebar" [class.is-open]="navOpen">
        <div class="demo-sidebar-title">
          y-tree
          <span class="demo-sidebar-sub">Angular</span>
          <button
            type="button"
            class="demo-sidebar-close"
            aria-label="关闭目录"
            (click)="closeNav()"
          >
            ×
          </button>
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
    </div>
  `,
})
export class SidebarComponent implements AfterViewInit {
  @Input() groups: Array<DemoGroup> = [];
  activeId = '';
  navOpen = false;

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

  @HostListener('window:keydown', ['$event'])
  onKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeNav();
    }
  }

  openNav(): void {
    this.navOpen = true;
  }

  closeNav(): void {
    this.navOpen = false;
  }

  scrollTo(id: string): void {
    const el = document.getElementById(id);
    if (!el) {
      return;
    }
    const top = el.getBoundingClientRect().top + window.scrollY - 24;
    this.closeNav();
    window.setTimeout(() => {
      window.scrollTo(0, top);
      this.activeId = id;
    }, 0);
  }
}
