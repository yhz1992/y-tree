import { useState } from "react";
import YTree from "../../components/y-tree";
import type { DemoMeta } from "../types";
import type { YTreeNode } from "../../../../common/model";

/** 编辑演示数据：与拖拽数据共用同样的形状，便于对照 */
const editData: Array<YTreeNode> = [
  {
    id: "a",
    name: "A",
    expanded: true,
    children: [
      { id: "a-1", name: "A-1", children: [] },
      { id: "a-2", name: "A-2", children: [] },
    ],
  },
  { id: "b", name: "B", children: [] },
  { id: "c", name: "C", children: [] },
];

const cloneEditData = () => structuredClone(editData);

/* ------------------------------------------------------------------ */
/* 1. 编辑按钮配置                                                     */
/* ------------------------------------------------------------------ */

const editableCode = `import YTree from "y-tree-react";

// editable 开启编辑能力，三个按钮可分别控制显隐
<YTree
  datasource={data}
  editable
  showRenameBtn
  showRemoveBtn
  showAddBtn
/>;`;

function EditableDemo() {
  const [showRename, setShowRename] = useState(true);
  const [showRemove, setShowRemove] = useState(true);
  const [showAdd, setShowAdd] = useState(true);

  return (
    <>
      <div className="demo-toolbar">
        <label className="demo-check">
          <input
            type="checkbox"
            checked={showRename}
            onChange={(e) => setShowRename(e.target.checked)}
          />
          showRenameBtn
        </label>
        <label className="demo-check">
          <input
            type="checkbox"
            checked={showRemove}
            onChange={(e) => setShowRemove(e.target.checked)}
          />
          showRemoveBtn
        </label>
        <label className="demo-check">
          <input
            type="checkbox"
            checked={showAdd}
            onChange={(e) => setShowAdd(e.target.checked)}
          />
          showAddBtn
        </label>
      </div>
      <YTree
        datasource={editData}
        expandAll
        editable
        showRenameBtn={showRename}
        showRemoveBtn={showRemove}
        showAddBtn={showAdd}
        height={140}
      />
      <p className="demo-tip">
        鼠标悬停在节点上显示操作按钮，三个开关分别控制重命名 / 删除 / 新增按钮。
      </p>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 2. 重命名                                                           */
/* ------------------------------------------------------------------ */

const renameCode = `import YTree from "y-tree-react";

<YTree
  datasource={data}
  editable
  // 进入编辑态前拦截，返回 false 取消
  beforeEditName={(e) => {
    console.log("beforeEditName", e.id);
    return true;
  }}
  // 提交前拦截，返回 false 取消本次重命名
  beforeRename={(e) => {
    console.log("beforeRename", e.oldName, "->", e.newName);
    return e.newName.trim().length > 0;
  }}
  onRename={(e) => console.log("onRename", e.id, e.newName)}
/>;`;

function RenameDemo() {
  const [data] = useState(() => cloneEditData());
  const [log, setLog] = useState("（双击节点标题，或点击笔按钮进入编辑）");
  const append = (msg: string) =>
    setLog((prev) => msg + "\n" + prev.slice(0, 300));

  return (
    <>
      <YTree
        datasource={data}
        expandAll
        editable
        height={140}
        beforeEditName={(e) => {
          append(`beforeEditName id=${e.id}`);
          return true;
        }}
        beforeRename={(e) => {
          append(`beforeRename "${e.oldName}" -> "${e.newName}"`);
          return true;
        }}
        onRename={(e) => append(`onRename id=${e.id} -> "${e.newName}"`)}
      />
      <p className="demo-tip">
        双击标题或点击笔按钮进入编辑，Enter 提交 / Esc 取消 / 失焦提交。
      </p>
      <pre className="demo-log">{log}</pre>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 3. 删除                                                             */
/* ------------------------------------------------------------------ */

const removeCode = `import YTree from "y-tree-react";

<YTree
  datasource={data}
  editable
  // removeConfirm 删除前弹气泡确认
  removeConfirm
  beforeRemove={(e) => {
    console.log("beforeRemove", e.id);
    return true; // 返回 false 阻止删除
  }}
  onRemove={(e) => console.log("onRemove 已删除", e.id)}
/>;`;

function RemoveDemo() {
  const [data, setData] = useState(() => cloneEditData());
  const [log, setLog] = useState("（点击垃圾桶按钮，气泡中确认删除）");
  const append = (msg: string) =>
    setLog((prev) => msg + "\n" + prev.slice(0, 300));

  return (
    <>
      <YTree
        datasource={data}
        expandAll
        editable
        removeConfirm
        height={140}
        onRemove={(e) => append(`onRemove 已删除 id=${e.id}`)}
      />
      <div className="demo-toolbar" style={{ marginTop: 10, marginBottom: 0 }}>
        <button
          type="button"
          onClick={() => {
            setData(cloneEditData());
            setLog("数据已重置");
          }}
        >
          重置数据
        </button>
      </div>
      <pre className="demo-log">{log}</pre>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 4. 新增                                                             */
/* ------------------------------------------------------------------ */

const addCode = `import YTree from "y-tree-react";

<YTree
  datasource={data}
  editable
  beforeAdd={(e) => {
    console.log("beforeAdd 父节点", e.id);
    return true; // 返回 false 取消新增
  }}
  // 新增完成后回调，携带新节点 id
  onAdd={(e) => console.log("onAdd", e.parentId, "->", e.id)}
/>;`;

function AddDemo() {
  const [data, setData] = useState(() => cloneEditData());
  const [log, setLog] = useState("（点击加号按钮新增子节点，自动进入编辑态）");
  const append = (msg: string) =>
    setLog((prev) => msg + "\n" + prev.slice(0, 300));

  return (
    <>
      <YTree
        datasource={data}
        expandAll
        editable
        height={140}
        beforeAdd={(e) => {
          append(`beforeAdd 父节点 id=${e.id}`);
          return true;
        }}
        onAdd={(e) => append(`onAdd 父=${e.parentId} 新节点=${e.id}`)}
      />
      <div className="demo-toolbar" style={{ marginTop: 10, marginBottom: 0 }}>
        <button
          type="button"
          onClick={() => {
            setData(cloneEditData());
            setLog("数据已重置");
          }}
        >
          重置数据
        </button>
      </div>
      <pre className="demo-log">{log}</pre>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 5. 自定义节点内容                                                   */
/* ------------------------------------------------------------------ */

const nodeExtraCode = `import YTree from "y-tree-react";

// renderNodeExtra 在节点标题后追加自定义内容
<YTree
  datasource={data}
  renderNodeExtra={(node) =>
    node.childIds.length === 0 ? (
      <span className="tag">叶子</span>
    ) : (
      <span className="tag">{node.childIds.length} 个子节点</span>
    )
  }
/>;`;

function NodeExtraDemo() {
  return (
    <>
      <YTree
        datasource={editData}
        expandAll
        height={140}
        renderNodeExtra={(node) => (
          <span className="demo-node-tag">
            {node.childIds.length === 0
              ? "叶子"
              : `${node.childIds.length} 个子节点`}
          </span>
        )}
      />
      <p className="demo-tip">
        renderNodeExtra 接收节点数据，返回任意
        ReactNode，可用来展示标签、徽标、操作入口等。
      </p>
    </>
  );
}

/* ------------------------------------------------------------------ */

export const editDemos: Array<DemoMeta> = [
  {
    id: "editable",
    title: "编辑按钮配置",
    desc: "editable 开启行内编辑能力，hover 节点显示操作按钮；showRenameBtn / showRemoveBtn / showAddBtn 分别控制三个按钮的显隐。",
    code: editableCode,
    render: () => <EditableDemo />,
  },
  {
    id: "rename",
    title: "重命名",
    desc: "双击节点标题或点击笔按钮进入编辑态；beforeEditName 拦截进入编辑，beforeRename 拦截提交，onRename 在重命名完成后触发。",
    code: renameCode,
    render: () => <RenameDemo />,
  },
  {
    id: "remove",
    title: "删除节点",
    desc: "点击垃圾桶按钮删除节点，removeConfirm 控制是否弹出确认气泡；beforeRemove 可拦截删除，onRemove 在删除完成后触发。",
    code: removeCode,
    render: () => <RemoveDemo />,
  },
  {
    id: "add",
    title: "新增节点",
    desc: "点击加号按钮在节点下追加子节点，beforeAdd 可拦截；onAdd 回调携带父节点 id 与新节点 id。",
    code: addCode,
    render: () => <AddDemo />,
  },
  {
    id: "node-extra",
    title: "自定义节点内容",
    desc: "renderNodeExtra 在节点标题后渲染自定义内容。",
    code: nodeExtraCode,
    render: () => <NodeExtraDemo />,
  },
];
