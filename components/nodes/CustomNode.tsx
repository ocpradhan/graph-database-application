import { Handle, Position } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Node, NodeProps } from "@xyflow/react"; // or 'reactflow'
import { GraphNode } from "@/types/graph";

export interface CustomNodeData extends Record<string, unknown> {
  graphNode: GraphNode;
  isImpacted?: boolean;
}

export type CustomNodeType = Node<CustomNodeData, "customNode">;

export function CustomNode({ data, selected }: NodeProps<CustomNodeType>) {
  const { graphNode, isImpacted } = data;
  const { label, name, riskScore } = graphNode;

  const showIncoming =
    label === "Component" || label === "Product" || label === "LogisticsHub";
  const showOutgoing =
    label === "Supplier" || label === "Component" || label === "LogisticsHub";

  let borderStyle =
    "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100";

  if (selected) {
    borderStyle =
      "border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900";
  } else if (isImpacted) {
    borderStyle =
      "border-rose-600 bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200 ring-2 ring-rose-500 ring-offset-2 dark:ring-offset-slate-900 animate-pulse";
  }

  return (
    <div
      className={`rounded-xl border-2 p-3 shadow-sm min-w-45 transition-all cursor-pointer ${borderStyle}`}
    >
      {showIncoming && (
        <Handle
          type="target"
          position={Position.Top}
          className="w-2.5 h-2.5 bg-blue-500 border-2 border-white -top-1.5!"
        />
      )}

      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </span>
        <span className="font-semibold text-sm leading-tight text-slate-900 dark:text-slate-100">
          {name}
        </span>
        <div className="mt-1 flex items-center justify-between text-[10px] border-t pt-1 text-slate-500 dark:text-slate-400 dark:border-slate-700">
          <span>Risk Score:</span>
          <span className="font-bold text-slate-700 dark:text-slate-300">
            {riskScore}/100
          </span>
        </div>
      </div>

      {showOutgoing && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-2.5 h-2.5 bg-emerald-500 border-white -bottom-1.5"
        />
      )}
    </div>
  );
}
