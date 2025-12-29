
export const HEAVENLY_STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
export const EARTHLY_BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;

export type HeavenlyStem = typeof HEAVENLY_STEMS[number];
export type EarthlyBranch = typeof EARTHLY_BRANCHES[number];

export const TWO_HOUR_PERIODS = [
  { name: "子时", hours: [23, 0], zhiIndex: 0, meridian: "足少阳胆经", organ: "胆", function: "藏精夜作，养肝胆" },
  { name: "丑时", hours: [1, 2], zhiIndex: 1, meridian: "足厥阴肝经", organ: "肝", function: "肝藏血，疏泄调达" },
  { name: "寅时", hours: [3, 4], zhiIndex: 2, meridian: "手太阴肺经", organ: "肺", function: "肺主气、呼吸最畅" },
  { name: "卯时", hours: [5, 6], zhiIndex: 3, meridian: "手阳明大肠经", organ: "大肠", function: "排便通畅最佳时机" },
  { name: "辰时", hours: [7, 8], zhiIndex: 4, meridian: "足阳明胃经", organ: "胃", function: "消化吸收能力最强" },
  { name: "巳时", hours: [9, 10], zhiIndex: 5, meridian: "足太阴脾经", organ: "脾", function: "运化水谷、升清降浊" },
  { name: "午时", hours: [11, 12], zhiIndex: 6, meridian: "手少阴心经", organ: "心", function: "心主神明，主血脉" },
  { name: "未时", hours: [13, 14], zhiIndex: 7, meridian: "手太阳小肠经", organ: "小肠", function: "分清泌浊，吸收营养" },
  { name: "申时", hours: [15, 16], zhiIndex: 8, meridian: "足太阳膀胱经", organ: "膀胱", function: "排毒排尿能力最强" },
  { name: "酉时", hours: [17, 18], zhiIndex: 9, meridian: "足少阴肾经", organ: "肾", function: "藏精主骨，调节水液" },
  { name: "戌时", hours: [19, 20], zhiIndex: 10, meridian: "手厥阴心包经", organ: "心包", function: "心的保护系统，安神" },
  { name: "亥时", hours: [21, 22], zhiIndex: 11, meridian: "手少阳三焦经", organ: "三焦", function: "通调水道，调节气化" },
] as const;

export const FIVE_ELEMENTS = {
  甲: "wood",
  乙: "wood",
  丙: "fire",
  丁: "fire",
  戊: "earth",
  己: "earth",
  庚: "metal",
  辛: "metal",
  壬: "water",
  癸: "water",
  子: "water",
  亥: "water",
  寅: "wood",
  卯: "wood",
  巳: "fire",
  午: "fire",
  申: "metal",
  酉: "metal",
  丑: "earth",
  辰: "earth",
  未: "earth",
  戌: "earth",
} as const;

export const ELEMENT_RELATIONS = {
  wood: { generates: "fire", defeats: "earth", name: "木", color: "emerald", label: "Wood" },
  fire: { generates: "earth", defeats: "metal", name: "火", color: "rose", label: "Fire" },
  earth: { generates: "metal", defeats: "water", name: "土", color: "amber", label: "Earth" }, // Changed brown to amber for Tailwind
  metal: { generates: "water", defeats: "wood", name: "金", color: "yellow", label: "Metal" }, // Changed gold to yellow
  water: { generates: "wood", defeats: "fire", name: "水", color: "blue", label: "Water" },
} as const;

export type ElementType = keyof typeof ELEMENT_RELATIONS;
