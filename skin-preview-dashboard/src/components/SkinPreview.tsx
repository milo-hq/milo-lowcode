import { useEffect, useRef, useState, useCallback } from 'react'
import { Leafer, Rect, Text, Group } from 'leafer-ui'

// 定义皮肤数据类型
interface SkinNode {
  id: string
  name: string
  type: string
  bbox: number[] // [x, y, width, height]
  children?: SkinNode[]
}

interface Section {
  sectionId: string
  figmaNodeId: string
  figmaName: string
  figmaType: string
  fingerprint?: {
    nodeCount: number
    bbox: number[]
    summary: string
  }
}

interface SkinData {
  skinId: string
  frameId: string
  frameName: string
  root: SkinNode
  sections: Section[]
}

interface SkinPreviewProps {
  skinData: SkinData | null
  scale?: number
  showLabels?: boolean
  selectedSectionId?: string | null
  onSectionSelect?: (section: Section) => void
}

// 颜色映射，不同类型的节点使用不同颜色
const typeColors: Record<string, string> = {
  'frame': '#3b82f6',           // blue
  'instance': '#8b5cf6',        // purple
  'rounded-rectangle': '#10b981', // green
  'rectangle': '#10b981',       // green
  'text': '#f59e0b',            // amber
  'vector': '#ec4899',          // pink
  'ellipse': '#06b6d4',         // cyan
  'symbol': '#6366f1',          // indigo
  'default': '#6b7280',         // gray
}

function getColor(type: string): string {
  return typeColors[type] || typeColors['default']
}

export function SkinPreview({
  skinData,
  scale = 0.5,
  showLabels = true,
  selectedSectionId,
  onSectionSelect
}: SkinPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const leaferRef = useRef<Leafer | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const rectMapRef = useRef<Map<string, Rect>>(new Map())

  // 清理函数
  const cleanup = useCallback(() => {
    if (leaferRef.current) {
      try {
        leaferRef.current.destroy()
      } catch (e) {
        console.warn('Error destroying Leafer:', e)
      }
      leaferRef.current = null
    }
    rectMapRef.current.clear()
  }, [])

  // 更新选中状态
  useEffect(() => {
    rectMapRef.current.forEach((rect, nodeId) => {
      const isSelected = skinData?.sections.some(
        s => s.figmaNodeId === nodeId && s.sectionId === selectedSectionId
      )
      if (isSelected) {
        rect.stroke = '#fbbf24' // yellow for selected
        rect.strokeWidth = 3
      }
    })
  }, [selectedSectionId, skinData])

  useEffect(() => {
    if (!containerRef.current || !skinData) {
      setIsReady(false)
      return
    }

    // 清理之前的实例
    cleanup()

    const container = containerRef.current

    // 确保容器是空的
    while (container.firstChild) {
      container.removeChild(container.firstChild)
    }

    const rootBbox = skinData.root.bbox
    const frameWidth = rootBbox[2]
    const frameHeight = rootBbox[3]

    // 计算画布大小（加上边距）
    const padding = 20
    const canvasWidth = Math.ceil(frameWidth * scale + padding * 2)
    const canvasHeight = Math.ceil(frameHeight * scale + padding * 2)

    try {
      // 创建 Leafer 实例
      const leafer = new Leafer({
        view: container,
        width: canvasWidth,
        height: canvasHeight,
        fill: '#1a1a2e',
      })

      leaferRef.current = leafer

      // 创建主容器组（用于整体偏移）
      const mainGroup = new Group({
        x: padding,
        y: padding,
      })

      // 绘制根节点背景（手机屏幕框架）
      const rootRect = new Rect({
        x: 0,
        y: 0,
        width: frameWidth * scale,
        height: frameHeight * scale,
        fill: '#0f172a',
        stroke: '#334155',
        strokeWidth: 2,
        cornerRadius: 12,
      })
      mainGroup.add(rootRect)

      // 递归绘制节点函数
      const drawNode = (node: SkinNode, parentX: number, parentY: number, depth: number) => {
        const [x, y, width, height] = node.bbox
        const absoluteX = parentX + x
        const absoluteY = parentY + y
        const color = getColor(node.type)

        // 检查是否是选中的 section
        const section = skinData.sections.find(s => s.figmaNodeId === node.id)
        const isSelected = section && section.sectionId === selectedSectionId

        // 根据深度调整透明度和边框粗细
        const opacity = depth === 1 ? '40' : '25'
        const strokeWidth = depth === 1 ? 2 : 1

        // 创建节点矩形
        const rect = new Rect({
          x: absoluteX * scale,
          y: absoluteY * scale,
          width: Math.max(width * scale, 4),
          height: Math.max(height * scale, 4),
          fill: isSelected ? color + '60' : color + opacity,
          stroke: isSelected ? '#fbbf24' : color,
          strokeWidth: isSelected ? 3 : strokeWidth,
          cornerRadius: depth === 1 ? 4 : 2,
        })

        // 保存 rect 引用用于后续更新
        if (depth === 1 && section) {
          rectMapRef.current.set(node.id, rect)
        }

        // 添加交互事件
        rect.on('pointer.enter', () => {
          if (!isSelected) {
            rect.fill = color + '60'
            rect.strokeWidth = strokeWidth + 1
          }
          setHoveredNode(`${node.name} (${Math.round(width)}×${Math.round(height)})`)
        })

        rect.on('pointer.leave', () => {
          if (!isSelected) {
            rect.fill = color + opacity
            rect.strokeWidth = strokeWidth
          }
          setHoveredNode(null)
        })

        // 点击事件 - 仅对一级节点（section）生效
        if (depth === 1 && section && onSectionSelect) {
          rect.on('pointer.tap', () => {
            onSectionSelect(section)
          })
        }

        mainGroup.add(rect)

        // 添加标签（仅当尺寸足够大时）
        const minLabelWidth = depth === 1 ? 50 : 40
        const minLabelHeight = depth === 1 ? 20 : 16
        if (showLabels && width * scale > minLabelWidth && height * scale > minLabelHeight) {
          const fontSize = depth === 1 ? 10 : 8
          const label = new Text({
            x: absoluteX * scale + 3,
            y: absoluteY * scale + 3,
            text: node.name.length > 12 ? node.name.slice(0, 12) + '...' : node.name,
            fill: isSelected ? '#fbbf24' : (depth === 1 ? '#ffffff' : '#cbd5e1'),
            fontSize: fontSize,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: depth === 1 ? 500 : 400,
          })
          mainGroup.add(label)
        }

        // 递归绘制子节点
        if (node.children && node.children.length > 0) {
          node.children.forEach(child => {
            drawNode(child, absoluteX, absoluteY, depth + 1)
          })
        }
      }

      // 绘制子节点（sections）
      const children = skinData.root.children || []

      children.forEach((child) => {
        drawNode(child, 0, 0, 1)
      })

      leafer.add(mainGroup)
      setIsReady(true)

    } catch (error) {
      console.error('[SkinPreview] Error creating canvas:', error)
      setIsReady(false)
    }

    return cleanup
  }, [skinData, scale, showLabels, selectedSectionId, onSectionSelect, cleanup])

  if (!skinData) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground border rounded-lg bg-muted/20">
        请选择一个皮肤进行预览
      </div>
    )
  }

  const rootBbox = skinData.root.bbox
  const frameHeight = rootBbox[3]
  const padding = 20
  const containerHeight = Math.min(Math.ceil(frameHeight * scale + padding * 2), 800)

  return (
    <div className="relative">
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
          <div className="text-muted-foreground">加载中...</div>
        </div>
      )}
      <div
        className="border rounded-lg overflow-auto flex justify-center"
        style={{
          height: `${containerHeight}px`,
          backgroundColor: '#1a1a2e',
          minHeight: '400px',
        }}
      >
        <div ref={containerRef} className="flex-shrink-0" />
      </div>
      {hoveredNode && (
        <div className="absolute top-4 left-4 bg-black/90 text-white px-3 py-2 rounded-md text-sm font-medium shadow-lg z-20">
          {hoveredNode}
        </div>
      )}
    </div>
  )
}

export type { SkinData, SkinNode, Section }
