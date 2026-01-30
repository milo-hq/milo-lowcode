import { useState } from 'react'
import { ChevronRight, ChevronDown, Box, Square, Type, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

// Figma 节点类型
export interface FigmaNode {
  id: string
  name: string
  type: string
  bbox: number[]
  children?: FigmaNode[]
}

interface FigmaNodeTreeProps {
  data: FigmaNode
  selectedNodeId: string | null
  onSelect: (node: FigmaNode) => void
  mappedNodeIds?: Set<string>  // 已绑定的节点 ID
}

// 获取节点类型图标
function getNodeIcon(type: string) {
  switch (type) {
    case 'frame':
      return <Box className="h-3.5 w-3.5 text-blue-500" />
    case 'instance':
      return <Box className="h-3.5 w-3.5 text-purple-500" />
    case 'rounded-rectangle':
    case 'rectangle':
      return <Square className="h-3.5 w-3.5 text-green-500" />
    case 'text':
      return <Type className="h-3.5 w-3.5 text-amber-500" />
    case 'ellipse':
      return <Circle className="h-3.5 w-3.5 text-cyan-500" />
    default:
      return <Square className="h-3.5 w-3.5 text-gray-500" />
  }
}

interface TreeNodeProps {
  node: FigmaNode
  depth: number
  selectedNodeId: string | null
  onSelect: (node: FigmaNode) => void
  mappedNodeIds?: Set<string>
  defaultExpanded?: boolean
}

function TreeNode({
  node,
  depth,
  selectedNodeId,
  onSelect,
  mappedNodeIds,
  defaultExpanded = true
}: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded && depth < 2)
  const hasChildren = node.children && node.children.length > 0
  const isSelected = selectedNodeId === node.id
  const isMapped = mappedNodeIds?.has(node.id)

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  const handleSelect = () => {
    onSelect(node)
  }

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-1 py-1 px-2 rounded cursor-pointer text-sm',
          'hover:bg-accent transition-colors',
          isSelected && 'bg-yellow-500/20 border border-yellow-500',
          isMapped && !isSelected && 'bg-green-500/10 border border-green-500/30',
          !isSelected && !isMapped && 'border border-transparent'
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleSelect}
      >
        {/* 展开/收起按钮 */}
        {hasChildren ? (
          <button
            className="p-0.5 hover:bg-muted rounded"
            onClick={handleToggle}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
        ) : (
          <span className="w-4" />
        )}

        {/* 节点图标 */}
        {getNodeIcon(node.type)}

        {/* 节点名称 */}
        <span className={cn(
          'truncate flex-1',
          isSelected && 'font-medium text-yellow-600',
          isMapped && !isSelected && 'text-green-600'
        )}>
          {node.name}
        </span>

        {/* 已绑定标记 */}
        {isMapped && (
          <span className="text-[10px] bg-green-500/20 text-green-600 px-1.5 py-0.5 rounded">
            已绑定
          </span>
        )}

        {/* 子节点数量 */}
        {hasChildren && (
          <span className="text-[10px] text-muted-foreground">
            {node.children!.length}
          </span>
        )}
      </div>

      {/* 子节点 */}
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedNodeId={selectedNodeId}
              onSelect={onSelect}
              mappedNodeIds={mappedNodeIds}
              defaultExpanded={depth < 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function FigmaNodeTree({
  data,
  selectedNodeId,
  onSelect,
  mappedNodeIds
}: FigmaNodeTreeProps) {
  // 如果有 children，直接展示子节点列表
  if (data.children && data.children.length > 0) {
    return (
      <div className="text-sm">
        {data.children.map((child) => (
          <TreeNode
            key={child.id}
            node={child}
            depth={0}
            selectedNodeId={selectedNodeId}
            onSelect={onSelect}
            mappedNodeIds={mappedNodeIds}
            defaultExpanded={true}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="text-sm text-muted-foreground p-4 text-center">
      没有子节点
    </div>
  )
}
