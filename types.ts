type ID = string;

export type NodeType =
  | "frame"
  | "instance"
  | "text"
  | "rounded-rectangle"
  | "rectangle"
  | "ellipse"
  | "vector"
  | "group"
  | "unknown";

type vector4 = [number, number, number, number]; // 4向量，例如代表节点属性的x,y,w,h

/**
 * figma节点数据结构
 */
interface FigmaNodeMeta {
  id?: ID; // node节点 ID
  name: string;
  type: NodeType;
  children?: FigmaNodeMeta[];
  bbox?: vector4;
}
/**
 * section指纹(特征) 用于检索与决策
 */
interface SectionFingerprint {
  // 结构复杂度
  depth: number; // 树深度
  nodeCount: number; // 节点总数
  childCount: number; //  section直系children数量

  // 类型分布(粗统计)
  counts: Partial<Record<NodeType, number>>;

  // 结构模式提示（先规则推断）
  hasText: boolean;
  textCount: number;
  hasIntance: boolean;
  instanceCount: number;
  haskImagesLike: boolean; // rounded-rectangle / rectangle 作为 image 占位
  imageLikeCount: number;
  hasButtonLike: boolean; // 规则：frame + text 等
  buttonLikeCount: number;
  // 位置与尺寸
  bbox?: vector4;
  //可检索的关键词（从 name/type/简单规则中提取）
  keywords: string[];
  // 用于 RAG 的“可读摘要”（把指纹转成一句话/多句）
  summary: string;
}
/**
 * 一个section(大区块)
 */
interface SectionIR {
  sectionId: string;
  figmaNodeId?: ID;
  figmaPath: string; // e.g. "下载+头部/_头部"
  figmaName: string;
  figmaType: NodeType;
  fingerprint: SectionFingerprint;
}

/**
 * 一个skin的Figma的抽象结果
 */
interface SkinFigmaIR {
  skinId: string;
  frameId: ID;
  frameName: string;
  root: FigmaNodeMeta;
  sections: SectionIR[];
}

/** Section 映射标签：这是你“截图标注/人工确认”最终要落地的数据 */
interface SectionMappingLabel {
  sectionId: string;

  // 映射到本地哪个组件 （大类先只填 container）
  localComponentName: string;
  // 可选：如果是“组合变体”，写成 variantKey（推荐）
  // e.g. "toolbar:logo+lang+buttons"
  variantKey?: string;
  // 决策标签（truth）：后续评估决策器用
  truthStrategy: "reuse" | "patch" | "new";
  // 可选： 说明为什么
  notes?: string;
}
/**
 * 本地配置的组件结构
 */
interface LocalComponentNode {
  componentName: string;
  componentId: number;
  position?: string; // 页面区域，部分组件有
  slot?: string; // 组件槽位, 部分组件有
  layoutType?: string; // 主要参数, 跟皮肤编号绑定的className，默认layout1
  propsKeys?: string[]; // 组件接受的参数，部分组件有，例如: ["imageList", "layoutType"] 等等，视情况而定
  children?: LocalComponentNode[];
}

/** 一套皮肤的对齐样本（训练/检索的最小单元） */
interface SkinAlignmentSample {
  skinId: string;

  // Figma
  figmaFrameName: string;
  figmaFrameId?: ID;
  sections: SectionIR[];
  // 本地配置
  localRoot: LocalComponentNode;
  // 核心: section -> 本地组件（或组件组合变体）的映射标签
  mappings: SectionMappingLabel[];
  // 可选：人工标注信息
  annotatedBy?: string;
  annotatedAt?: string; // ISO
}
/**
 * 新皮肤决策输出：先做report
 */
interface SectionDecision {
  sectionId: string;
  candidates: { componentName: string; score: number; variantKey?: string }[]; // 候选信息
  decision: "reuse" | "patch" | "new";
  confidence: number; // 置信度
  evidence: {
    matchedSkins: string[];
    matchedSectionIds: string[];
    reasons: string[];
  };
  patchHint?: {
    missingCapabilities?: string[];
    likelyVariantChange?: string[];
  };
}
