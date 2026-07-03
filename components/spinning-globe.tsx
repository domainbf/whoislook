/**
 * 动态线框地球（纯 SVG + CSS 动画）。
 * 经线宽度周期性缩放模拟自转，外加一个绕轨道公转的小卫星。
 * 颜色继承自 currentColor，可通过 className 上的 text-* 控制。
 */
export default function SpinningGlobe({ className }: { className?: string }) {
  // 经线动画错相，形成连续自转效果
  const meridians = [0, -1.5, -3, -4.5]

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      aria-hidden="true"
    >
      {/* 球体外轮廓 */}
      <circle cx="50" cy="50" r="37" />

      {/* 纬线（静态，轻微弧度） */}
      <ellipse cx="50" cy="50" rx="37" ry="11" opacity="0.75" />
      <ellipse cx="50" cy="33" rx="30" ry="7" opacity="0.55" />
      <ellipse cx="50" cy="67" rx="30" ry="7" opacity="0.55" />

      {/* 经线（动画缩放，模拟自转） */}
      {meridians.map((delay, i) => (
        <ellipse
          key={i}
          className="globe-meridian"
          cx="50"
          cy="50"
          rx="37"
          ry="37"
          opacity="0.7"
          style={{ animationDelay: `${delay}s` }}
        />
      ))}

      {/* 公转轨道与卫星 */}
      <g className="globe-orbit">
        <ellipse
          cx="50"
          cy="50"
          rx="46"
          ry="20"
          strokeDasharray="2 4"
          opacity="0.5"
          transform="rotate(-24 50 50)"
        />
        <circle cx="7" cy="42" r="2.4" fill="currentColor" stroke="none" />
      </g>
    </svg>
  )
}
