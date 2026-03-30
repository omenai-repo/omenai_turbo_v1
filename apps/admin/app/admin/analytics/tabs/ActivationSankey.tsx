"use client";

import React from "react";

export interface SankeyStage {
  name: string;
  shortName: string;
  value: number;
  count: number;
  type: "neutral" | "positive" | "negative";
}

interface Props {
  stages: SankeyStage[];
  accentColor: string;
}

const VW = 900;
const BAR_W = 22;
const MAX_H = 160;
const TOP = 96;

function barH(v: number) {
  return v > 0 ? Math.max((v / 100) * MAX_H, 3) : 0;
}

function splitLabel(s: string): [string, string] {
  const words = s.split(" ");
  if (words.length <= 2) return [s, ""];
  const m = Math.ceil(words.length / 2);
  return [words.slice(0, m).join(" "), words.slice(m).join(" ")];
}

// Soft hex blend between two colors by t ∈ [0,1]
function hex2rgb(h: string) {
  const v = parseInt(h.replace("#", ""), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

export function ActivationSankey({ stages, accentColor }: Props) {
  const pos = stages.filter((s) => s.type !== "negative");
  const neg = stages.filter((s) => s.type === "negative");
  const hasNeg = neg.length > 0;

  const posAreaW = hasNeg ? VW * 0.6 : VW - 80;
  const posSpacing =
    pos.length > 1 ? (posAreaW - 40 - BAR_W) / (pos.length - 1) : 0;
  const posX = pos.map((_, i) => 40 + i * posSpacing);

  const sepX = VW * 0.665;
  const negStart = sepX + 36;
  const negAreaW = VW - negStart - 40;
  const negSpacing = neg.length > 1 ? (negAreaW - BAR_W) / (neg.length - 1) : 0;
  const negX = neg.map((_, i) => negStart + i * negSpacing);

  const ribbon = (i: number) => {
    const x1 = posX[i] + BAR_W;
    const x2 = posX[i + 1];
    const h1 = barH(pos[i].value);
    const h2 = barH(pos[i + 1].value);
    if (h2 === 0) return null;
    const mx = (x1 + x2) / 2;
    return `M ${x1} ${TOP} C ${mx} ${TOP},${mx} ${TOP},${x2} ${TOP} L ${x2} ${
      TOP + h2
    } C ${mx} ${TOP + h2},${mx} ${TOP + h1},${x1} ${TOP + h1} Z`;
  };

  const VH = TOP + MAX_H + 72;

  // Softer accent – reduce saturation slightly for ribbon fills
  const accentRgb = hex2rgb(accentColor);
  const accentSoft = `rgba(${accentRgb[0]},${accentRgb[1]},${accentRgb[2]},0.09)`;
  const accentMid = `rgba(${accentRgb[0]},${accentRgb[1]},${accentRgb[2]},0.55)`;
  const accentFull = `rgba(${accentRgb[0]},${accentRgb[1]},${accentRgb[2]},0.82)`;

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      style={{ overflow: "visible" }}
    >
      {/* Subtle grid lines */}
      {[75, 50, 25].map((pct) => {
        const y = TOP + (1 - pct / 100) * MAX_H;
        const lineEnd = hasNeg ? sepX - 10 : VW - 32;
        return (
          <g key={pct}>
            <line
              x1={38}
              y1={y}
              x2={lineEnd}
              y2={y}
              stroke="#E8EDF3"
              strokeWidth="0.75"
              strokeDasharray="3 5"
            />
            <text
              x={30}
              y={y}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize="9"
              fill="#B0BAC8"
              fontWeight="400"
              letterSpacing="0.2"
            >
              {pct}
            </text>
          </g>
        );
      })}

      {/* Baseline */}
      <line
        x1={38}
        y1={TOP + MAX_H}
        x2={hasNeg ? sepX - 10 : VW - 32}
        y2={TOP + MAX_H}
        stroke="#DDE3EC"
        strokeWidth="1"
      />

      {/* Negative section divider */}
      {hasNeg && (
        <>
          <line
            x1={sepX}
            y1={TOP - 32}
            x2={sepX}
            y2={TOP + MAX_H + 4}
            stroke="#EBD8DC"
            strokeWidth="1"
            strokeDasharray="3 5"
          />
          <text
            x={negStart}
            y={TOP - 22}
            fontSize="9"
            fill="#C9848F"
            letterSpacing="1.2"
            fontWeight="500"
            opacity="0.9"
          >
            RISK INDICATORS
          </text>
        </>
      )}

      {/* Ribbons – very soft fill */}
      {pos.slice(0, -1).map((_, i) => {
        const d = ribbon(i);
        return d ? <path key={i} d={d} fill={accentSoft} /> : null;
      })}

      {/* Positive stage bars */}
      {pos.map((stage, i) => {
        const x = posX[i];
        const h = barH(stage.value);
        const isBase = stage.type === "neutral";
        const fill = isBase ? "#C8D0DC" : accentMid;
        const fillFull = isBase ? "#A8B4C4" : accentFull;
        const [l1, l2] = splitLabel(stage.shortName);
        const prev = i > 0 ? pos[i - 1] : null;
        const drop = prev ? +(prev.value - stage.value).toFixed(1) : 0;

        return (
          <g key={i}>
            {/* Bar body */}
            <rect x={x} y={TOP} width={BAR_W} height={h} fill={fill} rx={3} />
            {/* Thin top accent line instead of heavy cap */}
            {h > 4 && (
              <rect
                x={x}
                y={TOP}
                width={BAR_W}
                height={2}
                fill={fillFull}
                rx={2}
              />
            )}

            {/* Stage label – small, light */}
            <text
              x={x + BAR_W / 2}
              y={TOP - (l2 ? 38 : 26)}
              textAnchor="middle"
              fontSize="10"
              fill="#8C97A8"
              fontWeight="400"
            >
              {l1}
            </text>
            {l2 && (
              <text
                x={x + BAR_W / 2}
                y={TOP - 22}
                textAnchor="middle"
                fontSize="10"
                fill="#8C97A8"
                fontWeight="400"
              >
                {l2}
              </text>
            )}

            {/* Tiny tick */}
            <line
              x1={x + BAR_W / 2}
              y1={TOP - 10}
              x2={x + BAR_W / 2}
              y2={TOP - 4}
              stroke="#D4DAE3"
              strokeWidth="0.75"
            />

            {/* Value */}
            <text
              x={x + BAR_W / 2}
              y={TOP + h + 18}
              textAnchor="middle"
              fontSize="13"
              fill={isBase ? "#8C97A8" : accentFull}
              fontWeight="500"
            >
              {stage.value}%
            </text>
            {/* Count */}
            <text
              x={x + BAR_W / 2}
              y={TOP + h + 33}
              textAnchor="middle"
              fontSize="9"
              fill="#B0BAC8"
              fontWeight="400"
            >
              {new Intl.NumberFormat().format(stage.count)}
            </text>

            {/* Drop indicator – subtle */}
            {drop > 1 && prev && (
              <text
                x={(posX[i - 1] + BAR_W + x) / 2}
                y={
                  TOP +
                  Math.min(barH(stage.value), barH(prev.value)) / 2 +
                  (barH(prev.value) - barH(stage.value)) / 2
                }
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="9.5"
                fill="#D08090"
                fontWeight="500"
                opacity="0.85"
              >
                −{drop}%
              </text>
            )}
          </g>
        );
      })}

      {/* Negative (churn) bars */}
      {neg.map((stage, i) => {
        const x = negX[i];
        const h = barH(stage.value);
        const [l1, l2] = splitLabel(stage.shortName);

        return (
          <g key={`neg-${i}`}>
            <rect
              x={x}
              y={TOP}
              width={BAR_W}
              height={h}
              fill="rgba(220,130,140,0.35)"
              rx={3}
            />
            {h > 4 && (
              <rect
                x={x}
                y={TOP}
                width={BAR_W}
                height={2}
                fill="rgba(210,100,115,0.7)"
                rx={2}
              />
            )}

            <text
              x={x + BAR_W / 2}
              y={TOP - (l2 ? 38 : 26)}
              textAnchor="middle"
              fontSize="10"
              fill="#C08090"
              fontWeight="400"
            >
              {l1}
            </text>
            {l2 && (
              <text
                x={x + BAR_W / 2}
                y={TOP - 22}
                textAnchor="middle"
                fontSize="10"
                fill="#C08090"
                fontWeight="400"
              >
                {l2}
              </text>
            )}

            <line
              x1={x + BAR_W / 2}
              y1={TOP - 10}
              x2={x + BAR_W / 2}
              y2={TOP - 4}
              stroke="#EBD0D4"
              strokeWidth="0.75"
            />

            <text
              x={x + BAR_W / 2}
              y={TOP + h + 18}
              textAnchor="middle"
              fontSize="13"
              fill="rgba(200,90,105,0.8)"
              fontWeight="500"
            >
              {stage.value}%
            </text>
            <text
              x={x + BAR_W / 2}
              y={TOP + h + 33}
              textAnchor="middle"
              fontSize="9"
              fill="#B0BAC8"
              fontWeight="400"
            >
              {new Intl.NumberFormat().format(stage.count)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
