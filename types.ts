type ID = string

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

type vector4 = [number, number, number, number] // 4向量，例如代表节点属性的x,y,w,h

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
}