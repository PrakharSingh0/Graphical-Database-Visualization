import React, { useEffect, useState } from 'react'

export default function ScrollProgress(){
	const [pct, setPct] = useState(0)
	useEffect(()=>{
		const onScroll = () => {
			const h = document.documentElement.scrollHeight - window.innerHeight
			const pos = window.scrollY
			const p = h > 0 ? Math.min(100, Math.round((pos / h) * 100)) : 0
			setPct(p)
		}
		window.addEventListener('scroll', onScroll, { passive: true })
		onScroll()
		return ()=> window.removeEventListener('scroll', onScroll)
	},[])
	return (
		<div className="scroll-progress" aria-hidden>
			<div className="scroll-progress-bar" style={{width: `${pct}%`}} />
		</div>
	)
}
