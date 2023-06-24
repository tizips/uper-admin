export const Peoples: Record<string, string> = {
  child: '儿童',
  woman: '女性',
  man: '男性',
  adult: '成人',
  old: '老人',
  all: '全部',
  none: '无',
}

export const Levels: Record<number, string> = {
  1: '一级难度',
  2: '二级难度',
  3: '三级难度',
  4: '四级难度',
  5: '五级难度',
}

export const Types: Record<string, string> = {
  'self': '自研',
  'contract': '合同',
  'none': '无',
}

export const Statuses: Record<string, { label: string; color: string }> = {
  wait: {label: '待处理', color: '#f50'},
  process: {label: '处理中', color: '#87d068'},
  done: {label: '已完成', color: '#2db7f5'},
}

export const Enterprise: Record<string, string> = {
  'soe': '国企',
  'pe': '民营企业',
  'ad': '代理销售商',
  'other': '其他',
}

export const Objects: Record<string, string> = {
  'A': '0-5',
  'B': '5-10',
  'C': '10个以上',
}

export const Budgets: Record<string, string> = {
  'A': '1-500万',
  'B': '500-1000万',
  'C': '1000-5000万',
  'D': '5000万以上',
}

export const StatusesForContract: Record<string, string> = {
  'research': '调研',
  'quotation': '报价',
  'bidding': '招投标',
  'signed': '签署',
  'done': '签订',
  'stop': '终止',
}
