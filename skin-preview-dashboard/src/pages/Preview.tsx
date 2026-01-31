import { useState, useMemo } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { SkinPreview } from '@/components/SkinPreview'
import { ComponentTree } from '@/components/ComponentTree'
import { MappingPanel, type SectionMappingLabel } from '@/components/MappingPanel'
import { FigmaNodeTree, type FigmaNode } from '@/components/FigmaNodeTree'
import { ZoomIn, ZoomOut, Download, Trash2 } from 'lucide-react'
import { skinList, getSkinData, getLocalConfig } from '@/data'

// 统计所有节点数量（包括子节点）
function countNodes(node: FigmaNode): number {
  let count = 1
  if (node.children) {
    for (const child of node.children) {
      count += countNodes(child)
    }
  }
  return count
}

// 根据 id 查找节点名称
function findNodeName(root: FigmaNode, id: string): string | null {
  if (root.id === id) return root.name
  if (root.children) {
    for (const child of root.children) {
      const found = findNodeName(child, id)
      if (found) return found
    }
  }
  return null
}

export function PreviewPage() {
  const [selectedSkinId, setSelectedSkinId] = useState<string>('36')
  const [scale, setScale] = useState(0.4)
  const [showLabels, setShowLabels] = useState(true)

  // 选中状态 - 使用 FigmaNode
  const [selectedNode, setSelectedNode] = useState<FigmaNode | null>(null)
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)

  // 绑定映射列表
  const [mappings, setMappings] = useState<SectionMappingLabel[]>([])

  const selectedSkin = getSkinData(selectedSkinId)
  const localConfig = getLocalConfig(selectedSkinId)

  // 获取根节点用于树形展示
  const rootNode = useMemo(() => {
    return selectedSkin?.root as FigmaNode | undefined
  }, [selectedSkin])

  // 计算节点总数
  const totalNodes = useMemo(() => {
    if (!rootNode?.children) return 0
    return rootNode.children.reduce((acc, child) => acc + countNodes(child), 0)
  }, [rootNode])

  // 已绑定的节点 ID 集合
  const mappedNodeIds = useMemo(() => {
    return new Set(mappings.map(m => m.sectionId))
  }, [mappings])

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 2))
  }

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.2))
  }

  // 处理节点选择（从树列表）
  const handleNodeSelect = (node: FigmaNode) => {
    setSelectedNode(node)
  }

  // 处理组件选择
  const handleComponentSelect = (componentName: string | null) => {
    setSelectedComponent(componentName)
  }

  // 处理绑定操作
  const handleBind = (strategy?: 'reuse' | 'patch' | 'new') => {
    if (!selectedNode || !selectedComponent) return

    const newMapping: SectionMappingLabel = {
      sectionId: selectedNode.id,
      localComponentName: selectedComponent,
      ...(strategy && { truthStrategy: strategy }),  // 有策略时才添加
    }

    const existingIndex = mappings.findIndex(m => m.sectionId === selectedNode.id)
    if (existingIndex >= 0) {
      const updated = [...mappings]
      updated[existingIndex] = newMapping
      setMappings(updated)
    } else {
      setMappings([...mappings, newMapping])
    }

    setSelectedNode(null)
    setSelectedComponent(null)
  }

  // 删除映射
  const handleDeleteMapping = (sectionId: string) => {
    setMappings(mappings.filter(m => m.sectionId !== sectionId))
  }

  // 导出映射结果
  const handleExport = () => {
    const exportData = {
      skinId: selectedSkinId,
      mappings: mappings,
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `skin_${selectedSkinId}_mappings.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // 清空所有映射
  const handleClearAll = () => {
    if (confirm('确定要清空所有映射吗？')) {
      setMappings([])
    }
  }

  // 转换 FigmaNode 为 MappingPanel 需要的 Section 格式
  const selectedSection = selectedNode ? {
    sectionId: selectedNode.id,
    figmaName: selectedNode.name,
    figmaType: selectedNode.type,
  } : null

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* 顶部标题栏 */}
      <div className="flex-shrink-0 px-4 py-3 border-b bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Section 对齐工具</h1>
            <p className="text-sm text-muted-foreground">
              将 Figma sections 与本地组件进行绑定映射
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* 皮肤选择器 */}
            <Select value={selectedSkinId} onValueChange={(id) => {
              setSelectedSkinId(id)
              setSelectedNode(null)
              setSelectedComponent(null)
            }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="选择皮肤" />
              </SelectTrigger>
              <SelectContent>
                {skinList.map(skin => (
                  <SelectItem key={skin.id} value={skin.id}>
                    {skin.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 缩放控制 */}
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm w-12 text-center">{(scale * 100).toFixed(0)}%</span>
              <Button variant="outline" size="icon" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>

            {/* 导出按钮 */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={mappings.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              导出 ({mappings.length})
            </Button>
          </div>
        </div>
      </div>

      {/* 主内容区 - 可拖拽三列布局 */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* 左列 - Figma 节点树 */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={40}>
          <div className="h-full flex flex-col">
            <div className="p-3 border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">Figma 节点树</h3>
                <span className="text-xs text-muted-foreground">{totalNodes}</span>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-2">
              {rootNode ? (
                <FigmaNodeTree
                  data={rootNode}
                  selectedNodeId={selectedNode?.id || null}
                  onSelect={handleNodeSelect}
                  mappedNodeIds={mappedNodeIds}
                />
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">
                  暂无数据
                </div>
              )}
            </div>
            <div className="p-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => setShowLabels(!showLabels)}
              >
                {showLabels ? '隐藏画布标签' : '显示画布标签'}
              </Button>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* 中列 - 画布预览 */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="h-full flex flex-col">
            <div className="p-3 border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">Figma 预览</h3>
                <span className="text-xs text-muted-foreground">
                  已绑定: {mappings.length}/{totalNodes}
                </span>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-2">
              <SkinPreview
                skinData={selectedSkin}
                scale={scale}
                showLabels={showLabels}
                selectedSectionId={selectedNode?.id}
              />
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* 右列 - 本地组件 + 绑定操作 */}
        <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
          <div className="h-full flex flex-col">
            {/* 组件树 */}
            <div className="p-3 border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">本地组件树</h3>
                <span className="text-xs text-muted-foreground">
                  {localConfig ? '选择组件' : '无配置'}
                </span>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-2">
              {localConfig ? (
                <ComponentTree
                  data={localConfig}
                  selectedComponent={selectedComponent}
                  onSelect={handleComponentSelect}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  暂无本地组件配置
                </div>
              )}
            </div>

            {/* 绑定操作面板 */}
            <div className="flex-shrink-0 border-t overflow-auto p-3">
              <MappingPanel
                selectedSection={selectedSection}
                selectedComponent={selectedComponent}
                onBind={handleBind}
                onClearSection={() => setSelectedNode(null)}
                onClearComponent={() => setSelectedComponent(null)}
              />

              {/* 已绑定列表 */}
              {mappings.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">已绑定映射</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={handleClearAll}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      清空
                    </Button>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-auto">
                    {mappings.map((mapping) => {
                      const nodeName = rootNode ? findNodeName(rootNode, mapping.sectionId) : null
                      return (
                        <div
                          key={mapping.sectionId}
                          className="text-xs p-2 bg-muted rounded flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
                            <span className="truncate">{nodeName || mapping.sectionId}</span>
                            <span className="text-muted-foreground flex-shrink-0">→</span>
                            <span className="truncate text-blue-600">{mapping.localComponentName}</span>
                            {mapping.truthStrategy && (
                              <span className={`
                                px-1.5 py-0.5 rounded text-[10px] flex-shrink-0
                                ${mapping.truthStrategy === 'reuse' ? 'bg-green-500/20 text-green-700' : ''}
                                ${mapping.truthStrategy === 'patch' ? 'bg-yellow-500/20 text-yellow-700' : ''}
                                ${mapping.truthStrategy === 'new' ? 'bg-red-500/20 text-red-700' : ''}
                              `}>
                                {mapping.truthStrategy}
                              </span>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 flex-shrink-0"
                            onClick={() => handleDeleteMapping(mapping.sectionId)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
