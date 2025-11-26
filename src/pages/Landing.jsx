import React, { useContext } from 'react'
import ScrollProgress from '../components/ScrollProgress'
import { motion } from 'framer-motion'
import { AuthModalContext } from '../App'

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: 'easeOut' },
  },
})

export default function Landing() {
  return (
    <div className="page landing relative min-h-screen overflow-x-hidden bg-gradient-to-b from-slate-900 via-indigo-900 to-slate-800 text-white">
      <ScrollProgress />

      <motion.header
        className="hero relative z-20 max-w-4xl mx-auto pt-28 sm:pt-32 pb-12 px-5 text-center"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight"
          initial={{ scale: 0.98 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.7 }}
        >
          Graph Neural Network Database Intelligence Lens
        </motion.h1>

        <motion.div
          className="flex justify-center mt-10 mb-8"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          whileHover={{ scale: 1.02 }}
        >
          <video
            src="https://res.cloudinary.com/dnsjdvzdn/video/upload/v1764154753/Untitled_design_srzwyy.mp4"
            autoPlay
            muted
            loop
            playsInline
            style={{
              width: '260px',
              height: '80px',
              objectFit: 'contain',
              borderRadius: '16px',
              
              background:
                'radial-gradient(circle at 0% 0%, rgba(127,90,240,0.18), transparent 55%), radial-gradient(circle at 100% 100%, rgba(90,208,255,0.12), transparent 55%)',
            }}
          />
        </motion.div>

        <motion.p
          className="text-slate-200 mt-4 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
          variants={fadeUp(0.1)}
          initial="hidden"
          animate="visible"
        >
          Transform your schema into an intelligent graph that reveals bottlenecks,
          highlights anomalies, and guides optimization through graph neural network
          analysis.
        </motion.p>

        <motion.p
          className="text-slate-300 mt-3 text-xs sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed"
          variants={fadeUp(0.18)}
          initial="hidden"
          animate="visible"
        >
          Works with MySQL, PostgreSQL, MongoDB and more — mapping tables, relationships
          and real query traffic into a unified, explainable graph model.
        </motion.p>

        <CTA />
      </motion.header>

      <main className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-28">
        <motion.section
          id="learn"
          className="features mt-20"
          variants={fadeUp(0.05)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="h-scroll flex gap-5 overflow-x-auto py-4 px-2 snap-x snap-mandatory touch-pan-x scrollbar-hide">
            <Feature
              icon="fa-network-wired"
              title="Graph-native schema view"
              desc="Convert tables to nodes and foreign keys to edges enriched with types, indexes and live query signals."
              order={0}
            />
            <Feature
              icon="fa-robot"
              title="GNN-driven analysis"
              desc="A dedicated GNN highlights anomalies, costly joins, inefficiencies and structural weaknesses."
              order={0.05}
            />
            <Feature
              icon="fa-chart-line"
              title="Visual understanding"
              desc="Use interactive clustering, heatmaps and graph layers to see performance issues at a glance."
              order={0.1}
            />
          </div>
        </motion.section>

        <motion.section
          className="horizontal-features mt-16"
          aria-label="capabilities"
          variants={fadeUp(0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="h-scroll flex gap-5 overflow-x-auto py-8 px-2 snap-x snap-mandatory touch-pan-x scrollbar-hide">
            <Card
              title="Fast performance insights"
              desc="Ingest schema metadata and query traffic to surface critical joins and latency paths instantly."
            />
            <Card
              title="Autonomous suggestions"
              desc="Index proposals, join rewrites and structural refactors, ordered by estimated performance impact."
            />
            <Card
              title="Schema evolution timeline"
              desc="Track schema changes across releases with visual diffs, snapshots and change annotations."
            />
            <Card
              title="Team-ready visibility"
              desc="Give backend, DBAs and SREs a shared, unified view of database behavior in one place."
            />
          </div>
        </motion.section>

        <motion.section
          className="about-card mt-14 flex justify-center items-center"
          variants={fadeUp(0.05)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          style={{
            padding: '16px',
            background: 'transparent',
            boxShadow: 'none',
            border: 'none',
          }}
        >
          <motion.img
            src="https://res.cloudinary.com/dnsjdvzdn/image/upload/v1764159586/Gemini_Generated_Image_kthqhokthqhokthq_gxikhl.png"
            alt="graph-visual"
            style={{
              width: '500px',
              height: '250px',
              objectFit: 'contain',
              margin: '0 auto',
              display: 'block',
              borderRadius: '12px',
            }}
            whileHover={{
              scale: 1.04,
              borderRadius: '24px',
              boxShadow: '0 18px 45px rgba(0,0,0,0.65)',
            }}
            transition={{
              duration: 0.25,
              ease: 'easeOut',
            }}
          />
        </motion.section>

        <motion.h2
          className="text-center text-xl sm:text-2xl font-semibold mt-20 mb-6 text-white"
          variants={fadeUp(0.05)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          Built for modern engineering teams
        </motion.h2>

        <motion.section
          className="grid gap-8 md:grid-cols-3 px-2"
          variants={fadeUp(0.08)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
        >
          <RoleCard
            title="Backend engineers"
            body="Understand how queries, joins and data flows impact latency and user experience."
          />
          <RoleCard
            title="DBAs & data owners"
            body="Monitor database health, index efficiency and structural risk from a single workspace."
          />
          <RoleCard
            title="Data & platform teams"
            body="Plan schema changes and pipelines with full visibility into dependencies and workloads."
          />
        </motion.section>

        <motion.h2
          className="text-center text-xl sm:text-2xl font-semibold mt-24 mb-6 text-white"
          variants={fadeUp(0.05)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          How it works
        </motion.h2>

        <motion.section
          className="about-card mt-6"
          variants={fadeUp(0.12)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="grid gap-10 md:grid-cols-3 py-4 px-2">
            <Step
              number="01"
              title="Connect"
              body="Connect your databases securely. The platform discovers schemas, relations, indexes and query patterns."
            />
            <Step
              number="02"
              title="Analyze with GNN"
              body="A graph neural model learns from structure and traffic to highlight anomalies, weak joins and potential improvements."
            />
            <Step
              number="03"
              title="Optimize"
              body="Review recommended indexes, refactors and routing improvements, each with explainable impact hints."
            />
          </div>
        </motion.section>

        <motion.h2
          className="text-center text-xl sm:text-2xl font-semibold mt-24 mb-4 text-white"
          variants={fadeUp(0.05)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          Why teams choose a graph-first view
        </motion.h2>

        <motion.p
          className="text-center text-slate-300 text-sm max-w-xl mx-auto leading-relaxed mb-20 px-2"
          variants={fadeUp(0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          Faster root-cause analysis, clearer schema visibility, and actionable intelligence
          — powered by a modern graph and GNN-backed engine designed for real-world
          workloads.
        </motion.p>

        <footer className="footer mt-14 text-center text-slate-400 text-xs">
          <small>
            © {new Date().getFullYear()} Graph Neural Database Lens. All rights reserved.
          </small>
        </footer>
      </main>
    </div>
  )
}

function Feature({ icon, title, desc, order = 0 }) {
  return (
    <motion.div
      className="feature snap-center min-w-[240px] sm:min-w-[260px] md:min-w-[300px] p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/5 text-center"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: order }}
    >
      <i className={`fa-solid ${icon} text-3xl mb-4 block`} />
      <h3 className="text-base sm:text-lg md:text-xl font-semibold">{title}</h3>
      <p className="mt-3 text-xs sm:text-sm text-slate-200 leading-relaxed">{desc}</p>
    </motion.div>
  )
}

function Card({ title, desc }) {
  return (
    <motion.article
      className="h-card snap-center min-w-[240px] p-5 bg-white/5 rounded-xl border border-white/10"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.18 }}
    >
      <h4 className="font-semibold text-base">{title}</h4>
      <p className="text-xs sm:text-sm text-slate-200 mt-2 leading-relaxed">{desc}</p>
    </motion.article>
  )
}

function CTA() {
  const { openModal } = useContext(AuthModalContext)
  return (
    <div className="mt-7 flex justify-center">
      <motion.button
        className="btn primary shadow-lg px-5 py-3 rounded-md bg-indigo-500 hover:bg-indigo-600"
        onClick={() => openModal && openModal('signup')}
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.98 }}
      >
        Get started — free
      </motion.button>
    </div>
  )
}

function Stat({ label, value, note }) {
  return (
    <div>
      <div className="text-sm text-slate-300 mb-1">{label}</div>
      <div className="text-2xl sm:text-3xl font-semibold text-white">{value}</div>
      <div className="text-[11px] text-slate-500 mt-1">{note}</div>
    </div>
  )
}

function RoleCard({ title, body }) {
  return (
    <motion.div
      className="about-card h-full"
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18 }}
    >
      <h3 style={{ marginTop: 0, marginBottom: 6 }}>{title}</h3>
      <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.6 }}>{body}</p>
    </motion.div>
  )
}

function Step({ number, title, body }) {
  return (
    <div>
      <div className="text-xs text-slate-400 mb-1 tracking-[0.18em] uppercase">
        {number}
      </div>
      <h4 style={{ margin: 0, marginBottom: 4 }}>{title}</h4>
      <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.6 }}>{body}</p>
    </div>
  )
}
