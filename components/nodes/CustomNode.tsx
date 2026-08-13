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

  let borderStyle = "border-slate-300 bg-white text-slate-800";

  if (selected) {
    borderStyle =
      "border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500 ring-offset-2";
  } else if (isImpacted) {
    borderStyle =
      "border-rose-600 bg-rose-50 text-rose-900 ring-2 ring-rose-500 ring-offset-2 animate-pulse";
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
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        <span className="font-semibold text-sm leading-tight">{name}</span>
        <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 border-t pt-1">
          <span>Risk Score:</span>
          <span className="font-bold text-slate-700">{riskScore}/100</span>
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
