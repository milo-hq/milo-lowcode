import { Button } from '@/components/ui/button'
import { Link2, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

// SectionMappingLabel 类型定义
interface SectionMappingLabel {
  sectionId: string
  localComponentName: string
  variantKey?: string
  truthStrategy: 'reuse' | 'patch' | 'new'
  notes?: string
}

interface Section {
  sectionId: string
  figmaName: string
  figmaType: string
}

interface MappingPanelProps {
  selectedSection: Section | null
  selectedComponent: string | null
  onBind: (strategy: 'reuse' | 'patch' | 'new') => void
  onClearSection: () => void
  onClearComponent: () => void
}

export function MappingPanel({
  selectedSection,
  selectedComponent,
  onBind,
  onClearSection,
  onClearComponent
}: MappingPanelProps) {
  const [showStrategy, setShowStrategy] = useState(false)

  const canBind = selectedSection && selectedComponent

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm">绑定操作</h3>

      {/* 当前选择状态 */}
      <div className="grid grid-cols-2 gap-3">
        {/* 左侧选中 - Section */}
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Figma Section</div>
          <div className={cn(
            'p-2 rounded border text-sm min-h-[60px] relative',
            selectedSection ? 'bg-yellow-500/10 border-yellow-500/50' : 'bg-muted/30 border-dashed'
          )}>
            {selectedSection ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-1 right-1 h-5 w-5 p-0"
                  onClick={onClearSection}
                >
                  <X className="h-3 w-3" />
                </Button>
                <div className="font-medium text-xs truncate pr-6">{selectedSection.figmaName}</div>
                <div className="text-[10px] text-muted-foreground mt-1">{selectedSection.figmaType}</div>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">点击左侧画布或列表选择</span>
            )}
          </div>
        </div>

        {/* 右侧选中 - 组件 */}
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">本地组件</div>
          <div className={cn(
            'p-2 rounded border text-sm min-h-[60px] relative',
            selectedComponent ? 'bg-blue-500/10 border-blue-500/50' : 'bg-muted/30 border-dashed'
          )}>
            {selectedComponent ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-1 right-1 h-5 w-5 p-0"
                  onClick={onClearComponent}
                >
                  <X className="h-3 w-3" />
                </Button>
                <div className="font-medium text-xs truncate pr-6">{selectedComponent}</div>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">点击右侧树选择组件</span>
            )}
          </div>
        </div>
      </div>

      {/* 绑定按钮 */}
      <div className="relative">
        <Button
          size="sm"
          className="w-full"
          disabled={!canBind}
          onClick={() => setShowStrategy(!showStrategy)}
        >
          <Link2 className="h-3.5 w-3.5 mr-1" />
          绑定
          <ChevronDown className={cn("h-3.5 w-3.5 ml-1 transition-transform", showStrategy && "rotate-180")} />
        </Button>

        {showStrategy && canBind && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-10">
            <button
              className="w-full px-3 py-2 text-left text-sm hover:bg-accent rounded-t-md"
              onClick={() => { onBind('reuse'); setShowStrategy(false) }}
            >
              <div className="font-medium text-green-600">复用 (reuse)</div>
              <div className="text-xs text-muted-foreground">组件完全匹配，直接复用</div>
            </button>
            <button
              className="w-full px-3 py-2 text-left text-sm hover:bg-accent border-t"
              onClick={() => { onBind('patch'); setShowStrategy(false) }}
            >
              <div className="font-medium text-yellow-600">微调 (patch)</div>
              <div className="text-xs text-muted-foreground">需要小幅调整样式或参数</div>
            </button>
            <button
              className="w-full px-3 py-2 text-left text-sm hover:bg-accent border-t rounded-b-md"
              onClick={() => { onBind('new'); setShowStrategy(false) }}
            >
              <div className="font-medium text-red-600">新建 (new)</div>
              <div className="text-xs text-muted-foreground">需要开发新组件</div>
            </button>
          </div>
        )}
      </div>

      {!canBind && (
        <p className="text-xs text-muted-foreground text-center">
          请先选择左右两侧的元素
        </p>
      )}
    </div>
  )
}

export type { SectionMappingLabel, Section }
