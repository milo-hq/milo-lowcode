# 可学习式低代码

## 建立figma数据结构与本地数据结构关系
./types.ts为基本数据类型

### 主项目关联
主项目为
假设 appdir = /Users/arthur/Documents/GitHub/star/app
那么其中皮肤相关配置在  appdir/src/theme
每套皮肤的具体配置数据在 appdir/src/theme/configuration 中

梳理总结主项目中皮肤相关模块功能

### 执行步骤
Step 1.1：Figma 原始结构 → SkinFigmaIR（标准化 IR）

做的事情：
	1.	读取目标URL的 Figma metadata
	2.	生成 sections（先用 MVP：根 frame 的一级 children）
	3.	每个 section 计算 fingerprint

输出就是：
	•	SkinFigmaIR（root + sections + fingerprint）
