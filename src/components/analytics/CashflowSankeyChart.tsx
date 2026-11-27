'use client';

import * as React from 'react';
import { ChartContainerCard } from '@/components/shared/ChartContainerCard';
import type { CategoryBreakdownItem } from '@/domain/insightsEngine';
import { formatCompactIdr, formatIdr } from '@/domain/money';
import {
  buildCashflowSankeyData,
  SANKEY_VIEW_HEIGHT,
  SANKEY_VIEW_WIDTH,
  type SankeyLink,
  type SankeyNode,
} from '@/domain/sankeyLayout';

interface ActiveFlowInfo {
  title: string;
  amount: number;
  percentage: number;
  linkId?: string;
  nodeId?: string;
}

function truncateLabel(label: string, maxLength = 21): string {
  if (label.length <= maxLength) return label;
  return `${label.slice(0, maxLength - 1)}…`;
}

export function CashflowSankeyChart({
  incomeByCategory,
  expenseByCategory,
  totalIncome,
  totalExpense,
  loading = false,
  masked = false,
}: {
  incomeByCategory: CategoryBreakdownItem[];
  expenseByCategory: CategoryBreakdownItem[];
  totalIncome: number;
  totalExpense: number;
  loading?: boolean;
  masked?: boolean;
}) {
  const layout = React.useMemo(
    () =>
      buildCashflowSankeyData({
        incomeByCategory,
        expenseByCategory,
        totalIncome,
        totalExpense,
      }),
    [incomeByCategory, expenseByCategory, totalIncome, totalExpense]
  );

  const [activeFlow, setActiveFlow] = React.useState<ActiveFlowInfo | null>(null);

  const handleLinkActivate = (link: SankeyLink) => {
    setActiveFlow({
      title: `${link.sourceLabel} → ${link.targetLabel}`,
      amount: link.amount,
      percentage: link.percentage,
      linkId: link.id,
    });
  };

  const handleNodeActivate = (node: SankeyNode) => {
    setActiveFlow({
      title: node.label,
      amount: node.amount,
      percentage: node.percentage,
      nodeId: node.id,
    });
  };

  const isEmpty = !layout.centerNode || layout.hubTotal <= 0;

  return (
    <ChartContainerCard
      title="Aliran Arus Kas (Sankey Diagram)"
      subtitle="Distribusi sumber pemasukan menuju tabungan dan pos pengeluaran pada periode terpilih"
      loading={loading}
      isEmpty={isEmpty}
      emptyMessage="Belum ada pemasukan atau pengeluaran pada periode ini untuk membentuk aliran Sankey."
      heightClass={loading || isEmpty ? 'h-[320px]' : 'min-h-[360px]'}
    >
      <div className="space-y-3">
        {/* Interactive Detail Strip */}
        <div
          aria-live="polite"
          className="rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs"
        >
          {activeFlow ? (
            <>
              <span className="font-semibold text-[var(--text-primary)]">{activeFlow.title}</span>
              <span className="tabular-nums font-semibold text-[var(--accent-primary)]">
                {masked ? 'Rp •••••••' : formatIdr(activeFlow.amount)} (
                {activeFlow.percentage.toLocaleString('id-ID')}%)
              </span>
            </>
          ) : (
            <span className="text-[var(--text-secondary)]">
              Arahkan kursor atau klik aliran untuk melihat rincian nominal
            </span>
          )}
        </div>

        {/* Scrollable SVG Canvas */}
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${SANKEY_VIEW_WIDTH} ${SANKEY_VIEW_HEIGHT}`}
            className="min-w-[640px] w-full h-auto select-none"
            role="img"
            aria-label="Diagram Sankey aliran arus kas"
          >
            {/* Column Header Labels */}
            <text
              x={186}
              y={16}
              textAnchor="end"
              fill="var(--text-secondary)"
              fontSize={11}
              fontWeight={600}
            >
              SUMBER DANA
            </text>
            {layout.centerNode ? (
              <text
                x={layout.centerNode.x + layout.centerNode.width / 2}
                y={16}
                textAnchor="middle"
                fill="var(--text-primary)"
                fontSize={11}
                fontWeight={700}
              >
                TOTAL ARUS KAS ({masked ? 'Rp •••' : formatCompactIdr(layout.hubTotal)})
              </text>
            ) : null}
            <text
              x={674}
              y={16}
              textAnchor="start"
              fill="var(--text-secondary)"
              fontSize={11}
              fontWeight={600}
            >
              ALOKASI &amp; PENGELUARAN
            </text>

            {/* Cubic Bezier Flow Ribbons */}
            <g>
              {layout.links.map((link) => {
                const isSelected =
                  activeFlow?.linkId === link.id ||
                  activeFlow?.nodeId === link.sourceId ||
                  activeFlow?.nodeId === link.targetId;
                const isDimmed = Boolean(activeFlow) && !isSelected;

                return (
                  <path
                    key={link.id}
                    d={link.path}
                    fill={link.color}
                    fillOpacity={isSelected ? 0.62 : isDimmed ? 0.14 : 0.34}
                    stroke={isSelected ? link.color : 'none'}
                    strokeWidth={isSelected ? 1 : 0}
                    tabIndex={0}
                    role="button"
                    aria-label={`${link.sourceLabel} ke ${link.targetLabel}: ${
                      masked ? 'Nominal disembunyikan' : formatIdr(link.amount)
                    }`}
                    className="transition-opacity duration-150 cursor-pointer focus:outline-none"
                    onMouseEnter={() => handleLinkActivate(link)}
                    onMouseLeave={() => setActiveFlow(null)}
                    onFocus={() => handleLinkActivate(link)}
                    onBlur={() => setActiveFlow(null)}
                    onClick={() => handleLinkActivate(link)}
                  />
                );
              })}
            </g>

            {/* Left Column Nodes */}
            {layout.leftNodes.map((node) => {
              const midY = node.y + node.height / 2;
              const isHighlighted = activeFlow?.nodeId === node.id;
              return (
                <g
                  key={node.id}
                  tabIndex={0}
                  role="button"
                  aria-label={`${node.label}: ${
                    masked ? 'Nominal disembunyikan' : formatIdr(node.amount)
                  }`}
                  className="cursor-pointer focus:outline-none"
                  onMouseEnter={() => handleNodeActivate(node)}
                  onMouseLeave={() => setActiveFlow(null)}
                  onFocus={() => handleNodeActivate(node)}
                  onBlur={() => setActiveFlow(null)}
                  onClick={() => handleNodeActivate(node)}
                >
                  <rect
                    x={node.x}
                    y={node.y}
                    width={node.width}
                    height={node.height}
                    rx={4}
                    fill={node.color}
                    opacity={isHighlighted ? 1 : 0.92}
                  />
                  <text
                    x={node.x - 10}
                    y={midY - 3}
                    textAnchor="end"
                    fill="var(--text-primary)"
                    fontSize={12}
                    fontWeight={600}
                  >
                    {truncateLabel(node.label)}
                  </text>
                  <text
                    x={node.x - 10}
                    y={midY + 12}
                    textAnchor="end"
                    fill="var(--text-secondary)"
                    fontSize={11}
                  >
                    {masked ? 'Rp •••••••' : formatCompactIdr(node.amount)} (
                    {node.percentage.toLocaleString('id-ID')}%)
                  </text>
                </g>
              );
            })}

            {/* Center Hub Node */}
            {layout.centerNode ? (
              <g
                tabIndex={0}
                role="button"
                aria-label={`${layout.centerNode.label}: ${
                  masked ? 'Nominal disembunyikan' : formatIdr(layout.centerNode.amount)
                }`}
                className="cursor-pointer focus:outline-none"
                onMouseEnter={() => layout.centerNode && handleNodeActivate(layout.centerNode)}
                onMouseLeave={() => setActiveFlow(null)}
                onFocus={() => layout.centerNode && handleNodeActivate(layout.centerNode)}
                onBlur={() => setActiveFlow(null)}
                onClick={() => layout.centerNode && handleNodeActivate(layout.centerNode)}
              >
                <rect
                  x={layout.centerNode.x}
                  y={layout.centerNode.y}
                  width={layout.centerNode.width}
                  height={layout.centerNode.height}
                  rx={6}
                  fill="var(--accent-primary)"
                />
              </g>
            ) : null}

            {/* Right Column Nodes */}
            {layout.rightNodes.map((node) => {
              const midY = node.y + node.height / 2;
              const isHighlighted = activeFlow?.nodeId === node.id;
              return (
                <g
                  key={node.id}
                  tabIndex={0}
                  role="button"
                  aria-label={`${node.label}: ${
                    masked ? 'Nominal disembunyikan' : formatIdr(node.amount)
                  }`}
                  className="cursor-pointer focus:outline-none"
                  onMouseEnter={() => handleNodeActivate(node)}
                  onMouseLeave={() => setActiveFlow(null)}
                  onFocus={() => handleNodeActivate(node)}
                  onBlur={() => setActiveFlow(null)}
                  onClick={() => handleNodeActivate(node)}
                >
                  <rect
                    x={node.x}
                    y={node.y}
                    width={node.width}
                    height={node.height}
                    rx={4}
                    fill={node.color}
                    opacity={isHighlighted ? 1 : 0.92}
                  />
                  <text
                    x={node.x + node.width + 10}
                    y={midY - 3}
                    textAnchor="start"
                    fill="var(--text-primary)"
                    fontSize={12}
                    fontWeight={600}
                  >
                    {truncateLabel(node.label)}
                  </text>
                  <text
                    x={node.x + node.width + 10}
                    y={midY + 12}
                    textAnchor="start"
                    fill="var(--text-secondary)"
                    fontSize={11}
                  >
                    {masked ? 'Rp •••••••' : formatCompactIdr(node.amount)} (
                    {node.percentage.toLocaleString('id-ID')}%)
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend Strip */}
        <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-[var(--text-secondary)]">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" aria-hidden="true" />
            Sumber Pemasukan
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full bg-[var(--accent-primary)]"
              aria-hidden="true"
            />
            Tabungan / Sisa Bersih
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FB7185]" aria-hidden="true" />
            Kategori Pengeluaran
          </span>
        </div>
      </div>
    </ChartContainerCard>
  );
}
