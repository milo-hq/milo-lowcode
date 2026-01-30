// 类型定义
interface SkinNode {
  id: string
  name: string
  type: string
  bbox: number[]
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

interface LocalComponentNode {
  componentName: string
  componentId: number
  position?: string
  slot?: string
  layoutType?: string
  propsKeys?: string[]
  children?: LocalComponentNode[]
}

// 皮肤数据导入
import skin30Data from './skin_30_figma_ir.json'
import skin31Data from './skin_31_figma_ir.json'
import skin32Data from './skin_32_figma_ir.json'
import skin33Data from './skin_33_figma_ir.json'
import skin34Data from './skin_34_figma_ir.json'
import skin35Data from './skin_35_figma_ir.json'
import skin36Data from './skin_36_figma_ir.json'
import skin37Data from './skin_37_figma_ir.json'

// 本地组件配置导入
import theme36Local from './theme_36_local.json'

// 皮肤数据映射
const skinDataMap: Record<string, unknown> = {
  '30': skin30Data,
  '31': skin31Data,
  '32': skin32Data,
  '33': skin33Data,
  '34': skin34Data,
  '35': skin35Data,
  '36': skin36Data,
  '37': skin37Data,
}

// 本地组件配置映射
const localConfigMap: Record<string, unknown> = {
  '36': theme36Local,
}

// 皮肤信息配置
export interface SkinInfo {
  id: string
  name: string
}

export const skinList: SkinInfo[] = [
  { id: '30', name: '30号 - 麦芽绿' },
  { id: '31', name: '31号 - 皇家蓝' },
  { id: '32', name: '32号 - 巴黎紫' },
  { id: '33', name: '33号 - 碎冰蓝' },
  { id: '34', name: '34号 - 玉髓绿' },
  { id: '35', name: '35号 - 浅杏黄' },
  { id: '36', name: '36号 - 帝金紫' },
  { id: '37', name: '37号 - 幻光紫' },
]

/**
 * 获取皮肤数据
 * @param skinId 皮肤ID
 * @returns 皮肤数据，如果不存在返回 null
 */
export function getSkinData(skinId: string): SkinData | null {
  const data = skinDataMap[skinId]
  return data ? (data as unknown as SkinData) : null
}

/**
 * 获取本地组件配置
 * @param skinId 皮肤ID
 * @returns 本地组件配置，如果不存在返回 null
 */
export function getLocalConfig(skinId: string): LocalComponentNode | null {
  const config = localConfigMap[skinId]
  if (!config) return null
  return (config as { localRoot: LocalComponentNode }).localRoot
}

/**
 * 检查皮肤是否有本地配置
 * @param skinId 皮肤ID
 */
export function hasLocalConfig(skinId: string): boolean {
  return skinId in localConfigMap
}
