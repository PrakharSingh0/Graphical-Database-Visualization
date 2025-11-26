import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import '../styles.css'

export default function D3Dashboard() {
  const containerRef = useRef()
  const svgRef = useRef()
  const loadingRef = useRef()
  const sidebarRef = useRef()
  useEffect(() => {
    const container = containerRef.current
    const svgEl = svgRef.current
    const loadingOverlay = loadingRef.current
    const sidebar = sidebarRef.current

    
    const baseMockData = {
      nodes: [
        { id: 'Students', F_Rows: 30000, O_Risk: 0.45, O_Score: 65, O_Label: 'Moderate Risk', attributes: [
          { name: 'student_id', type: 'VARCHAR(8)', key: 'PK' }, { name: 'name', type: 'VARCHAR', key: '' }, { name: 'major_dept_id', type: 'INT', key: 'FK' }, { name: 'gpa', type: 'DECIMAL', key: '' }, { name: 'advisor_prof_id', type: 'INT', key: 'FK' }
        ]},
        { id: 'Courses', F_Rows: 2500, O_Risk: 0.2, O_Score: 80, O_Label: 'Low Risk', attributes: [
          { name: 'course_id', type: 'VARCHAR(10)', key: 'PK' }, { name: 'title', type: 'VARCHAR', key: 'Unique' }, { name: 'dept_id', type: 'INT', key: 'FK' }, { name: 'credits', type: 'INT', key: '' }
        ]},
        { id: 'Professors', F_Rows: 300, O_Risk: 0.1, O_Score: 90, O_Label: 'Very Low Risk', attributes: [
          { name: 'prof_id', type: 'INT', key: 'PK' }, { name: 'name', type: 'VARCHAR', key: '' }, { name: 'dept_id', type: 'INT', key: 'FK' }, { name: 'rank', type: 'VARCHAR', key: '' }
        ]},
        { id: 'Enrollments', F_Rows: 400000, O_Risk: 0.92, O_Score: 30, O_Label: 'Critical Risk', attributes: [
          { name: 'enrollment_id', type: 'INT', key: 'PK' }, { name: 'student_id', type: 'VARCHAR(8)', key: 'FK' }, { name: 'course_id', type: 'VARCHAR(10)', key: 'FK' }, { name: 'semester', type: 'VARCHAR', key: '' }, { name: 'grade', type: 'CHAR(2)', key: '' }
        ]},
        { id: 'Departments', F_Rows: 50, O_Risk: 0.05, O_Score: 95, O_Label: 'Very Low Risk', attributes: [
          { name: 'dept_id', type: 'INT', key: 'PK' }, { name: 'name', type: 'VARCHAR', key: 'Unique' }, { name: 'chair_prof_id', type: 'INT', key: 'FK' }
        ]}
      ],
      links: [
        { source: 'Students', target: 'Departments', rel: 'FK: Major Dept', O_Attention: 0.2, isGNNLink: true },
        { source: 'Students', target: 'Professors', rel: 'FK: Advisor', O_Attention: 0.1, isGNNLink: true },
        { source: 'Courses', target: 'Departments', rel: 'FK: Course Dept', O_Attention: 0.3, isGNNLink: true },
        { source: 'Professors', target: 'Departments', rel: 'FK: Professor Dept', O_Attention: 0.4, isGNNLink: true },
        { source: 'Departments', target: 'Professors', rel: 'FK: Chair', O_Attention: 0.15, isGNNLink: true },
        { source: 'Enrollments', target: 'Students', rel: 'FK: Student', O_Attention: 0.95, isGNNLink: true },
        { source: 'Enrollments', target: 'Courses', rel: 'FK: Course', O_Attention: 0.9, isGNNLink: true }
      ]
    }

    
    const processed = { nodes: [], links: [] }
    baseMockData.nodes.forEach(table => {
      processed.nodes.push({ ...table, isTable: true, attributeCount: table.attributes.length })
      table.attributes.forEach(attr => {
        const id = `${table.id}-${attr.name}`
        processed.nodes.push({ id, name: attr.name, type: attr.type, key: attr.key, parentId: table.id, isTable: false, O_Risk: 0.03, O_Score: 10 })
        processed.links.push({ source: table.id, target: id, rel: attr.key || attr.type, isAttributeLink: true })
      })
    })
    
    processed.links = processed.links.concat(baseMockData.links.map(l => ({ ...l })))

    
    const containerRect = container.getBoundingClientRect()
    const width = containerRect.width
    const height = containerRect.height
    const svg = d3.select(svgEl).attr('viewBox', `0 0 ${width} ${height}`)
    const g = svg.selectAll('.root').data([0]).join('g').attr('class', 'root')

    const riskColorScale = d3.scaleLinear().domain([0, 0.5, 1]).range(['#34D399', '#FACC15', '#FB7185'])
    const tableRadius = d3.scaleLinear().domain(d3.extent(processed.nodes.filter(n => n.isTable), d => d.O_Score)).range([20, 44])

    const simulation = d3.forceSimulation(processed.nodes)
      .force('link', d3.forceLink(processed.links).id(d => d.id).distance(l => l.isAttributeLink ? 36 : 140).strength(l => l.isAttributeLink ? 1.0 : 0.5))
      .force('charge', d3.forceManyBody().strength(-420))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .alphaDecay(0.04).on('tick', ticked)

    
    let link = g.selectAll('.link').data(processed.links).join('line').attr('class', d => `link ${d.isAttributeLink ? 'attribute-link' : ''}`).attr('stroke-width', d => d.isGNNLink ? (1 + d.O_Attention * 5) : 1).attr('stroke', d => d.isGNNLink ? '#9CA3FF' : '#9CA3AF').attr('opacity', d => d.isGNNLink ? 0.7 : 0.9)

    const nodeGroup = g.selectAll('.node-group').data(processed.nodes, d => d.id).join('g').attr('class', 'node-group').call(d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended)).on('click', (event, d) => { event.stopPropagation(); handleNodeClick(d) })

    nodeGroup.append('circle').attr('class', d => d.isTable ? 'node-circle table-node' : 'node-circle attribute').attr('r', d => d.isTable ? tableRadius(d.O_Score) : 8).attr('fill', d => d.isTable ? riskColorScale(d.O_Risk) : '#9CA3AF').attr('stroke', '#0f172a').attr('stroke-width', d => d.isTable ? 2 : 1)

    nodeGroup.append('text').attr('class', d => d.isTable ? 'node-text table-label' : 'node-text attribute').attr('dy', '0.35em').text(d => d.isTable ? d.id : d.name).style('font-size', d => d.isTable ? '12px' : '9px').style('fill', d => d.isTable ? '#071425' : '#475569')

    function ticked() {
      link.attr('x1', d => d.source.x).attr('y1', d => d.source.y).attr('x2', d => d.target.x).attr('y2', d => d.target.y)
      g.selectAll('.node-group').attr('transform', d => `translate(${d.x},${d.y})`)
    }

    function dragstarted(event, d) { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y }
    function dragged(event, d) { d.fx = event.x; d.fy = event.y }
    function dragended(event, d) { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null }

    
    let selected = null

    function resetView() {
      selected = null
      g.selectAll('.node-group').transition().duration(300).attr('opacity', 1)
      link.transition().duration(300).attr('opacity', d => d.isGNNLink ? 0.7 : 0.9).attr('stroke-width', d => d.isGNNLink ? (1 + d.O_Attention * 5) : 1).attr('stroke', d => d.isGNNLink ? '#9CA3FF' : '#9CA3AF')
      sidebar.querySelector('#details-content').classList.add('hidden')
      sidebar.querySelector('#initial-message').classList.remove('hidden')
    }

    function handleNodeClick(d) {
      if (selected === d.id) { resetView(); return }
      selected = d.id
      
      const neighbors = new Set([d.id])
      const gnnLinks = []
      processed.links.forEach(l => {
        const s = typeof l.source === 'object' ? l.source.id : l.source
        const t = typeof l.target === 'object' ? l.target.id : l.target
        if (s === d.id) { neighbors.add(t); if (l.isGNNLink) gnnLinks.push({ ...l, neighborId: t, dir: 'out' }) }
        if (t === d.id) { neighbors.add(s); if (l.isGNNLink) gnnLinks.push({ ...l, neighborId: s, dir: 'in' }) }
      })

      g.selectAll('.node-group').transition().duration(220).attr('opacity', nd => neighbors.has(nd.id) ? 1 : 0.08)
      link.transition().duration(220).attr('opacity', ln => (neighbors.has((typeof ln.source==='object'?ln.source.id:ln.source)) && neighbors.has((typeof ln.target==='object'?ln.target.id:ln.target))) ? 1 : 0.05)

      
      gnnLinks.forEach(lk => {
        link.filter(ll => ( (typeof ll.source==='object'?ll.source.id:ll.source) === (lk.source.id||lk.source) && (typeof ll.target==='object'?ll.target.id:ll.target) === (lk.target.id||lk.target) ) )
          .transition().duration(260).attr('stroke', '#60A5FA').attr('stroke-width', 2 + lk.O_Attention * 6).attr('opacity', 1)
      })

      
      sidebar.querySelector('#initial-message').classList.add('hidden')
      sidebar.querySelector('#details-content').classList.remove('hidden')
      sidebar.querySelector('#node-name').textContent = d.isTable ? d.id : d.name
      sidebar.querySelector('#node-type').textContent = d.isTable ? 'Entity Table (GNN Target)' : 'Attribute/Column'
      if (d.isTable) {
        sidebar.querySelector('#table-details').classList.remove('hidden')
        sidebar.querySelector('#attribute-details').classList.add('hidden')
        sidebar.querySelector('#risk-score').textContent = (d.O_Risk * 100).toFixed(1) + '%'
        sidebar.querySelector('#risk-label').textContent = d.O_Label
        sidebar.querySelector('#row-count').textContent = d.F_Rows.toLocaleString()
        sidebar.querySelector('#attribute-count').textContent = d.attributeCount || 0
        let narrative = `GNN focuses on ${d.id} (Rows: ${d.F_Rows.toLocaleString()}).`;
        if (gnnLinks.length) {
          gnnLinks.sort((a,b)=>b.O_Attention-a.O_Attention).forEach(lk=>{ narrative += `\n- ${lk.dir} link to ${lk.neighborId} (${Math.round(lk.O_Attention*100)}% attention).` })
        }
        sidebar.querySelector('#attention-summary').innerText = narrative
      } else {
        sidebar.querySelector('#table-details').classList.add('hidden')
        sidebar.querySelector('#attribute-details').classList.remove('hidden')
        sidebar.querySelector('#attr-parent').textContent = d.parentId
        sidebar.querySelector('#attr-type').textContent = d.type
        sidebar.querySelector('#attr-key').textContent = d.key || 'None'
        sidebar.querySelector('#attention-summary').innerText = `This attribute contributes as a low-level feature to ${d.parentId}.`
      }
    }

    
    updatePositions()
    function updatePositions() { update(); simulation.alpha(1).restart() }

    function update(){
      
      g.selectAll('.node-group').select('circle').attr('r', d => d.isTable ? tableRadius(d.O_Score) : 8)
    }

    
    loadingOverlay.classList.add('visible')
    setTimeout(()=>{
      loadingOverlay.classList.remove('visible')
      const enroll = processed.nodes.find(n=>n.id==='Enrollments')
      if (enroll) handleNodeClick(enroll)
    }, 1400)

    svg.on('click', (event)=>{ if (event.target.tagName==='svg' || event.target.tagName==='g') resetView() })

    
    window.addEventListener('resize', onResize)
    function onResize(){
      const r = container.getBoundingClientRect(); svg.attr('viewBox', `0 0 ${r.width} ${r.height}`); simulation.force('center', d3.forceCenter(r.width/2, r.height/2)); simulation.alpha(0.3).restart()
    }

    return ()=>{ simulation.stop(); window.removeEventListener('resize', onResize); svg.selectAll('*').remove() }
  }, [])

  return (
    <div className="dashboard-d3" style={{display:'flex',gap:18,height:'calc(100vh - 120px)'}}>
      <div ref={containerRef} id="graph-container" style={{flex:1,position:'relative',overflow:'hidden'}}>
        <svg ref={svgRef} id="schema-graph" style={{width:'100%',height:'100%'}} />
        <div ref={loadingRef} id="loading-overlay" className="loading-overlay" style={{position:'absolute',inset:0}}>
          <div className="text-lg font-semibold text-indigo-600">Structuring Schema as GNN Graph & Calculating Layout...</div>
        </div>
      </div>
      <aside ref={sidebarRef} id="sidebar" className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto shrink-0 shadow-xl">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Node Details & GNN Explanation</h2>
        <div id="initial-message" className="space-y-4 text-gray-500">
          <p>Select a table node (large circle) to view its GNN prediction or an attribute node (small circle) for schema details.</p>
        </div>
        <div id="details-content" className="hidden space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-1" id="node-name"></h3>
            <p className="text-sm text-gray-500" id="node-type">Table/Attribute</p>
          </div>
          <div id="table-details">
            <div className="p-4 rounded-lg shadow-md mb-4" id="prediction-card">
              <h4 className="font-bold text-lg mb-2">GNN Prediction Score</h4>
              <div className="flex items-center space-x-2">
                <span className="text-3xl font-extrabold" id="risk-score">N/A</span>
                <span className="text-sm font-medium" id="risk-label"></span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Predicted likelihood of schema-related performance bottleneck (0.0 to 1.0).</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-bold text-md mb-2 text-gray-700">Table Statistics (GNN Input Features)</h4>
              <ul className="text-sm space-y-2">
                <li><span className="font-medium">Approximate Row Count:</span> <span id="row-count"></span></li>
                <li><span className="font-medium">Attribute Count:</span> <span id="attribute-count"></span></li>
              </ul>
            </div>
          </div>
          <div id="attribute-details" className="hidden p-4 border rounded-lg">
            <h4 className="font-bold text-md mb-2 text-gray-700">Attribute Metadata</h4>
            <ul className="text-sm space-y-2">
              <li><span className="font-medium">Parent Table:</span> <span id="attr-parent"></span></li>
              <li><span className="font-medium">Data Type:</span> <span id="attr-type"></span></li>
              <li><span className="font-medium">Key Type:</span> <span id="attr-key"></span></li>
            </ul>
          </div>
          <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
            <h4 className="font-bold text-md mb-2 text-yellow-800">XAI Attention Explanation</h4>
            <p className="text-sm text-yellow-900" id="attention-summary"></p>
          </div>
        </div>
      </aside>
    </div>
  )
}
