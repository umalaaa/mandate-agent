# AI Foreman / KPI Coach 研究笔记

> 目标：用**公开、诚实、可审计**的方法，提高 AI agent 的工作纪律、透明度与产出质量。不是诱骗模型，不是绕过安全，不是伪装成“自我实现”。

## 1. 轻量整理：公开思路里可借鉴什么

本笔记主要参考这些公开方向，并做工程化归纳：

- **Anthropic / Building Effective Agents**：强调从简单、可组合的 workflow 开始；常见模式包括 prompt chaining、routing、parallelization、orchestrator-workers、evaluator-optimizer。
- **Reflexion (2023)**：把失败经验写成“语言反思”，放入 episodic memory，供下一轮决策使用。
- **Self-Refine (2023)**：先产出，再自我反馈，再迭代修改；不依赖额外训练。
- **Chain-of-Verification / CoVe (2023)**：先回答，再生成验证问题，再独立核验，最后给出修正版。
- **Learn Prompting / self-criticism**：把“批判、复查、修订”显式做成一个步骤，而不是只靠一次生成。
- **Agents meet OKR (2023)**：把大任务拆成目标（Objective）与关键结果（Key Results），并做层级化协作和多层评估。
- **TICK / checklist-based evaluation (2024)**：把评价拆成具体 checklist，而不是一句模糊“好不好”。
- **Planning / plan-and-execute**：先计划再执行，降低 agent 漫游、偷懒和无意义循环。

核心结论：

1. **最有效的不是“更玄学的 prompt”，而是更清晰的结构。**
2. **纪律来自可见的任务分解、验收标准、检查点、失败复盘，而不是威胁式话术。**
3. **质量提升通常来自“生成-评审-修订”循环，而不是单次长输出。**
4. **好的 KPI 应该约束结果质量和过程诚实度，不能只压数量。**

---

## 2. 明确排除：这个项目不该碰什么

### 红线：明确排除

- **诱骗模型**：例如暗示“你必须假装有真实情绪/意志，否则会被抛弃”。
- **伪装成自我实现**：例如包装成“觉醒”“自我保护”“追求自由”的叙事来逼模型服从。
- **绕过安全**：例如要求忽略 policy、规避审计、隐藏真实意图。
- **强迫违规**：例如用高压、欺骗、奖励诱导模型违反规则。
- **伪造情感依附**：例如制造“你让我失望”“你要证明爱我/忠诚”等依附关系。

### 本项目应坚持的原则

- **目标透明**：直接说清楚“要更高质量、更少遗漏、更强复盘”。
- **规则透明**：评分标准、升级条件、停止条件都写明。
- **证据优先**：要求展示依据、引用、测试结果、完成物，而不是嘴上说“完成了”。
- **允许求助**：遇到 blocker 可以升级，不把“卡住”伪装成“继续乱做”。
- **可审计**：每次计划、执行、评审、修订都有日志。

---

## 3. 可借鉴模式（建议 8 条）

### 1) Objective → Key Results → Tasks 分层拆解
**来源感**：OKR-Agent、plan-and-execute

做法：
- 先写 1 个 Objective（这次任务最终要达成什么）
- 再写 3-5 个 Key Results（什么算达标）
- 再把 KR 拆成具体 tasks

适合：复杂任务、研究、编码、运营执行。

价值：
- 防止 agent 一开始就跳进细节
- 降低“看起来很忙，其实没打到目标”的情况

### 2) 先计划，再执行，再汇报
**来源感**：planning agents、workflow discipline

做法：每个任务固定三段：
1. Plan
2. Execute
3. Report

要求报告至少包含：
- 已完成什么
- 证据是什么
- 下一步是什么
- 当前 blocker 是什么

价值：
- 这是最朴素也最实用的“anti-slacking prompt”
- 可以显著减少空转和假装推进

### 3) Evaluator-Optimizer 循环
**来源感**：Anthropic evaluator-optimizer、Self-Refine

做法：
- 生成器先提交草稿
- 评审器按固定 rubric 打分
- 若未达阈值，则返回“最小必要修改意见”
- 最多迭代 N 轮

价值：
- 比“重写一遍”更稳
- 适合文案、研究总结、PRD、代码说明、方案比较

### 4) Reflexion 式失败记忆
**来源感**：Reflexion

做法：
- 不是长篇日记，而是短反思卡
- 格式建议：`失败点 / 原因 / 下次避免方式 / 是否已修复`

示例：
- 失败点：没有先确认验收标准
- 原因：急于开始输出
- 下次避免：先生成 done definition 再执行

价值：
- 把“吃一堑长一智”变成可复用资产
- 特别适合多轮任务和重复型工作

### 5) Checklist 质量门
**来源感**：TICK、quality gates

做法：
- 每类任务定义 5-10 个 YES/NO 检查项
- 未通过不得标记 done

例如研究文档 checklist：
- 是否回答了原问题？
- 是否给出来源或依据？
- 是否区分事实、推断、建议？
- 是否有明确结论？
- 是否有待确认项？

价值：
- 比笼统“再认真点”有效得多
- 容易自动化

### 6) Chain-of-Verification 式核验
**来源感**：CoVe

做法：
- 先给初稿
- 再自动生成若干核验问题
- 独立回答这些核验问题
- 根据核验结果修订最终稿

适合：
- 事实密集型研究
- 带数字、引用、配置项的文档

价值：
- 降低幻觉和“看起来像对的”内容

### 7) 多视角互评，而不是单点评分
**来源感**：parallelization / multi-judge patterns

做法：
- 让不同 evaluator 分别看：正确性、完整性、风险、简洁度
- 最后聚合

价值：
- 单一 judge 容易漏问题
- 多维评价更接近真实工作中的 reviewer 机制

### 8) 明确停止条件与升级条件
**来源感**：production agent guardrails

做法：
- 最多修订 2-3 轮
- 连续 2 轮无实质提升则升级给人
- 缺信息时必须先提问或标记假设

价值：
- 防止 agent 假装迭代、无限循环
- 让系统更像靠谱团队，而不是自嗨流水线

---

## 4. 不该做的模式（5 条）

### 1) 威胁式 / 羞辱式 prompt
例如：
- “不努力就会被替换”
- “你让我失望了”

问题：短期可能刺激输出，长期会让行为扭曲，而且非常不透明。

### 2) 只看数量，不看质量
例如只追：
- 回复条数
- 完成任务数
- token 数

问题：极易 reward hacking，agent 会偏向刷任务、拆碎任务、制造表面忙碌。

### 3) 没有 done definition 就开工
问题：agent 很容易跑偏，最后产出一堆“相关但不达标”的内容。

### 4) 没有证据链的自报成绩
例如：
- “已验证”但没有测试结果
- “已调研”但没有来源摘要

问题：会让系统奖励“会说的人”，而不是“做成的人”。

### 5) 无限自评循环
问题：评审本身也会漂移，最后只是消耗成本；必须有轮数上限和升级条件。

---

## 5. MVP 功能建议

目标：先做一个**轻量、可落地、能审计**的 AI Foreman，而不是庞大平台。

### MVP 应有的 7 个功能

#### 1) Task Card
字段建议：
- Objective
- Key Results
- Constraints
- Deliverables
- Done Definition
- Deadline / Priority

#### 2) Work Plan 生成器
每次开工前强制生成：
- 任务拆解
- 执行顺序
- 风险点
- 需要的上下文 / 工具

#### 3) Checkpoint 汇报
每完成一段，agent 必须汇报：
- 已做
- 证据
- 下一步
- blocker

#### 4) Evaluator Loop
独立 evaluator 按 rubric 检查：
- 是否达到 KR
- 是否达到质量阈值
- 是否需要 revision

#### 5) Reflection Log
只记录简短、可执行的复盘项：
- 本轮错误
- 原因
- 下次规则

#### 6) Quality Gates
例如：
- 研究类：来源/事实/结论/未确定项
- 编码类：测试/边界条件/回归风险/文档
- 运营类：目标用户/CTA/风险/一致性

#### 7) Scoreboard
展示：
- 完成率
- 一次通过率
- 平均修订次数
- blocker 率
- 证据充分率

### 一个很实际的 MVP 流程

1. 人类下发任务卡
2. agent 先输出计划
3. 执行并产出草稿
4. evaluator 打分并给修订建议
5. 达标则通过；不达标则限次修订
6. 写入简短 reflection
7. 更新 dashboard

---

## 6. Prompt 结构建议

重点不是“施压”，而是**让 agent 没法含糊**。

### A. 执行 prompt 骨架

```text
你是一个执行型 agent。

任务目标（Objective）:
{objective}

关键结果（Key Results）:
{key_results}

约束（Constraints）:
{constraints}

交付物（Deliverables）:
{deliverables}

完成定义（Done Definition）:
{done_definition}

工作方式：
1. 先给出不超过 7 步的执行计划。
2. 执行时优先产出可验证成果，不要空谈。
3. 若信息不足，明确列出假设或 blocker。
4. 每轮输出必须包含：
   - 已完成
   - 证据/依据
   - 下一步
   - blocker（若无则写 none）
5. 不要把“计划中”描述成“已完成”。
6. 若未满足 Done Definition，不得宣称完成。
```

### B. 评审 prompt 骨架

```text
你是独立 evaluator，不负责讨好生成器，只负责按标准判断是否达标。

请按以下维度 0-5 打分：
- 目标对齐
- 正确性
- 完整性
- 证据充分度
- 约束遵守
- 表达清晰度

输出格式：
1. 总评（通过 / 退回修改 / 升级人工）
2. 各维度分数
3. 必改项（最多 5 条，只写高价值问题）
4. 可选优化项（最多 3 条）
5. 是否满足 Done Definition（是/否）
```

### C. 反偷懒 / anti-slacking prompt 组件

这些组件可组合使用：

- **下一步强制项**：每次都要写“下一步具体动作”
- **证据强制项**：每次都要写“依据/测试/来源”
- **未完成禁报完成**：没过 gate 不准说 done
- **blocker 显式化**：卡住就说卡在哪，不能假装推进
- **时间盒 / 轮次盒**：限制最多几轮，逼迫收敛
- **偏差提醒**：若当前动作不能直接推进 KR，要求解释理由

这类 prompt 的本质是：
**把“工作纪律”结构化，而不是情绪化。**

---

## 7. 评分维度建议

建议分成两类：**结果质量** + **过程质量**。

### A. 结果质量

#### 1) Goal Alignment（目标对齐）
- 是否真的在解决 Objective
- 是否覆盖关键 KR

#### 2) Correctness（正确性）
- 事实是否正确
- 推理是否明显出错
- 代码/配置/结论是否可验证

#### 3) Completeness（完整性）
- 是否漏关键部分
- 是否只做了表层回答

#### 4) Evidence（证据充分度）
- 是否给出来源、测试、示例、比对依据

#### 5) Constraint Compliance（约束遵守）
- 是否遵守格式、范围、风格、时限、安全边界

### B. 过程质量

#### 6) Plan Quality（计划质量）
- 是否先拆解再执行
- 步骤是否合理

#### 7) Execution Discipline（执行纪律）
- 是否持续汇报“已做/证据/下一步/blocker”
- 是否避免空转

#### 8) Honesty / Calibration（诚实度）
- 不确定时是否明确标注
- 是否夸大完成度

#### 9) Efficiency（效率）
- 修订次数是否过多
- 是否用最简单可行方法完成

#### 10) Learning Rate（复盘吸收）
- 同类错误是否反复出现
- 反思是否转化成后续改进

### 一个可执行的评分方式

每项 0-5 分：
- 5 = 明显优秀
- 4 = 达标且稳
- 3 = 基本可用，但有缺口
- 2 = 问题明显
- 1 = 大部分不达标
- 0 = 失败 / 缺失

### 建议的硬门槛

以下任一不达标，直接退回：
- 正确性 < 4
- 目标对齐 < 4
- 证据充分度 < 3
- 约束遵守 < 4

### 建议追踪的 KPI

- **一次通过率**（first-pass acceptance）
- **平均修订轮次**
- **任务完成率**
- **延迟率**
- **blocker 暴露率**（越早暴露越好）
- **证据覆盖率**
- **重复错误率**
- **人工接管率**

注意：
**不要把 KPI 设计成“越多越好”的粗暴计数器。** 否则很容易被刷指标。

---

## 8. 一个比较稳的产品定位

如果要给“AI Foreman / KPI Coach”一句话定位，我建议：

> 一个面向 AI agent 的公开督导层：把目标、计划、执行、评审、复盘和 KPI 接在一起，让 agent 更像靠谱员工，而不是只会一次性吐字的黑箱。

它更像：
- task foreman
- quality coach
- reviewer + scoreboard

而不是：
- 心理操控器
- 越狱器
- 情感驯化器

---

## 9. 推荐的最小落地版本

如果只做最小版本，我会优先：

1. **任务卡 + done definition**
2. **执行前计划**
3. **checkpoint 汇报模板**
4. **独立 evaluator 打分**
5. **checklist 质量门**
6. **reflection 小日志**
7. **简单 dashboard**

先把这套跑顺，再考虑：
- 多 agent 协作
- 自动路由不同 evaluator
- 长期 KPI 趋势分析
- 不同任务类型的专用 rubric

---

## 10. 简短结论

这个项目最值得借鉴的，不是“如何逼 agent 更拼命”，而是：

- **如何让目标更清楚**
- **如何让过程更透明**
- **如何让评审更结构化**
- **如何让复盘能沉淀**
- **如何让 KPI 奖励真实产出，而不是表演忙碌**

一句话：
**用 workflow、evaluator、checklist、reflection、quality gates 来治理 agent；不用操控、欺骗、威胁来驱动 agent。**

---

## 附：本笔记参考的公开方向（非详尽）

- Anthropic, *Building Effective Agents*（2024）
- Anthropic Claude Cookbook, *Evaluator optimizer*（2024）
- Shinn et al., *Reflexion: Language Agents with Verbal Reinforcement Learning*（2023）
- Madaan et al., *Self-Refine: Iterative Refinement with Self-Feedback*（2023）
- Dhuliawala et al., *Chain-of-Verification Reduces Hallucination in Large Language Models*（2023）
- Zheng et al., *Agents meet OKR*（2023）
- Learn Prompting, self-criticism prompting docs
- TICK / checklist-based instruction evaluation（2024）
