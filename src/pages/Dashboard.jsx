import React, { useEffect, useRef, useState, useMemo } from 'react'
import * as d3 from 'd3'
import InlineNetwork from '../components/InlineNetwork'

const sample = {
  nodes: [
    { id: 'Students', label: 'Students', status: 'yellow', F_Rows: 30000, O_Risk: 0.45, O_Score: 65, O_Label: 'Moderate Risk' },
    { id: 'Courses', label: 'Courses', status: 'green', F_Rows: 2500, O_Risk: 0.2, O_Score: 80, O_Label: 'Low Risk' },
    { id: 'Professors', label: 'Professors', status: 'blue', F_Rows: 300, O_Risk: 0.1, O_Score: 90, O_Label: 'Very Low Risk' },
    { id: 'Enrollments', label: 'Enrollments', status: 'red', F_Rows: 400000, O_Risk: 0.9, O_Score: 30, O_Label: 'Critical Risk' },
    { id: 'Departments', label: 'Departments', status: 'blue', F_Rows: 50, O_Risk: 0.05, O_Score: 95, O_Label: 'Very Low Risk' }
  ],
  links: [
    { source: 'Students', target: 'Departments', rel: 'FK: Major Dept', O_Attention: 0.2, weight: 2 },
    { source: 'Students', target: 'Professors', rel: 'FK: Advisor', O_Attention: 0.1, weight: 1 },
    { source: 'Courses', target: 'Departments', rel: 'FK: Course Dept', O_Attention: 0.3, weight: 3 },
    { source: 'Professors', target: 'Departments', rel: 'FK: Professor Dept', O_Attention: 0.4, weight: 4 },
    { source: 'Enrollments', target: 'Students', rel: 'FK: Student', O_Attention: 0.95, weight: 9 },
    { source: 'Enrollments', target: 'Courses', rel: 'FK: Course', O_Attention: 0.9, weight: 9 }
  ]
}

function tweak(hex, amt) {
  const c = d3.color(hex) || d3.color('#888')
  if (!c) return hex
  c.r = Math.max(0, Math.min(255, c.r + amt))
  c.g = Math.max(0, Math.min(255, c.g + amt))
  c.b = Math.max(0, Math.min(255, c.b + amt))
  return c.formatHex()
}

function RiskChip({ node }) {
  if (!node) return null
  const label = node.O_Label || 'Risk'
  let cls = 'bg-emerald-100 text-emerald-700 border-emerald-200'
  if (node.status === 'red') cls = 'bg-red-100 text-red-700 border-red-200'
  else if (node.status === 'yellow') cls = 'bg-amber-100 text-amber-700 border-amber-200'
  else if (node.status === 'blue') cls = 'bg-sky-100 text-sky-700 border-sky-200'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-medium ${cls}`}>
      {label}
    </span>
  )
}

export function GraphVis({ data, options, onNodeSelect }) {
  const svgRef = useRef()
  const wrapperRef = useRef()
  const inspectorRef = useRef()
  const [simParams, setSimParams] = useState({
    charge: -700,
    linkDistance: 240,
    linkStrength: 0.8,
    collision: 36,
    nodeSize: 36,
    showLabels: true
  })
  const [inspector, setInspector] = useState(null)

  const graphData = useMemo(
    () => ({
      nodes: (data?.nodes || []).map(n => ({ ...n })),
      links: (data?.links || []).map(l => ({ ...l }))
    }),
    [data]
  )

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const width = Math.max(1000, wrapper.clientWidth || 1200)
    const height = Math.max(700, wrapper.clientHeight || 760)

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const colorMap = {
      red: '#ef4444',
      green: '#10b981',
      yellow: '#f59e0b',
      blue: '#3b82f6',
      gray: '#6b7280'
    }

    const defs = svg.append('defs')
    defs
      .append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 22)
      .attr('refY', 0)
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4L8,0L0,4')
      .attr('fill', '#374151')

    const container = svg
      .attr('viewBox', [0, 0, width, height])
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .append('g')

    const zoom = d3
      .zoom()
      .scaleExtent([0.2, 3])
      .on('zoom', e => container.attr('transform', e.transform))

    d3.select(svgRef.current).call(zoom).on('dblclick.zoom', null)

    const graph = graphData

    const linkForce = d3
      .forceLink(graph.links)
      .id(d => d.id)
      .distance(simParams.linkDistance)
      .strength(simParams.linkStrength)

    const simulation = d3
      .forceSimulation(graph.nodes)
      .force('link', linkForce)
      .force('charge', d3.forceManyBody().strength(simParams.charge))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force(
        'collision',
        d3
          .forceCollide()
          .radius(() => simParams.nodeSize / 2 + simParams.collision)
      )

    const linkGroup = container.append('g').attr('class', 'links')

    const links = linkGroup
      .selectAll('path')
      .data(graph.links)
      .enter()
      .append('path')
      .attr('fill', 'none')
      .attr('stroke-width', d => Math.max(1, d.weight || 1))
      .attr('stroke-linecap', 'round')
      .attr('opacity', 0.9)
      .attr('marker-end', 'url(#arrow)')

    const linkGlow = linkGroup
      .selectAll('.glow')
      .data(graph.links)
      .enter()
      .append('path')
      .attr('fill', 'none')
      .attr('stroke-width', d => Math.max(6, (d.weight || 1) * 3))
      .attr('stroke-linecap', 'round')
      .attr('opacity', d => (d.O_Attention >= 0.7 ? 0.22 : 0.06))

    const linkLabels = linkGroup
      .selectAll('g.linkLabel')
      .data(graph.links)
      .enter()
      .append('g')
      .attr('class', 'linkLabel')

    linkLabels
      .append('rect')
      .attr('x', -50)
      .attr('y', -13)
      .attr('rx', 8)
      .attr('ry', 8)
      .attr('width', 110)
      .attr('height', 22)
      .attr('fill', 'rgba(15,23,42,0.9)')
      .attr('opacity', 0.9)

    linkLabels
      .append('text')
      .attr('font-size', 10)
      .attr('dy', 4)
      .attr('text-anchor', 'middle')
      .style('fill', '#e5e7eb')
      .text(d => `${d.rel || ''} · ${Math.round((d.O_Attention || 0) * 100)}%`)

    const nodeGroup = container.append('g').attr('class', 'nodes')

    const nodes = nodeGroup
      .selectAll('g.node')
      .data(graph.nodes)
      .enter()
      .append('g')
      .attr('class', 'node')

    nodes
      .append('circle')
      .attr('r', simParams.nodeSize / 2 + 10)
      .attr('fill', 'rgba(15,23,42,0.06)')
      .attr('opacity', 1)

    nodes
      .append('circle')
      .attr('r', simParams.nodeSize / 2)
      .attr('fill', d => colorMap[d.status] || colorMap.gray)
      .attr('stroke', '#020617')
      .attr('stroke-opacity', 0.22)

    if (simParams.showLabels) {
      nodes
        .append('rect')
        .attr(
          'x',
          d => -Math.max(90, (d.label?.length || 6) * 7) / 2
        )
        .attr('y', simParams.nodeSize / 2 + 10)
        .attr('rx', 10)
        .attr('ry', 10)
        .attr('height', 40)
        .attr(
          'width',
          d => Math.max(90, (d.label?.length || 6) * 7)
        )
        .attr('fill', 'rgba(15,23,42,0.96)')

      nodes
        .append('text')
        .attr('dy', simParams.nodeSize / 2 + 27)
        .attr('text-anchor', 'middle')
        .style('font-size', '11px')
        .style('font-weight', 500)
        .style('fill', '#f9fafb')
        .text(d => `${d.label}`)

      nodes
        .append('text')
        .attr('dy', simParams.nodeSize / 2 + 42)
        .attr('text-anchor', 'middle')
        .style('font-size', '9px')
        .style('fill', '#cbd5e1')
        .text(d => `rows:${d.F_Rows || '-'} · risk:${d.O_Risk ?? '-'}`)
    }

    nodes
      .append('circle')
      .attr('r', simParams.nodeSize / 2 + 18)
      .attr('fill', 'transparent')
      .style('cursor', 'pointer')
      .on('mouseover', function (e, d) {
        nodes
          .selectAll('circle')
          .attr('opacity', nd =>
            nd.id === d.id || isLinked(nd, d) ? 1 : 0.15
          )
        links.attr('opacity', lk =>
          lk.source.id === d.id || lk.target.id === d.id ? 1 : 0.06
        )
        linkGlow.attr('opacity', lk =>
          lk.source.id === d.id || lk.target.id === d.id ? 0.35 : 0.06
        )
        linkLabels.attr('opacity', lk =>
          lk.source.id === d.id || lk.target.id === d.id ? 1 : 0.16
        )
      })
      .on('mouseout', function () {
        nodes.selectAll('circle').attr('opacity', 1)
        links.attr('opacity', 0.9)
        linkGlow.attr('opacity', d =>
          d.O_Attention >= 0.7 ? 0.22 : 0.06
        )
        linkLabels.attr('opacity', 1)
      })
      .on('click', function (e, d) {
        setInspector(d)
        if (onNodeSelect) onNodeSelect(d)
      })
      .call(
        d3
          .drag()
          .on('start', (e, d) => {
            if (!e.active) simulation.alphaTarget(0.3).restart()
            d.fx = d.x
            d.fy = d.y
          })
          .on('drag', (e, d) => {
            d.fx = e.x
            d.fy = e.y
          })
          .on('end', (e, d) => {
            if (!e.active) simulation.alphaTarget(0)
            d.fx = null
            d.fy = null
          })
      )

    const linkedByIndex = {}
    graph.links.forEach(d => {
      const s = typeof d.source === 'string' ? d.source : d.source.id
      const t = typeof d.target === 'string' ? d.target : d.target.id
      linkedByIndex[`${s},${t}`] = true
      linkedByIndex[`${t},${s}`] = true
    })

    function isLinked(a, b) {
      return a.id === b.id || linkedByIndex[`${a.id},${b.id}`]
    }

    simulation.on('tick', () => {
      nodes.attr('transform', d => `translate(${d.x},${d.y})`)

      links.attr('d', d => {
        const sx = d.source.x
        const sy = d.source.y
        const tx = d.target.x
        const ty = d.target.y
        const dx = tx - sx
        const dy = ty - sy
        const dr = Math.sqrt(dx * dx + dy * dy) * 1.1
        const mx = (sx + tx) / 2
        const my = (sy + ty) / 2
        const nx = -dy
        const ny = dx
        const norm = Math.sqrt(nx * nx + ny * ny) || 1
        const offset = Math.min(120, dr * 0.25)
        const cx = mx + (nx / norm) * offset
        const cy = my + (ny / norm) * offset
        return `M${sx},${sy} Q${cx},${cy} ${tx},${ty}`
      })

      linkLabels.attr('transform', d => {
        const sx = d.source.x
        const sy = d.source.y
        const tx = d.target.x
        const ty = d.target.y
        const mx = (sx + tx) / 2
        const my = (sy + ty) / 2
        return `translate(${mx},${my})`
      })
    })

    links.attr('stroke', d => {
      const att = d.O_Attention ?? 0
      if (att >= 0.8) return tweak('#ef4444', -8)
      if (att >= 0.5) return tweak('#f59e0b', -8)
      if (att >= 0.2) return tweak('#60a5fa', -8)
      return tweak('#9ca3af', -8)
    })

    linkGlow.attr('stroke', d => {
      const att = d.O_Attention ?? 0
      if (att >= 0.8) return 'rgba(239,68,68,0.7)'
      if (att >= 0.5) return 'rgba(245,158,11,0.5)'
      if (att >= 0.2) return 'rgba(96,165,250,0.3)'
      return 'rgba(156,163,175,0.13)'
    })

    const allNodesBBox = () => {
      try {
        const g = container.node()
        const bbox = g.getBBox()
        return bbox
      } catch (e) {
        return { x: 0, y: 0, width, height }
      }
    }

    setTimeout(() => {
      const b = allNodesBBox()
      const scale = Math.min(1.2, (width - 140) / (b.width || width))
      const tx = width / 2 - (b.x + b.width / 2) * scale
      const ty = height / 2 - (b.y + b.height / 2) * scale
      d3
        .select(svgRef.current)
        .transition()
        .duration(420)
        .call(
          zoom.transform,
          d3.zoomIdentity.translate(tx, ty).scale(scale)
        )
    }, 260)

    return () => simulation.stop()
  }, [graphData, simParams, onNodeSelect])

  useEffect(() => {
    if (options) setSimParams(p => ({ ...p, ...options }))
  }, [options])

  return (
    <div
      className="graph-wrapper w-full h-full relative flex gap-4"
      style={{ minHeight: 720 }}
    >
      <div
        className="flex-1 rounded-2xl overflow-hidden border border-slate-200/70 bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 shadow-sm"
        ref={wrapperRef}
      >
        <svg ref={svgRef} className="w-full h-full" />
      </div>

      <div
        className="inspector w-96 bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl p-4 border border-slate-200 flex flex-col"
        style={{ maxHeight: 720 }}
        ref={inspectorRef}
      >
        {inspector ? (
          <div className="flex flex-col h-full">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <h4 className="font-semibold text-slate-900 leading-tight">
                  {inspector.label || inspector.id}
                </h4>
                <div className="text-xs text-slate-500 mt-1">
                  Table id: <span className="font-mono">{inspector.id}</span>
                </div>
              </div>
              <RiskChip node={inspector} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div className="px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[0.68rem] uppercase tracking-wide text-slate-500">
                  rows
                </div>
                <div className="text-sm font-semibold text-slate-900">
                  {inspector.F_Rows ?? '-'}
                </div>
              </div>
              <div className="px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[0.68rem] uppercase tracking-wide text-slate-500">
                  risk score
                </div>
                <div className="text-sm font-semibold text-slate-900">
                  {inspector.O_Score ?? '-'}
                </div>
              </div>
              <div className="px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[0.68rem] uppercase tracking-wide text-slate-500">
                  numeric risk
                </div>
                <div className="text-sm font-semibold text-slate-900">
                  {inspector.O_Risk ?? '-'}
                </div>
              </div>
              <div className="px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[0.68rem] uppercase tracking-wide text-slate-500">
                  status
                </div>
                <div className="text-sm font-semibold text-slate-900">
                  {inspector.status || '-'}
                </div>
              </div>
            </div>

            <div className="mb-3">
              <div className="text-xs font-medium text-slate-600 mb-1">
                Node JSON
              </div>
              <pre className="text-[11px] leading-relaxed bg-slate-900 text-slate-50 p-2.5 rounded-xl border border-slate-800 overflow-auto max-h-56">
                {JSON.stringify(inspector, null, 2)}
              </pre>
            </div>

            {inspector.attributes && inspector.attributes.length > 0 && (
              <div className="mt-1 mb-3 flex-1 min-h-0">
                <div className="text-xs font-medium text-slate-600 mb-1">
                  Columns
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-44 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50/80">
                      <tr className="text-left text-[11px] text-slate-500 border-b border-slate-200">
                        <th className="px-2 py-1">Name</th>
                        <th className="px-2 py-1">Type</th>
                        <th className="px-2 py-1">Key</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inspector.attributes.map((a, i) => (
                        <tr
                          key={i}
                          className="border-b border-slate-100 last:border-0"
                        >
                          <td className="px-2 py-1.5 text-slate-800">
                            {a.name}
                          </td>
                          <td className="px-2 py-1.5 text-slate-600">
                            {a.type}
                          </td>
                          <td className="px-2 py-1.5 text-slate-500">
                            {a.key || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="mt-auto flex gap-2 pt-2 border-t border-slate-200">
              <button
                className="inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-300 shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-150"
                onClick={() => setInspector(null)}
              >
                Close
              </button>
              <button
                className="inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-medium rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500 text-white shadow-[0_8px_24px_rgba(129,140,248,0.55)] hover:shadow-[0_10px_30px_rgba(129,140,248,0.7)] hover:scale-[1.02] active:scale-[0.98] border border-violet-300/70 transition-all duration-150"
                onClick={() =>
                  navigator.clipboard.writeText(
                    JSON.stringify(inspector, null, 2)
                  )
                }
              >
                Copy JSON
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full justify-center items-center text-center px-2">
            <div className="mb-2 text-sm font-semibold text-slate-800">
              No node selected
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Click any node in the graph to see full JSON, risk badge and
              columns here. Drag nodes around, and use mouse wheeel to zoom.
            </p>
          </div>
        )}
      </div>

      <div className="graph-floater absolute top-4 left-4 p-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200">
        <div className="flex items-center justify-between gap-3 mb-2">
          <span className="text-[11px] font-semibold tracking-wide uppercase text-slate-500">
            layout
          </span>
          <button
            className="text-[10px] px-2.5 py-1 rounded-full bg-slate-900 text-slate-100 border border-slate-700 shadow-sm hover:bg-slate-800 hover:shadow-md active:scale-[0.97] transition-all duration-150"
            onClick={() =>
              setSimParams({
                charge: -700,
                linkDistance: 240,
                linkStrength: 0.8,
                collision: 36,
                nodeSize: 36,
                showLabels: true
              })
            }
          >
            reset
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 items-center">
            <label className="text-[11px] font-medium w-16 text-slate-600">
              node size
            </label>
            <input
              type="range"
              min="24"
              max="110"
              value={simParams.nodeSize}
              onChange={e =>
                setSimParams(p => ({ ...p, nodeSize: +e.target.value }))
              }
              className="w-40 accent-violet-500"
            />
          </div>
          <div className="flex gap-2 items-center">
            <label className="text-[11px] font-medium w-16 text-slate-600">
              charge
            </label>
            <input
              type="range"
              min="-2500"
              max="-50"
              value={simParams.charge}
              onChange={e =>
                setSimParams(p => ({ ...p, charge: +e.target.value }))
              }
              className="w-40 accent-violet-500"
            />
          </div>
          <div className="flex gap-2 items-center">
            <label className="text-[11px] font-medium w-16 text-slate-600">
              link dist
            </label>
            <input
              type="range"
              min="40"
              max="400"
              value={simParams.linkDistance}
              onChange={e =>
                setSimParams(p => ({
                  ...p,
                  linkDistance: +e.target.value
                }))
              }
              className="w-40 accent-violet-500"
            />
          </div>
          <div className="flex gap-2 items-center">
            <label className="text-[11px] font-medium w-16 text-slate-600">
              labels
            </label>
            <input
              type="checkbox"
              checked={simParams.showLabels}
              onChange={e =>
                setSimParams(p => ({
                  ...p,
                  showLabels: e.target.checked
                }))
              }
              className="accent-violet-500"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState(sample)
  const [text, setText] = useState(JSON.stringify(sample, null, 2))
  const [options, setOptions] = useState(null)
  const [selectedNode, setSelectedNode] = useState(null)

  const handleUpload = e => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const parsed = JSON.parse(ev.target.result)
        setData(parsed)
        setText(JSON.stringify(parsed, null, 2))
      } catch (err) {
        alert('Invalid JSON file')
      }
    }
    reader.readAsText(file)
  }

  const applyText = () => {
    try {
      const parsed = JSON.parse(text)
      setData(parsed)
    } catch (err) {
      alert('Invalid JSON')
    }
  }

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'schema.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="page dashboard min-h-screen bg-slate-950 text-slate-50">
      <header className="dash-head px-6 py-4 flex items-center justify-between bg-slate-950 border-b border-slate-800/80">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Schema Visualizer
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Paste JSON describing nodes and links, then explore the graph
            interactively.
          </p>
        </div>
      </header>

      <main className="dash-main p-4 md:p-6 grid gap-4 xl:grid-cols-12">
        <aside className="panel xl:col-span-3 bg-slate-900/70 border border-slate-800 rounded-2xl shadow-sm p-4 flex flex-col">
          <h4 className="font-medium mb-1 text-sm text-slate-100">
            Upload or edit schema JSON
          </h4>
          <p className="text-[11px] text-slate-400 mb-3">
            Must contain <span className="font-mono">nodes</span> and{' '}
            <span className="font-mono">links</span> arrays.
          </p>

          <label className="inline-flex items-center text-[11px] mb-2">
            <span className="px-3 py-1.5 rounded-full border border-slate-700 bg-slate-950/70 cursor-pointer hover:bg-slate-900/90 hover:border-slate-500 text-slate-100 text-xs shadow-sm hover:shadow-md active:scale-[0.97] transition-all duration-150">
              Choose JSON file
              <input
                className="hidden"
                type="file"
                accept="application/json"
                onChange={handleUpload}
              />
            </span>
          </label>

          <textarea
            className="w-full h-80 md:h-[400px] p-2.5 rounded-xl border border-slate-700 bg-slate-950/70 text-[11px] font-mono text-slate-100 resize-none focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
            value={text}
            onChange={e => setText(e.target.value)}
          />

          <div className="panel-actions flex flex-wrap gap-2 mt-3">
            <button
              className="inline-flex items-center justify-center px-4 py-1.5 text-xs font-medium rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500 text-white shadow-[0_8px_24px_rgba(129,140,248,0.55)] hover:shadow-[0_10px_30px_rgba(129,140,248,0.7)] hover:scale-[1.02] active:scale-[0.98] border border-violet-300/70 transition-all duration-150"
              onClick={applyText}
            >
              Render graph
            </button>
            <button
              className="inline-flex items-center justify-center px-4 py-1.5 text-xs font-medium rounded-full bg-slate-900 text-slate-100 border border-slate-700 shadow-sm hover:bg-slate-800 hover:border-slate-500 hover:shadow-md active:scale-[0.98] transition-all duration-150"
              onClick={() => {
                setText(JSON.stringify(sample, null, 2))
                setData(sample)
              }}
            >
              Load sample
            </button>
            <button
              className="inline-flex items-center justify-center px-4 py-1.5 text-xs font-medium rounded-full bg-slate-950 text-slate-100 border border-slate-700/80 hover:border-slate-400 hover:bg-slate-900 shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-150"
              onClick={exportJSON}
            >
              Export JSON
            </button>
          </div>

          <div className="mt-5">
            <h5 className="font-medium mb-2 text-xs text-slate-200">
              Selected node
            </h5>
            {selectedNode ? (
              <div className="rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-3 text-[11px] space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold text-slate-50">
                      {selectedNode.label || selectedNode.id}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      id: <span className="font-mono">{selectedNode.id}</span>
                    </div>
                  </div>
                  <RiskChip node={selectedNode} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wide">
                      rows
                    </div>
                    <div className="text-xs font-semibold text-slate-100">
                      {selectedNode.F_Rows ?? '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wide">
                      score
                    </div>
                    <div className="text-xs font-semibold text-slate-100">
                      {selectedNode.O_Score ?? '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wide">
                      risk
                    </div>
                    <div className="text-xs font-semibold text-slate-100">
                      {selectedNode.O_Risk ?? '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wide">
                      status
                    </div>
                    <div className="text-xs font-semibold text-slate-100">
                      {selectedNode.status ?? '-'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-[11px] text-slate-500">
               
              </div>
            )}
          </div>

          <div className="mt-5 text-[11px] text-slate-500 leading-relaxed">
            Tip: nodes use <span className="font-mono">status</span> for color
            and <span className="font-mono">O_Attention</span> for link
            intensity. You can drag nodes, zoom and click to inspect.
          </div>
        </aside>

        <section
          className="vis xl:col-span-9 rounded-3xl relative"
          style={{ minHeight: 720 }}
        >
          <div
            className="graph-wrap inline-bg rounded-3xl overflow-hidden border border-slate-800/80 bg-slate-900 relative"
            style={{ position: 'relative', height: '100%' }}
          >
            <InlineNetwork
              density={14}
              color={'rgba(127,90,240,0.04)'}
            />
            <div
              className="graph-inner"
              style={{ position: 'relative', zIndex: 1 }}
            >
              <GraphVis
                data={data}
                options={options}
                onNodeSelect={setSelectedNode}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
