import React, { useState, useEffect, useRef } from 'react'

export function AreaChart({ data = [], labels = [], height = 250 }) {
  const containerRef = useRef(null)
  const [width, setWidth] = useState(300)
  const [hoverIndex, setHoverIndex] = useState(null)

  useEffect(() => {
    if (!containerRef.current) return
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setWidth(entry.contentRect.width)
      }
    })
    resizeObserver.observe(containerRef.current)
    setWidth(containerRef.current.getBoundingClientRect().width)
    return () => resizeObserver.disconnect()
  }, [])

  if (data.length === 0) return null

  const paddingLeft = 50
  const paddingRight = 20
  const paddingTop = 20
  const paddingBottom = 30

  const chartWidth = width - paddingLeft - paddingRight
  const chartHeight = height - paddingTop - paddingBottom

  const maxVal = Math.max(...data, 10) * 1.1 // Give some overhead padding
  const minVal = 0

  const getX = (index) => {
    if (data.length <= 1) return paddingLeft
    return paddingLeft + (index / (data.length - 1)) * chartWidth
  }

  const getY = (val) => {
    return paddingTop + chartHeight - ((val - minVal) / (maxVal - minVal)) * chartHeight
  }

  // Generate background grid lines (horizontal)
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
    const val = minVal + ratio * (maxVal - minVal)
    const y = getY(val)
    return { y, label: Math.round(val) }
  })

  // Generate the line path
  const points = data.map((val, idx) => ({ x: getX(idx), y: getY(val) }))
  
  let linePath = ''
  let areaPath = ''
  
  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
  }

  return (
    <div ref={containerRef} className="w-full relative select-none">
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          {/* Gradient for area fill */}
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--theme-primary, #1F9355)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--theme-primary, #1F9355)" stopOpacity="0.00" />
          </linearGradient>
        </defs>

        {/* Grid Lines */}
        {gridLines.map((line, idx) => (
          <g key={idx}>
            <line
              x1={paddingLeft}
              y1={line.y}
              x2={width - paddingRight}
              y2={line.y}
              stroke="var(--border, #ececec)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <text
              x={paddingLeft - 12}
              y={line.y + 4}
              textAnchor="end"
              className="text-[10px] font-semibold fill-muted-foreground font-sans"
            >
              {line.label >= 1000 ? `${(line.label / 1000).toFixed(1)}k` : line.label}
            </text>
          </g>
        ))}

        {/* Area Fill */}
        {areaPath && (
          <path d={areaPath} fill="url(#chartGradient)" />
        )}

        {/* Line Path */}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="var(--primary, #1F9355)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Interactive Circles / Tooltips */}
        {points.map((p, idx) => (
          <g 
            key={idx}
            onMouseEnter={() => setHoverIndex(idx)}
            onMouseLeave={() => setHoverIndex(null)}
            className="cursor-pointer"
          >
            {/* Expanded hover target area */}
            <circle
              cx={p.x}
              cy={p.y}
              r="14"
              fill="transparent"
            />
            {/* The actual dot */}
            <circle
              cx={p.x}
              cy={p.y}
              r={hoverIndex === idx ? '6' : '4'}
              fill={hoverIndex === idx ? 'var(--primary, #1F9355)' : 'var(--card, #ffffff)'}
              stroke="var(--primary, #1F9355)"
              strokeWidth="2.5"
              className="transition-all duration-150"
            />
          </g>
        ))}

        {/* Labels (X Axis) */}
        {labels.map((label, idx) => (
          <text
            key={idx}
            x={getX(idx)}
            y={height - 8}
            textAnchor="middle"
            className="text-[10px] font-bold fill-muted-foreground font-sans"
          >
            {label}
          </text>
        ))}
      </svg>

      {/* Tooltip Overlay */}
      {hoverIndex !== null && points[hoverIndex] && (
        <div
          style={{
            position: 'absolute',
            left: `${points[hoverIndex].x - 60}px`,
            top: `${points[hoverIndex].y - 50}px`
          }}
          className="bg-card text-foreground px-3 py-1.5 rounded-lg border border-border shadow-md text-xs font-semibold pointer-events-none z-10 animate-in fade-in zoom-in-95 duration-100"
        >
          <p className="text-muted-foreground text-[10px] font-normal">{labels[hoverIndex]}</p>
          <p className="text-foreground">${data[hoverIndex].toLocaleString()}</p>
        </div>
      )}
    </div>
  )
}

export function BarChart({ data = [], labels = [], height = 250 }) {
  const containerRef = useRef(null)
  const [width, setWidth] = useState(300)
  const [hoverIndex, setHoverIndex] = useState(null)

  useEffect(() => {
    if (!containerRef.current) return
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setWidth(entry.contentRect.width)
      }
    })
    resizeObserver.observe(containerRef.current)
    setWidth(containerRef.current.getBoundingClientRect().width)
    return () => resizeObserver.disconnect()
  }, [])

  if (data.length === 0) return null

  const paddingLeft = 50
  const paddingRight = 20
  const paddingTop = 20
  const paddingBottom = 30

  const chartWidth = width - paddingLeft - paddingRight
  const chartHeight = height - paddingTop - paddingBottom

  const maxVal = Math.max(...data, 10) * 1.1
  const minVal = 0

  const getBarX = (index) => {
    const barWidthTotal = chartWidth / data.length
    return paddingLeft + index * barWidthTotal + barWidthTotal * 0.15
  }

  const getBarWidth = () => {
    const barWidthTotal = chartWidth / data.length
    return barWidthTotal * 0.7
  }

  const getY = (val) => {
    return paddingTop + chartHeight - ((val - minVal) / (maxVal - minVal)) * chartHeight
  }

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
    const val = minVal + ratio * (maxVal - minVal)
    const y = getY(val)
    return { y, label: Math.round(val) }
  })

  return (
    <div ref={containerRef} className="w-full relative select-none">
      <svg width={width} height={height} className="overflow-visible">
        {/* Grid Lines */}
        {gridLines.map((line, idx) => (
          <g key={idx}>
            <line
              x1={paddingLeft}
              y1={line.y}
              x2={width - paddingRight}
              y2={line.y}
              stroke="var(--border, #ececec)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <text
              x={paddingLeft - 12}
              y={line.y + 4}
              textAnchor="end"
              className="text-[10px] font-semibold fill-muted-foreground font-sans"
            >
              {line.label}
            </text>
          </g>
        ))}

        {/* Bars */}
        {data.map((val, idx) => {
          const x = getBarX(idx)
          const y = getY(val)
          const barW = getBarWidth()
          const barH = Math.max((paddingTop + chartHeight) - y, 2) // Ensure min height of 2px
          
          return (
            <g
              key={idx}
              onMouseEnter={() => setHoverIndex(idx)}
              onMouseLeave={() => setHoverIndex(null)}
              className="cursor-pointer"
            >
              {/* Actual Bar */}
              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={Math.min(barW * 0.2, 4)} // Top corner rounded
                fill={hoverIndex === idx ? 'var(--primary, #1F9355)' : 'var(--primary, #1F9355)'}
                opacity={hoverIndex === idx ? '1' : '0.75'}
                className="transition-all duration-150"
              />
            </g>
          )
        })}

        {/* Labels (X Axis) */}
        {labels.map((label, idx) => {
          const x = getBarX(idx) + getBarWidth() / 2
          return (
            <text
              key={idx}
              x={x}
              y={height - 8}
              textAnchor="middle"
              className="text-[10px] font-bold fill-muted-foreground font-sans"
            >
              {label}
            </text>
          )
        })}
      </svg>

      {/* Tooltip Overlay */}
      {hoverIndex !== null && (
        <div
          style={{
            position: 'absolute',
            left: `${getBarX(hoverIndex) + getBarWidth() / 2 - 50}px`,
            top: `${getY(data[hoverIndex]) - 50}px`
          }}
          className="bg-card text-foreground px-3 py-1.5 rounded-lg border border-border shadow-md text-xs font-semibold pointer-events-none z-10 animate-in fade-in zoom-in-95 duration-100"
        >
          <p className="text-muted-foreground text-[10px] font-normal">{labels[hoverIndex]}</p>
          <p className="text-foreground">{data[hoverIndex].toLocaleString()} units</p>
        </div>
      )}
    </div>
  )
}
