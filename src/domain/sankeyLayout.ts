import type { CategoryBreakdownItem } from './insightsEngine';

export const SANKEY_VIEW_WIDTH = 860;
export const SANKEY_VIEW_HEIGHT = 360;

export type SankeyNodeKind = 'income' | 'deficit' | 'hub' | 'savings' | 'expense';

export interface SankeyNode {
  id: string;
  label: string;
  amount: number;
  percentage: number;
  color: string;
  column: 'left' | 'center' | 'right';
  kind: SankeyNodeKind;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SankeyLink {
  id: string;
  sourceId: string;
  targetId: string;
  sourceLabel: string;
  targetLabel: string;
  amount: number;
  percentage: number;
  color: string;
  path: string;
}

export interface CashflowSankeyLayout {
  hubTotal: number;
  leftNodes: SankeyNode[];
  centerNode: SankeyNode | null;
  rightNodes: SankeyNode[];
  links: SankeyLink[];
}

interface RawSankeyBucket {
  id: string;
  label: string;
  amount: number;
  color: string;
  kind: SankeyNodeKind;
}

const PAD_TOP = 36;
const PAD_BOTTOM = 20;
const USABLE_HEIGHT = SANKEY_VIEW_HEIGHT - PAD_TOP - PAD_BOTTOM;
const NODE_WIDTH = 16;
const NODE_GAP = 14;
const LEFT_X = 186;
const CENTER_X = 422;
const RIGHT_X = 658;
const MAX_LEFT_CATEGORIES = 5;
const MAX_RIGHT_EXPENSES = 6;

function roundPct(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((part / total) * 1000) / 10;
}

function buildTopBuckets(
  items: CategoryBreakdownItem[],
  maxCategories: number,
  overflowId: string,
  overflowLabel: string,
  kind: 'income' | 'expense'
): RawSankeyBucket[] {
  const positive = items.filter((item) => item.amount > 0);
  if (positive.length <= maxCategories) {
    return positive.map((item) => ({
      id: `${kind}-${item.categoryId}`,
      label: item.categoryName,
      amount: item.amount,
      color: item.color,
      kind,
    }));
  }

  const head = positive.slice(0, maxCategories - 1).map((item) => ({
    id: `${kind}-${item.categoryId}`,
    label: item.categoryName,
    amount: item.amount,
    color: item.color,
    kind,
  }));

  const overflowAmount = positive
    .slice(maxCategories - 1)
    .reduce((acc, item) => acc + item.amount, 0);

  if (overflowAmount > 0) {
    head.push({
      id: overflowId,
      label: overflowLabel,
      amount: overflowAmount,
      color: '#94A3B8',
      kind,
    });
  }

  return head;
}

function layoutColumnNodes(
  buckets: RawSankeyBucket[],
  column: 'left' | 'right',
  x: number,
  hubTotal: number
): SankeyNode[] {
  if (buckets.length === 0 || hubTotal <= 0) return [];

  const totalAmount = buckets.reduce((sum, b) => sum + b.amount, 0);
  const gapTotal = Math.max(0, (buckets.length - 1) * NODE_GAP);
  const maxContentHeight = Math.max(40, USABLE_HEIGHT - gapTotal);
  const minNodeH = Math.min(10, Math.floor(maxContentHeight / buckets.length));

  const proportional = buckets.map((b) =>
    totalAmount > 0 ? Math.max(minNodeH, (b.amount / totalAmount) * maxContentHeight) : minNodeH
  );
  const rawHeightSum = proportional.reduce((sum, h) => sum + h, 0);
  const scale = rawHeightSum > maxContentHeight ? maxContentHeight / rawHeightSum : 1;
  const heights = proportional.map((h) => h * scale);

  const stackHeight = heights.reduce((sum, h) => sum + h, 0) + gapTotal;
  let cursorY = PAD_TOP + (USABLE_HEIGHT - stackHeight) / 2;

  return buckets.map((b, idx) => {
    const height = heights[idx] ?? minNodeH;
    const node: SankeyNode = {
      id: b.id,
      label: b.label,
      amount: b.amount,
      percentage: roundPct(b.amount, hubTotal),
      color: b.color,
      column,
      kind: b.kind,
      x,
      y: cursorY,
      width: NODE_WIDTH,
      height,
    };
    cursorY += height + NODE_GAP;
    return node;
  });
}

function createRibbonPath(
  x0: number,
  y0Top: number,
  y0Bottom: number,
  x1: number,
  y1Top: number,
  y1Bottom: number
): string {
  const mx = (x0 + x1) / 2;
  return [
    `M ${x0.toFixed(1)} ${y0Top.toFixed(1)}`,
    `C ${mx.toFixed(1)} ${y0Top.toFixed(1)}, ${mx.toFixed(1)} ${y1Top.toFixed(1)}, ${x1.toFixed(1)} ${y1Top.toFixed(1)}`,
    `L ${x1.toFixed(1)} ${y1Bottom.toFixed(1)}`,
    `C ${mx.toFixed(1)} ${y1Bottom.toFixed(1)}, ${mx.toFixed(1)} ${y0Bottom.toFixed(1)}, ${x0.toFixed(1)} ${y0Bottom.toFixed(1)}`,
    'Z',
  ].join(' ');
}

export function buildCashflowSankeyData(input: {
  incomeByCategory: CategoryBreakdownItem[];
  expenseByCategory: CategoryBreakdownItem[];
  totalIncome: number;
  totalExpense: number;
}): CashflowSankeyLayout {
  const safeIncome = Math.max(0, input.totalIncome);
  const safeExpense = Math.max(0, input.totalExpense);

  if (safeIncome <= 0 && safeExpense <= 0) {
    return {
      hubTotal: 0,
      leftNodes: [],
      centerNode: null,
      rightNodes: [],
      links: [],
    };
  }

  const hubTotal = Math.max(safeIncome, safeExpense);

  const leftBuckets = buildTopBuckets(
    input.incomeByCategory,
    MAX_LEFT_CATEGORIES,
    'income-overflow',
    'Pemasukan Lainnya',
    'income'
  );

  if (leftBuckets.length === 0 && safeIncome > 0) {
    leftBuckets.push({
      id: 'income-total',
      label: 'Total Pemasukan',
      amount: safeIncome,
      color: '#10B981',
      kind: 'income',
    });
  }

  if (safeExpense > safeIncome) {
    leftBuckets.push({
      id: 'deficit-draw',
      label: 'Tarik Saldo (Defisit)',
      amount: safeExpense - safeIncome,
      color: '#D97706',
      kind: 'deficit',
    });
  }

  const rightBuckets: RawSankeyBucket[] = [];
  if (safeIncome > safeExpense) {
    rightBuckets.push({
      id: 'net-savings',
      label: 'Tabungan / Sisa Bersih',
      amount: safeIncome - safeExpense,
      color: '#10B981',
      kind: 'savings',
    });
  }

  const expenseBuckets = buildTopBuckets(
    input.expenseByCategory,
    MAX_RIGHT_EXPENSES,
    'expense-overflow',
    'Pengeluaran Lainnya',
    'expense'
  );

  if (expenseBuckets.length === 0 && safeExpense > 0) {
    expenseBuckets.push({
      id: 'expense-total',
      label: 'Total Pengeluaran',
      amount: safeExpense,
      color: '#E11D48',
      kind: 'expense',
    });
  }

  rightBuckets.push(...expenseBuckets);

  const leftNodes = layoutColumnNodes(leftBuckets, 'left', LEFT_X, hubTotal);
  const rightNodes = layoutColumnNodes(rightBuckets, 'right', RIGHT_X, hubTotal);

  const centerHeight = Math.min(USABLE_HEIGHT - 16, 224);
  const centerY = PAD_TOP + (USABLE_HEIGHT - centerHeight) / 2;

  const centerNode: SankeyNode = {
    id: 'cashflow-hub',
    label: 'Total Arus Kas',
    amount: hubTotal,
    percentage: 100,
    color: '#059669',
    column: 'center',
    kind: 'hub',
    x: CENTER_X,
    y: centerY,
    width: NODE_WIDTH,
    height: centerHeight,
  };

  const links: SankeyLink[] = [];

  const leftTotal = leftNodes.reduce((sum, n) => sum + n.amount, 0) || hubTotal;
  let centerLeftCursor = centerNode.y;
  for (const node of leftNodes) {
    const sliceHeight = centerNode.height * (node.amount / leftTotal);
    const y1Top = centerLeftCursor;
    const y1Bottom = centerLeftCursor + sliceHeight;
    centerLeftCursor = y1Bottom;

    links.push({
      id: `link-${node.id}-to-hub`,
      sourceId: node.id,
      targetId: centerNode.id,
      sourceLabel: node.label,
      targetLabel: centerNode.label,
      amount: node.amount,
      percentage: node.percentage,
      color: node.color,
      path: createRibbonPath(
        node.x + node.width,
        node.y,
        node.y + node.height,
        centerNode.x,
        y1Top,
        y1Bottom
      ),
    });
  }

  const rightTotal = rightNodes.reduce((sum, n) => sum + n.amount, 0) || hubTotal;
  let centerRightCursor = centerNode.y;
  for (const node of rightNodes) {
    const sliceHeight = centerNode.height * (node.amount / rightTotal);
    const y0Top = centerRightCursor;
    const y0Bottom = centerRightCursor + sliceHeight;
    centerRightCursor = y0Bottom;

    links.push({
      id: `link-hub-to-${node.id}`,
      sourceId: centerNode.id,
      targetId: node.id,
      sourceLabel: centerNode.label,
      targetLabel: node.label,
      amount: node.amount,
      percentage: node.percentage,
      color: node.color,
      path: createRibbonPath(
        centerNode.x + centerNode.width,
        y0Top,
        y0Bottom,
        node.x,
        node.y,
        node.y + node.height
      ),
    });
  }

  return {
    hubTotal,
    leftNodes,
    centerNode,
    rightNodes,
    links,
  };
}
