import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';

import { YTreeComponent } from './y-tree.component';

describe('YTreeComponent', () => {
  let component: YTreeComponent;
  let fixture: ComponentFixture<YTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [YTreeComponent],
      imports: [CommonModule],
    }).compileComponents();

    fixture = TestBed.createComponent(YTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /** 模拟真实输入变化：设置数据 → 手动触发变化检测（OnPush 组件内部已 markForCheck） */
  const setData = (data: Array<any>) => {
    component.datasource = data;
    component.ngOnChanges({} as any);
    fixture.detectChanges();
  };

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('应扁平化渲染节点并按 level 缩进', () => {
    setData([
      {
        id: '1',
        name: '节点1',
        expanded: true,
        children: [
          { id: '1-1', name: '节点1-1', children: [] },
          { id: '1-2', name: '节点1-2', children: [] },
        ],
      },
    ]);

    const nodes = fixture.nativeElement.querySelectorAll('.y-tree-node');
    expect(nodes.length).toBe(3);
    expect(nodes[0].querySelector('.y-tree-title').textContent.trim()).toBe(
      '节点1'
    );
    // 缩进由 indent 元素实现（level * 20px）
    const indent1 = nodes[1].querySelector('.y-tree-indent') as HTMLElement;
    const indent2 = nodes[2].querySelector('.y-tree-indent') as HTMLElement;
    expect(indent1.style.width).toBe('20px');
    expect(indent2.style.width).toBe('20px');
  });

  it('getNodeById 应返回节点信息', () => {
    component.datasource = [
      { id: 'a', name: 'A', children: [] },
      { id: 'b', name: 'B', children: [] },
    ];
    component.ngOnChanges({} as any);

    expect(component.getNodeById('a')?.name).toBe('A');
    expect(component.getNodeById('not-exist')).toBeNull();
  });

  it('勾选父节点应联动勾选子节点，getCheckedList 返回勾选集合', () => {
    component.checkable = true;
    setData([
      {
        id: '1',
        name: '节点1',
        children: [
          { id: '1-1', name: '节点1-1', children: [] },
          { id: '1-2', name: '节点1-2', children: [] },
        ],
      },
    ]);

    // 通过 DOM 触发父节点勾选
    const checkbox = fixture.nativeElement.querySelector(
      '.y-tree-node input[type="checkbox"]'
    ) as HTMLInputElement;
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const list = component.getCheckedList();
    expect(list.length).toBe(3);

    const ids = list.map((node) => node.id);
    expect(ids).toContain('1');
    expect(ids).toContain('1-1');
    expect(ids).toContain('1-2');
  });

  it('展开按钮事件应触发 expandChange 并切换展开状态', () => {
    setData([
      {
        id: '1',
        name: '节点1',
        children: [{ id: '1-1', name: '节点1-1', children: [] }],
      },
    ]);

    // 初始未展开，只有根节点可见
    expect(fixture.nativeElement.querySelectorAll('.y-tree-node').length).toBe(
      1
    );

    let emitted: any = null;
    component.expandChange.subscribe((payload) => (emitted = payload));

    const switcher = fixture.nativeElement.querySelector(
      '.y-tree-node .y-tree-switcher'
    ) as HTMLElement;
    switcher.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(emitted).toEqual(
      jasmine.objectContaining({ id: '1', expand: true })
    );
    // 展开后子节点可见
    expect(fixture.nativeElement.querySelectorAll('.y-tree-node').length).toBe(
      2
    );
  });
});
