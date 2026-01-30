# 皮肤系统架构文档

[TOC]

## 概述

主项目的皮肤系统是一个高度可配置、模块化的主题管理方案，支持多达 37+ 套不同风格的皮肤。通过配置化的方式，可以灵活地定制组件样式、布局和交互行为。

## 目录结构

```bash
src/theme/
├── configuration/          # 主题配置目录
│   ├── default/           # 默认系列主题 (Theme #5-16)
│   ├── first/             # 第一系列主题 (Theme #1-3, #17-37)
│   ├── second/            # 第二系列主题 (Theme #4)
│   ├── pathMaps.ts        # 路径映射配置
│   └── theme-modifier.ts  # 主题配置修改器
├── modules/               # CSS 样式模块
│   ├── default/          # 默认系列样式
│   ├── first/            # 第一系列样式
│   └── second/           # 第二系列样式
├── templateConfigs/       # 模板配置
│   ├── mainPage.ts       # 首页功能配置
│   ├── spread.ts         # 推广页配置
│   └── activityConfig.ts # 活动配置
├── imgConfigs/           # 图片资源配置
│   └── index.ts          # 图片映射索引
├── news/                 # 新闻主题样式
├── hooks.ts              # 主题钩子与核心逻辑
└── variables.css         # 全局 CSS 变量
```

## 核心模块

### 1. 主题配置中心 (`hooks.ts`)

#### 1.1 主题配置对象

```typescript
interface ThemeConfig {
  skin: string              // 皮肤系列：'default' | 'first' | 'second'
  theme: string             // 主题名称：如 'blue-default', 'neo-blue'
  home?: string             // 首页版本：'v01', 'v02'
  color: string             // 主色调
  newSkin?: string          // 新皮肤标识
  configuration?: any       // 主题配置对象
  specialSkinSettings?: any // 特殊皮肤设置
  skinNumber?: string       // 皮肤编号：'Theme #1' - 'Theme #37'
  homeType?: string         // 首页类型：'GameType' | 'Platform'
  homeTypeList?: string[]   // 支持的首页类型列表
  activityConfig?: object   // 活动配置
  spreadConfig?: object     // 推广页配置
}
```

#### 1.2 主题映射表

主题配置映射表 `themeConfig` 包含所有可用主题：

**旧版本兼容**
- `H5Dark:DarkGreen` - Legacy Dark Green
- `H5Dark:GoldenYellow` - Legacy Golden Yellow
- `H5Dark:BluePurple` - Legacy Blue Purple

**新版本主题** (37 套)
- `Layout2:DarkGreen` - Theme #1
- `Layout2:GoldenYellow` - Theme #2
- ...
- `Theme37` - Theme #37

#### 1.3 核心方法

```typescript
/**
 * 获取当前配置主题
 * @param from - 'router' | 'template'
 * @returns 完整的主题配置对象
 */
function getTheme(from: 'router' | 'template' = 'template')
```

**功能特性：**
- 支持测试主题配置（通过 sessionStorage）
- 自动合并活动配置、推广配置、主页配置
- 支持动态切换 homeType

---

### 2. 主题配置修改器 (`theme-modifier.ts`)

用于基于现有主题创建变体的工具类。

#### 2.1 核心 API

| 方法 | 描述 | 示例 |
|------|------|------|
| `modify()` | 修改组件属性 | `.modify('tabbar_inicio_Ranking', 'imageList[0].id', 3)` |
| `batchModify()` | 批量修改配置 | `.batchModify([{component: '...', property: '...', value: ...}])` |
| `modifyPath()` | 通过路径修改 | `.modifyPath('main.style.padding', '0 1rem')` |
| `modifyComponent()` | 替换整个组件 | `.modifyComponent('tabbar_inicio_Ranking', {...})` |
| `findAndModify()` | 条件查找修改 | `.findAndModify(finder, modifier)` |
| `getComponent()` | 获取组件配置 | `.getComponent('tabbar_inicio_Ranking', componentId)` |
| `build()` | 构建最终配置 | `.build()` |

#### 2.2 使用示例

```typescript
import { createThemeModifier } from './theme-modifier';
import goldshinGreenConfig from './first/goldshine-green';

// 创建新主题变体
const stellarDuskConfig = createThemeModifier(goldshinGreenConfig)
  .modify('tabbar_inicio_Ranking', 'imageList[0].id', 3)
  .modify('navbar_top_Inicio', 'style.height', '3.5rem')
  .build();

// 批量修改
const customTheme = createThemeModifier(goldshinGreenConfig)
  .batchModify([
    { component: 'tabbar_inicio_Ranking', property: 'imageList[0].id', value: 3 },
    { component: 'tabbar_tabBar', componentId: 2, property: 'imageList[0].id', value: 3 },
    { path: 'main.style.backgroundColor', value: '#1a1b26' }
  ])
  .build();
```

---

### 3. 图片资源配置 (`imgConfigs/index.ts`)

统一管理所有组件的图片资源和图标映射。

#### 3.1 配置结构

```typescript
{
  [组件名称]: {
    [版本号]: () => import('组件路径'),  // 组件导入
    icon1: {                             // 图标资源
      [变体ID]: 图片URL或函数
    },
    icon2: {...},
    // ...
  }
}
```

#### 3.2 特色功能

**平台图标雪碧图定位**
```typescript
platformImagePosition: Record<string, string> = {
  slots_cq9: 'background-position: 0 0',
  Tada: 'background-position: -100% 0',
  PP: 'background-position: -200% 0',
  // ...
}
```

**分类图标映射**
```typescript
categoryImagePosition: Record<string, string> = {
  ONE_API_HOT: 'background-position: 0 0',
  ELECTRONIC: 'background-position: -100% 0',
  // ...
}
```

**动态图片加载**
```typescript
icon1: {
  1: (key: PlatformType) => {
    const position = platformImagePosition[key]
    if (position) {
      const imageUrl = new URL('@/assets/img/inicio/platform1.png', import.meta.url)
      return `background-image: url(${imageUrl.href});${position}`
    }
    return ''
  }
}
```

---

### 4. 模板配置系统

#### 4.1 主页模板配置 (`templateConfigs/mainPage.ts`)

配置首页功能模板。

```typescript
type MainPageFeatures = 'RegisterReward';

type MainPageConfig = Partial<Record<MainPageFeatures, { template: string }>>;

// 主题与模板映射
const themeTemplateMap: Record<string, string> = {
  PhantomBlue: 'style_17',
  NeoBlue: 'style_18',
  RoyalAmethyst: 'style_18',
  // ...
};

// 导出配置
export const mainPageTemplateConfig: Record<string, MainPageConfig>
```

#### 4.2 推广页配置 (`templateConfigs/spread.ts`)

定义推广页各子页面的模板样式。

```typescript
type SpreadSubPageNames = {
  Index: string           // 推广首页
  Detail: string          // 详情页
  Subordinate: string     // 下级页面
  Commission: string      // 佣金页面
  Team: string            // 团队页面
  // ...
}

type SpreadSubPageConfig = {
  [key in keyof SpreadSubPageNames]: { template: string }
}
```

#### 4.3 活动配置 (`templateConfigs/activityConfig.ts`)

管理各活动页面的模板样式（具体实现需查看源码）。

---

### 5. 主题配置详解

每个主题配置文件导出两部分：

#### 5.1 `specialSkinSettings`

特殊皮肤设置，包含该主题独有的配置项。

```typescript
export const specialSkinSettings = {
  hotGameOptions: {
    logo1: getImageUrl('icons/hot-27.svg'),
  },
  gameSearchProps: {
    cardSize: 3
  }
}
```

#### 5.2 主配置对象

基于组件树结构的配置：

```typescript
export default {
  main: {
    children: [
      {
        position: 'tabs',      // 位置标识
        children: [
          {
            componentName: 'tabbar_tabBar',
            componentId: 1,
            layoutType: 'layout37',
            style: {
              '--tab-bar-height': '4.125rem',
            },
            children: [...]
          }
        ]
      },
      {
        position: 'other',
        children: [...]
      }
    ]
  },
  inicio: {
    children: [
      {
        position: 'header',
        children: [...]
      },
      {
        position: 'content',
        children: [...]
      }
    ]
  }
}
```

**组件配置属性：**
- `componentName` - 组件名称（对应 imgConfigs 中的键）
- `componentId` - 组件版本 ID
- `layoutType` - 布局类型标识
- `style` - CSS 样式对象（支持 CSS 变量）
- `imageList` - 图片资源列表
- `children` - 子组件配置数组
- `position` - 位置标识符

---

### 6. CSS 样式模块 (`modules/`)

#### 6.1 目录结构

```
modules/
├── default/
│   ├── blue-default.css
│   ├── green-default.css
│   ├── amber-purple.css
│   └── ...
├── first/
│   ├── neo-blue.css
│   ├── phantom-blue.css
│   ├── theme-37.css
│   └── ...
└── second/
    └── amber-purple.css
```

#### 6.2 CSS 变量系统 (`variables.css`)

全局 CSS 变量定义：

```css
:root {
  /* Ionic Color Variables */
  --ion-color-primary: #3880FF;
  --ion-color-primary-rgb: 56, 128, 255;
  --ion-color-primary-contrast: #ffffff;

  /* 自定义主题变量 */
  --ep-color-background-fill-body-default: ...;
  --ep-color-text-brand-primary: ...;
  --ep-border-radius-m: ...;
  --ep-font-size-xl: ...;
  /* ... */
}
```

---

## 主题系列分类

### Default 系列 (Theme #5-16)

| 编号 | 标识 | 主题色 | 首页类型 |
|------|------|--------|---------|
| #5 | Layout1:Blue | #090F1F | GameType |
| #6 | Layout1:Green | #2B4F14 | GameType |
| #7 | Layout1:BlueV01 | #090F1F | Platform |
| ... | ... | ... | ... |
| #16 | Layout1:AuroraYellow | #24221F | Platform |

**特点：**
- 使用 `default` 皮肤系列
- 支持 v01、v02 等首页版本
- 配置相对简洁

### First 系列 (Theme #1-3, #17-37)

| 编号 | 标识 | 主题色 | 首页类型 |
|------|------|--------|---------|
| #1 | Layout2:DarkGreen | #22262E | GameType |
| #2 | Layout2:GoldenYellow | #262624 | GameType |
| #3 | Layout2:BluePurple | #6526db | GameType |
| #17 | Layout2:PhantomBlue | #1a1f30 | Platform |
| #18 | Layout2:NeoBlue | #1d2a55 | Platform/GameType |
| ... | ... | ... | ... |
| #37 | Theme37 | #5B2875 | Platform |

**特点：**
- 使用 `first` 皮肤系列
- 大多数带有 `newSkin` 标识
- 配置更加复杂和灵活
- 支持更多自定义组件

### Second 系列 (Theme #4)

| 编号 | 标识 | 主题色 | 首页类型 |
|------|------|--------|---------|
| #4 | Layout3:AmberPurple | #262346 | GameType |

**特点：**
- 使用 `second` 皮肤系列
- 独特的 Layout3 布局

---

## 工作流程

```mermaid
graph TB
    A[应用启动] --> B[getTheme 获取主题配置]
    B --> C{检查测试主题?}
    C -->|是| D[使用 sessionStorage 配置]
    C -->|否| E[使用环境变量或租户配置]
    D --> F[加载主题配置对象]
    E --> F
    F --> G[合并 activityConfig]
    F --> H[合并 spreadConfig]
    F --> I[合并 mainPageConfig]
    G --> J[返回完整配置]
    H --> J
    I --> J
    J --> K[加载对应 CSS 模块]
    J --> L[渲染组件树]
    K --> M[应用样式]
    L --> M
    M --> N[主题加载完成]
```

---

## 开发指南

### 创建新主题

#### 方法 1: 基于现有主题修改

```typescript
// 1. 选择基础主题
import baseTheme from './first/neo-blue';
import { createThemeModifier } from './theme-modifier';

// 2. 使用修改器创建变体
export const specialSkinSettings = {
  // 特殊设置...
};

export default createThemeModifier(baseTheme)
  .batchModify([
    { component: 'tabbar_inicio_Ranking', property: 'imageList[0].id', value: 3 },
    { component: 'navbar_top_Inicio', property: 'style.height', value: '3.5rem' },
    { path: 'main.style.backgroundColor', value: '#1a1b26' }
  ])
  .build();
```

#### 方法 2: 完全自定义

```typescript
// 1. 创建配置文件 theme-38.ts
export const specialSkinSettings = {
  hotGameOptions: {
    logo1: getImageUrl('icons/hot-38.svg'),
  }
};

export default {
  main: {
    children: [
      // 完整的组件树配置...
    ]
  },
  inicio: {
    children: [
      // 完整的组件树配置...
    ]
  }
};

// 2. 在 hooks.ts 中注册
import firstTheme38 from '@/theme/configuration/first/theme-38';

export const themeConfig: Record<string, ThemeConfig> = {
  // ...
  'Theme38': {
    skin: 'first',
    theme: 'theme-38',
    color: '#123456',
    newSkin: 'new-skin-symbol',
    configuration: firstTheme38,
    specialSkinSettings: firstTheme38.specialSkinSettings,
    skinNumber: 'Theme #38',
    homeType: 'Platform'
  }
};

// 3. 创建对应 CSS 文件
// src/theme/modules/first/theme-38.css

// 4. 更新 imgConfigs 添加资源映射
```

### 主题测试

在浏览器控制台中：

```javascript
// 切换到测试主题
sessionStorage.setItem('testtheme', JSON.stringify({
  themeKey: 'Theme37',
  homeType: 'Platform'
}));

// 清除测试配置
sessionStorage.removeItem('testtheme');

// 刷新页面生效
location.reload();
```

---

## 最佳实践

### 1. 组件复用

优先使用已有组件配置，通过修改器进行微调：

```typescript
// ✅ 推荐
const newTheme = createThemeModifier(existingTheme)
  .modify('componentName', 'property', newValue)
  .build();

// ❌ 避免
const newTheme = {
  // 重复编写大量配置...
};
```

### 2. CSS 变量优先

使用 CSS 变量而非硬编码值：

```typescript
// ✅ 推荐
style: {
  '--tab-bar-height': '4.125rem',
  'background': 'var(--ep-color-background-fill-surface-raised-L1)'
}

// ❌ 避免
style: {
  height: '66px',
  background: '#1a1b26'
}
```

### 3. 图片资源管理

使用 `getImageUrl` 工具函数：

```typescript
// ✅ 推荐
imageList: [{
  name: 'icon1',
  id: 37  // 引用 imgConfigs 中定义的 ID
}]

// ❌ 避免
imageList: [{
  url: '/assets/img/inicio/icon.png'  // 硬编码路径
}]
```

### 4. 模块化组织

将相关配置分组：

```typescript
// ✅ 推荐
const headerConfig = {
  componentName: 'tabbar_layout_toolbar',
  children: [/* ... */]
};

const contentConfig = {
  componentName: 'tabbar_inicio_SwiperView',
  children: [/* ... */]
};

export default {
  inicio: {
    children: [
      { position: 'header', children: [headerConfig] },
      { position: 'content', children: [contentConfig] }
    ]
  }
};
```

---

## 常见问题

### Q: 如何快速找到某个组件的配置位置？

使用 `getComponent` 方法：

```typescript
const modifier = createThemeModifier(currentTheme);
const component = modifier.getComponent('tabbar_inicio_Ranking', 1);
console.log('组件配置:', component);
```

### Q: 主题配置中的 componentId 有什么作用？

`componentId` 用于区分同一组件的不同版本实现：

```typescript
{
  componentName: 'tabbar_tabBar',
  componentId: 1,  // 使用版本 1 的 tabBar 组件
  // ...
}
```

在 `imgConfigs/index.ts` 中对应：

```typescript
tabbar_tabBar: {
  1: () => import('@/views/tabbar/components/tabBar/components/colorWrap/index.vue'),
  2: () => import('@/views/tabbar/components/tabBar/components/imageWrap/index.vue'),
  // ...
}
```

### Q: layoutType 的作用是什么？

`layoutType` 用于标识组件使用的特定布局样式：

```typescript
{
  componentName: 'tabbar_tabBar',
  layoutType: 'layout37',  // 组件会应用 layout37 对应的样式
  // ...
}
```

### Q: 如何调试主题配置？

```typescript
// 1. 获取当前主题
const currentTheme = getTheme('template');
console.log('当前主题配置:', currentTheme);

// 2. 查看组件树
console.log('首页配置:', currentTheme.configuration.inicio);

// 3. 检查特殊设置
console.log('特殊设置:', currentTheme.specialSkinSettings);
```

---

## 性能优化建议

### 1. 按需加载组件

组件使用动态导入：

```typescript
{
  1: () => import('@/components/BonusPool/index.vue'),
  2: () => import('@/components/BonusPool/2/index.vue'),
}
```

### 2. 图片资源优化

- 使用雪碧图（Sprite）减少 HTTP 请求
- WebP 格式优先
- 懒加载非首屏图片

### 3. CSS 模块按需引入

根据当前主题只加载对应的 CSS 文件。

---

## 版本历史

| 版本 | 更新内容 | 日期 |
|------|---------|------|
| v3.0 | 新增 Theme #37，支持 layout37 布局 | 2026-01 |
| v2.5 | 新增 Theme #30-36 | 2025-12 |
| v2.0 | 重构主题系统，引入 theme-modifier | 2025-10 |
| v1.5 | 新增 First 系列主题 | 2025-08 |
| v1.0 | 初始版本，支持 Default 系列 | 2025-06 |

---

## 组件清单 (Component Reference)

本章节汇总了皮肤系统中所有使用的 `componentName` 组件（共 **88 个**），按功能分类整理。

### 组件统计概览

| 分类 | 组件数量 | 说明 |
|------|----------|------|
| 导航栏相关 | 4 | 底部主导航栏组件 |
| 侧边栏抽屉相关 | 14 | 左侧/右侧抽屉菜单组件 |
| 头部栏相关 | 8 | 顶部工具栏与标题栏 |
| 区段导航相关 | 5 | 内容区域分段导航 |
| 登录/用户相关 | 4 | 用户认证与余额展示 |
| 游戏相关 | 13 | 游戏列表、分类、平台等 |
| 内容区域相关 | 7 | 轮播、公告、排名等 |
| 页脚相关 | 5 | 底部信息区域 |
| 应用安装相关 | 4 | PWA 安装引导 |
| 特殊功能模块 | 9 | 奖金池、VIP、红包等 |
| 布局和辅助相关 | 10 | 布局容器与辅助组件 |
| **合计** | **88** | — |

### 组件层级关系图

```mermaid
graph TD
    subgraph Main["主布局 (Main)"]
        TabBar["tabbar_tabBar<br/>底部导航栏"]
        Drawer["drawer_*<br/>侧边栏抽屉"]
    end

    subgraph Inicio["首页 (Inicio)"]
        Header["头部区域"]
        Content["内容区域"]
        Footer["页脚区域"]
    end

    subgraph Header["头部区域 Components"]
        Toolbar["tabbar_layout_toolbar"]
        NavTop["navbar_top_Inicio"]
        Balance["tabbar_layout_header_balance"]
    end

    subgraph Content["内容区域 Components"]
        Swiper["tabbar_inicio_SwiperView"]
        GameList["tabbar_inicio_GameList"]
        Ranking["tabbar_inicio_Ranking"]
        Platform["tabbar_inicio_Platform"]
    end

    subgraph Drawer["侧边栏 Components"]
        DrawerUser["drawer_UserInfo"]
        DrawerNav["drawer_NavList"]
        DrawerFooter["drawer_Footer"]
    end

    Main --> Inicio
    Inicio --> Header
    Inicio --> Content
    Inicio --> Footer
    Main --> Drawer
```

### 按功能分类的组件详解

<details>
<summary><strong>1. 导航栏相关 (4个)</strong></summary>

| 组件名称 | 功能描述 |
|----------|----------|
| `tabbar_tabBar` | 底部主导航栏容器，支持多种布局样式 |
| `tabbar_tabBarList` | 导航栏选项列表 |
| `tabbar_tabBarItem` | 单个导航项（首页、活动、推广等） |
| `tabbar_tabBarItemIcon` | 导航项图标组件 |

</details>

<details>
<summary><strong>2. 侧边栏抽屉相关 (14个)</strong></summary>

| 组件名称 | 功能描述 |
|----------|----------|
| `drawer_layout` | 抽屉布局容器 |
| `drawer_UserInfo` | 用户信息展示区 |
| `drawer_UserAvatar` | 用户头像组件 |
| `drawer_UserBalance` | 余额显示 |
| `drawer_NavList` | 抽屉导航列表 |
| `drawer_NavItem` | 单个导航项 |
| `drawer_NavGroup` | 导航分组 |
| `drawer_QuickActions` | 快捷操作按钮组 |
| `drawer_Footer` | 抽屉底部区域 |
| `drawer_Settings` | 设置入口 |
| `drawer_Language` | 语言切换 |
| `drawer_Theme` | 主题切换 |
| `drawer_Logout` | 退出登录 |
| `drawer_Support` | 客服入口 |

</details>

<details>
<summary><strong>3. 头部栏相关 (8个)</strong></summary>

| 组件名称 | 功能描述 |
|----------|----------|
| `tabbar_layout_toolbar` | 主工具栏容器 |
| `navbar_top_Inicio` | 首页顶部导航栏 |
| `tabbar_layout_header` | 头部布局容器 |
| `tabbar_layout_header_balance` | 头部余额展示 |
| `tabbar_layout_header_logo` | 头部 Logo |
| `tabbar_layout_header_actions` | 头部操作按钮区 |
| `tabbar_layout_header_search` | 搜索入口 |
| `tabbar_layout_header_notification` | 通知入口 |

</details>

<details>
<summary><strong>4. 区段导航相关 (5个)</strong></summary>

| 组件名称 | 功能描述 |
|----------|----------|
| `tabbar_inicio_SectionNav` | 首页区段导航 |
| `tabbar_inicio_SectionNavItem` | 区段导航项 |
| `tabbar_inicio_SegmentBar` | 分段选择栏 |
| `tabbar_inicio_CategoryNav` | 游戏分类导航 |
| `tabbar_inicio_CategoryNavItem` | 分类导航项 |

</details>

<details>
<summary><strong>5. 登录/用户相关 (4个)</strong></summary>

| 组件名称 | 功能描述 |
|----------|----------|
| `tabbar_layout_login` | 登录按钮/入口 |
| `tabbar_layout_register` | 注册按钮/入口 |
| `tabbar_layout_loginRegister` | 登录注册组合组件 |
| `tabbar_layout_userCenter` | 用户中心入口 |

</details>

<details>
<summary><strong>6. 游戏相关 (13个)</strong></summary>

| 组件名称 | 功能描述 |
|----------|----------|
| `tabbar_inicio_GameList` | 游戏列表容器 |
| `tabbar_inicio_GameCard` | 游戏卡片 |
| `tabbar_inicio_GameGrid` | 游戏网格布局 |
| `tabbar_inicio_HotGame` | 热门游戏模块 |
| `tabbar_inicio_NewGame` | 新游戏模块 |
| `tabbar_inicio_RecentGame` | 最近玩过游戏 |
| `tabbar_inicio_FavoriteGame` | 收藏游戏 |
| `tabbar_inicio_Platform` | 游戏平台选择 |
| `tabbar_inicio_PlatformItem` | 平台选项 |
| `tabbar_inicio_GameCategory` | 游戏分类 |
| `tabbar_inicio_GameCategoryItem` | 分类项 |
| `tabbar_inicio_GameProvider` | 游戏供应商 |
| `tabbar_inicio_GameSearch` | 游戏搜索 |

</details>

<details>
<summary><strong>7. 内容区域相关 (7个)</strong></summary>

| 组件名称 | 功能描述 |
|----------|----------|
| `tabbar_inicio_SwiperView` | 轮播图/Banner 组件 |
| `tabbar_inicio_SwiperSlide` | 轮播项 |
| `tabbar_inicio_Marquee` | 跑马灯公告 |
| `tabbar_inicio_Notice` | 通知公告区 |
| `tabbar_inicio_Ranking` | 排行榜模块 |
| `tabbar_inicio_RankingItem` | 排行项 |
| `tabbar_inicio_LiveBet` | 实时投注展示 |

</details>

<details>
<summary><strong>8. 页脚相关 (5个)</strong></summary>

| 组件名称 | 功能描述 |
|----------|----------|
| `tabbar_inicio_Footer` | 首页页脚容器 |
| `tabbar_inicio_FooterLinks` | 页脚链接区 |
| `tabbar_inicio_FooterInfo` | 页脚信息区 |
| `tabbar_inicio_FooterLicense` | 许可证信息 |
| `tabbar_inicio_FooterPartners` | 合作伙伴展示 |

</details>

<details>
<summary><strong>9. 应用安装相关 (4个)</strong></summary>

| 组件名称 | 功能描述 |
|----------|----------|
| `tabbar_inicio_AppInstall` | 应用安装引导 |
| `tabbar_inicio_AppBanner` | 安装横幅 |
| `tabbar_inicio_AppDownload` | 下载按钮 |
| `tabbar_inicio_AppQRCode` | 下载二维码 |

</details>

<details>
<summary><strong>10. 特殊功能模块 (9个)</strong></summary>

| 组件名称 | 功能描述 |
|----------|----------|
| `tabbar_inicio_BonusPool` | 奖金池展示 |
| `tabbar_inicio_VipProgress` | VIP 进度条 |
| `tabbar_inicio_VipBanner` | VIP 横幅 |
| `tabbar_inicio_RedPacket` | 红包/活动入口 |
| `tabbar_inicio_DailyBonus` | 每日奖励 |
| `tabbar_inicio_Wheel` | 转盘活动 |
| `tabbar_inicio_Promotion` | 推广入口 |
| `tabbar_inicio_CustomerService` | 客服入口 |
| `tabbar_inicio_FloatButton` | 浮动按钮 |

</details>

<details>
<summary><strong>11. 布局和辅助相关 (10个)</strong></summary>

| 组件名称 | 功能描述 |
|----------|----------|
| `tabbar_layout_container` | 主布局容器 |
| `tabbar_layout_content` | 内容区容器 |
| `tabbar_layout_scrollView` | 滚动视图 |
| `tabbar_layout_refresher` | 下拉刷新 |
| `tabbar_layout_skeleton` | 骨架屏 |
| `tabbar_layout_loading` | 加载状态 |
| `tabbar_layout_empty` | 空状态 |
| `tabbar_layout_error` | 错误状态 |
| `tabbar_layout_modal` | 模态框 |
| `tabbar_layout_toast` | 轻提示 |

</details>

### 完整组件名称列表

以下是按字母顺序排列的所有 88 个 `componentName`：

```text
drawer_Footer               drawer_Language           drawer_layout
drawer_Logout               drawer_NavGroup           drawer_NavItem
drawer_NavList              drawer_QuickActions       drawer_Settings
drawer_Support              drawer_Theme              drawer_UserAvatar
drawer_UserBalance          drawer_UserInfo

navbar_top_Inicio

tabbar_inicio_AppBanner     tabbar_inicio_AppDownload
tabbar_inicio_AppInstall    tabbar_inicio_AppQRCode
tabbar_inicio_BonusPool     tabbar_inicio_CategoryNav
tabbar_inicio_CategoryNavItem tabbar_inicio_CustomerService
tabbar_inicio_DailyBonus    tabbar_inicio_FavoriteGame
tabbar_inicio_FloatButton   tabbar_inicio_Footer
tabbar_inicio_FooterInfo    tabbar_inicio_FooterLicense
tabbar_inicio_FooterLinks   tabbar_inicio_FooterPartners
tabbar_inicio_GameCard      tabbar_inicio_GameCategory
tabbar_inicio_GameCategoryItem tabbar_inicio_GameGrid
tabbar_inicio_GameList      tabbar_inicio_GameProvider
tabbar_inicio_GameSearch    tabbar_inicio_HotGame
tabbar_inicio_LiveBet       tabbar_inicio_Marquee
tabbar_inicio_NewGame       tabbar_inicio_Notice
tabbar_inicio_Platform      tabbar_inicio_PlatformItem
tabbar_inicio_Promotion     tabbar_inicio_Ranking
tabbar_inicio_RankingItem   tabbar_inicio_RecentGame
tabbar_inicio_RedPacket     tabbar_inicio_SectionNav
tabbar_inicio_SectionNavItem tabbar_inicio_SegmentBar
tabbar_inicio_SwiperSlide   tabbar_inicio_SwiperView
tabbar_inicio_VipBanner     tabbar_inicio_VipProgress
tabbar_inicio_Wheel

tabbar_layout_container     tabbar_layout_content
tabbar_layout_empty         tabbar_layout_error
tabbar_layout_header        tabbar_layout_header_actions
tabbar_layout_header_balance tabbar_layout_header_logo
tabbar_layout_header_notification tabbar_layout_header_search
tabbar_layout_loading       tabbar_layout_login
tabbar_layout_loginRegister tabbar_layout_modal
tabbar_layout_refresher     tabbar_layout_register
tabbar_layout_scrollView    tabbar_layout_skeleton
tabbar_layout_toast         tabbar_layout_toolbar
tabbar_layout_userCenter

tabbar_tabBar               tabbar_tabBarItem
tabbar_tabBarItemIcon       tabbar_tabBarList
```

### 组件命名规范

组件名称遵循以下命名约定：

```text
{模块}_{位置/类型}_{功能名称}
```

- **模块前缀**：
  - `tabbar_` - 主内容区组件
  - `drawer_` - 抽屉/侧边栏组件
  - `navbar_` - 导航栏组件

- **位置/类型**：
  - `layout_` - 布局相关
  - `inicio_` - 首页专用
  - `top_` - 顶部区域

- **功能名称**：采用 PascalCase，如 `GameList`、`UserInfo`


---
## 皮肤首页链接

30号:https://www.figma.com/design/oiScaytfefv61UYCnXHtwZ/%E9%BA%A6%E8%8A%BD%E7%BB%BF%EF%BC%8830%EF%BC%89malt-green?node-id=12001-32505&m=dev

31号:https://www.figma.com/design/E35Po42ez797kjea2dLwvq/%E7%9A%87%E5%AE%B6%E8%93%9D%EF%BC%8831%EF%BC%89Regal-Blue-variable-?node-id=10006-32606&m=dev

32号:https://www.figma.com/design/7xTd8oBVtvyJX1f0s6UyUY/%E5%B7%B4%E9%BB%8E%E7%B4%AB%EF%BC%8832%EF%BC%89Paris-Purple-variable-?node-id=10145-42873&m=dev

33号:https://www.figma.com/design/XCkDvg0Usfsfu8t1rQrMoD/%E7%A2%8E%E5%86%B0%E8%93%9D%EF%BC%8833%EF%BC%89Broken-Ice-Blue?node-id=17174-35008&m=dev

34号:https://www.figma.com/design/8gN7JjAg8YM3srba22jd0h/%E7%8E%89%E9%AB%93%E7%BB%BF%EF%BC%8834%EF%BC%89chalcedony-green?node-id=9163-26929&m=dev

35号:https://www.figma.com/design/dPUxiVtm3P5xhKXDDSW7LY/%E6%B5%85%E6%9D%8F%E9%BB%84%EF%BC%8835%EF%BC%89Light-apricot-variable-?node-id=20770-40329&m=dev

36号:https://www.figma.com/design/qlx8JbpRhKGXq8hsMZROoY/%E5%B8%9D%E9%87%91%E7%B4%AB%EF%BC%8836%EF%BC%89Royal-Amethyst-variable%EF%BC%89?node-id=16180-33156&m=dev

37号:https://www.figma.com/design/9DO3XawkVOsku1rYvMLmE3/%EF%BC%88%E5%BE%85%E4%BA%A4%E4%BB%98%EF%BC%89%E5%B9%BB%E5%85%89%E7%B4%AB%EF%BC%8837%EF%BC%89Aurora-Purple?node-id=15128-39800&m=dev




---

---

## 

## 相关链接

- [Milo-Lowcode 项目](../../milo-lowcode/)
- [主题配置示例](./configuration/first/)
- [组件库文档](../../components/)
- [API 文档](../../api/)

---


**文档维护：** 开发团队
**最后更新：** 2026-01-29
**文档版本：** v3.0
