import { useState } from 'react'
import { ChevronRight, ChevronDown, Box, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'

// LocalComponentNode 类型定义
export interface LocalComponentNode {
  componentName: string
  componentId: number
  position?: string
  slot?: string
  layoutType?: string
  propsKeys?: string[]
  children?: LocalComponentNode[]
}

interface ComponentTreeProps {
  data: LocalComponentNode
  selectedComponent: string | null
  onSelect: (componentName: string, node: LocalComponentNode) => void
}

interface TreeNodeProps {
  node: LocalComponentNode
  depth: number
  selectedComponent: string | null
  onSelect: (componentName: string, node: LocalComponentNode) => void
  path: string
}

function TreeNode({ node, depth, selectedComponent, onSelect, path }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(depth < 2)
  const hasChildren = node.children && node.children.length > 0
  const nodeKey = `${path}/${node.componentName}`
  const isSelected = selectedComponent === nodeKey

  const handleClick = () => {
    onSelect(nodeKey, node)
  }

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  return (
    <div className="select-none">
      <div
        className={cn(
          'flex items-center gap-1 py-1 px-2 rounded cursor-pointer text-sm transition-colors',
          isSelected
            ? 'bg-primary/20 text-primary border border-primary/50'
            : 'hover:bg-muted/50'
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={handleClick}
      >
        {hasChildren ? (
          <button onClick={handleToggle} className="p-0.5 hover:bg-muted rounded">
            {isExpanded ? (
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            )}
          </button>
        ) : (
          <span className="w-4" />
        )}

        {hasChildren ? (
          <Layers className="h-3.5 w-3.5 text-blue-500" />
        ) : (
          <Box className="h-3.5 w-3.5 text-green-500" />
        )}

        <span className={cn('truncate', isSelected && 'font-medium')}>
          {node.componentName}
        </span>

        {node.slot && (
          <span className="text-xs text-muted-foreground bg-muted px-1 rounded">
            {node.slot}
          </span>
        )}

        {node.layoutType && (
          <span className="text-xs text-orange-500">
            [{node.layoutType}]
          </span>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child, index) => (
            <TreeNode
              key={`${nodeKey}-${index}`}
              node={child}
              depth={depth + 1}
              selectedComponent={selectedComponent}
              onSelect={onSelect}
              path={nodeKey}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function ComponentTree({ data, selectedComponent, onSelect }: ComponentTreeProps) {
  return (
    <div className="border rounded-lg bg-card overflow-hidden">
      <div className="p-3 border-b bg-muted/30">
        <h3 className="font-semibold text-sm">LocalComponentNode 树</h3>
        <p className="text-xs text-muted-foreground mt-1">选择要绑定的本地组件</p>
      </div>
      <div className="p-2 max-h-[600px] overflow-auto">
        <TreeNode
          node={data}
          depth={0}
          selectedComponent={selectedComponent}
          onSelect={onSelect}
          path=""
        />
      </div>
    </div>
  )
}
