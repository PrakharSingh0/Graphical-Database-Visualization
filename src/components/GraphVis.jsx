import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'

function colorForStatus(status) {
  if (status === 'green') return '#2ecc71'
  if (status === 'red') return '#e74c3c'
  if (status === 'yellow') return '#f1c40f'
  return '#9b59b6'
}

export default function GraphVis({ data }) {
  const ref = useRef()

  useEffect(() => {
    const svg = d3.select(ref.current)
    svg.selectAll('*').remove()
    const width = ref.current.clientWidth || 900
    const height = ref.current.clientHeight || 600

    const zoom = d3.zoom().scaleExtent([0.2, 3]).on('zoom', (event) => g.attr('transform', event.transform))
    svg.call(zoom)

    const g = svg.append('g')

    const links = data.links.map(d => Object.assign({}, d))
    const nodes = data.nodes.map(d => Object.assign({}, d))

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(d => 120 - (d.weight || 1) * 10))
      .force('charge', d3.forceManyBody().strength(-500))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide(50))

    const link = g.append('g')
      .attr('stroke', '#aaa')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke-width', d => Math.max(1, (d.weight || 1)))

    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .enter().append('g')
      .call(d3.drag()
        .on('start', (event, d) => { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y })
        .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y })
        .on('end', (event, d) => { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null }))

    node.append('circle')
      .attr('r', 28)
      .attr('fill', d => colorForStatus(d.status))
      .attr('stroke', '#111')
      .attr('stroke-width', 1.5)

    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 5)
      .attr('fill', '#071018')
      .style('pointer-events', 'none')
      .style('font-weight', 600)
      .text(d => d.label)

    node.on('mouseover', function (event, d) {
      d3.select(this).select('circle').transition().attr('r', 36)
    }).on('mouseout', function (event, d) {
      d3.select(this).select('circle').transition().attr('r', 28)
    }).on('click', (event, d) => {
      alert(`Table: ${d.label}\nType: ${d.type || 'table'}`)
    })

    simulation.on('tick', () => {
      link.attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y)

      node.attr('transform', d => `translate(${d.x},${d.y})`)
    })

    node.selectAll('circle').filter(d => d.status === 'red')
      .transition().duration(1200).attr('r', 34).transition().duration(1200).attr('r', 28).on('end', function repeat() { d3.select(this).transition().duration(1200).attr('r', 34).transition().duration(1200).attr('r', 28).on('end', repeat) })

    return () => simulation.stop()
  }, [data])

  return (
    <div className="graph-container">
      <svg ref={ref} width="100%" height="100%" />
    </div>
  )
}
