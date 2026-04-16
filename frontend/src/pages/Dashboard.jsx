import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import useAuth from '../hooks/useAuth'
import { sessionAPI, followAPI, mentorAPI } from '../services/api'

const STATUS_STYLES = {
  pending:   { color:'var(--gold)',  bg:'var(--gold-dim)'  },
  accepted:  { color:'var(--green)', bg:'var(--green-dim)' },
  rejected:  { color:'var(--coral)', bg:'var(--coral-dim)' },
  completed: { color:'var(--teal)',  bg:'var(--teal-dim)'  },
  cancelled: { color:'var(--ink-3)', bg:'rgba(255,255,255,.04)' },
}

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.cancelled
  return (
    <span style={{ padding:'3px 11px', borderRadius:100, fontSize:11, fontWeight:700, textTransform:'capitalize', background:s.bg, color:s.color }}>
      {status}
    </span>
  )
}

function StatCard({ icon, label, value, color='var(--teal)', sub }) {
  return (
    <div style={{
      background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:16,
      padding:'22px 24px', display:'flex', alignItems:'center', gap:16,
    }}>
      <div style={{
        width:50, height:50, borderRadius:14, flexShrink:0,
        background:`color-mix(in srgb, ${color} 15%, transparent)`,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:24,
      }}>{icon}</div>
      <div>
        <p style={{ fontSize:11, fontWeight:700, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:4 }}>{label}</p>
        <p style={{ fontFamily:'var(--font-head)', fontSize:28, fontWeight:700, color:'var(--ink)', lineHeight:1 }}>{value}</p>
        {sub && <p style={{ fontSize:12, color:'var(--ink-3)', marginTop:3 }}>{sub}</p>}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [sessions,   setSessions]   = useState([])
  const [following,  setFollowing]  = useState([])
  const [myProfile,  setMyProfile]  = useState(null)
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const [sRes, fRes] = await Promise.all([
          sessionAPI.getMy(),
          user.role==='mentee' ? followAPI.getFollowing() : Promise.resolve({ data:{ following:[] } }),
        ])
        setSessions(sRes.data.sessions)
        setFollowing(fRes.data.following)
        if (user.role==='mentor') {
          try {
            const pRes = await mentorAPI.getMyProfile()
            setMyProfile(pRes.data.profile)
          } catch {}
        }
      } catch { toast.error('Failed to load dashboard') }
      finally { setLoading(false) }
    })()
  }, [user.role])

  const handleAction = async (id, status) => {
    try {
      await sessionAPI.updateStatus(id, { status })
      setSessions(ss => ss.map(s => s._id===id ? {...s, status} : s))
      toast.success(`Session ${status}`)
    } catch { toast.error('Failed to update session') }
  }

  if (loading) return <div className="page-loader"><div className="spinner" /></div>

  const pending   = sessions.filter(s=>s.status==='pending').length
  const completed = sessions.filter(s=>s.status==='completed').length
  const accepted  = sessions.filter(s=>s.status==='accepted').length

  return (
    <div style={{ minHeight:'100vh', position:'relative' }}>
      {/* Subtle BG */}
      <div style={{ position:'fixed', inset:0, background:'radial-gradient(ellipse 50% 40% at 15% 20%, rgba(0,229,204,0.04), transparent)', pointerEvents:'none' }} />

      <div style={{ maxWidth:1280, margin:'0 auto', padding:'44px 28px 80px', position:'relative' }}>
        {/* Welcome */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:16, marginBottom:36 }}>
          <div>
            <p style={{ fontSize:13, fontWeight:700, color:'var(--teal)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:6, fontFamily:'var(--font-mono)' }}>
              {new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}
            </p>
            <h1 style={{ fontFamily:'var(--font-head)', fontSize:'clamp(24px,4vw,36px)', fontWeight:700, marginBottom:6 }}>
              Hey, {user.name.split(' ')[0]} 👋
            </h1>
            <p style={{ color:'var(--ink-2)', fontSize:15 }}>
              {user.role==='mentor' ? "Here's your mentoring activity at a glance." : "Here's your learning journey at a glance."}
            </p>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            {user.role==='mentee' && <Link to="/mentors" className="btn btn-primary">🔍 Find Mentors</Link>}
            {user.role==='mentor' && <Link to="/mentor/edit" className="btn btn-primary">✏️ Edit Profile</Link>}
            <Link to="/sessions" className="btn btn-ghost">📅 All Sessions</Link>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16, marginBottom:32 }}>
          <StatCard icon="📅" label="Total Sessions" value={sessions.length} color="var(--teal)" />
          <StatCard icon="⏳" label="Pending" value={pending} color="var(--gold)" />
          <StatCard icon="✅" label="Completed" value={completed} color="var(--green)" />
          {user.role==='mentee'
            ? <StatCard icon="👥" label="Following" value={following.length} color="var(--violet)" />
            : <StatCard icon="⭐" label="Rating" value={myProfile?.rating>0 ? myProfile.rating.toFixed(1) : '—'} color="var(--gold)" sub={myProfile?.totalReviews ? `${myProfile.totalReviews} reviews` : 'no reviews yet'} />
          }
        </div>

        {/* Two-col layout */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:20, alignItems:'start' }}>

          {/* Sessions panel */}
          <div style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:18, padding:24 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h2 style={{ fontFamily:'var(--font-head)', fontSize:17, fontWeight:700 }}>Recent Sessions</h2>
              <Link to="/sessions" style={{ fontSize:13, fontWeight:700, color:'var(--teal)' }}>See all →</Link>
            </div>

            {sessions.length===0 ? (
              <div style={{ textAlign:'center', padding:'32px 0', color:'var(--ink-3)' }}>
                <div style={{ fontSize:40, marginBottom:12 }}>📭</div>
                <p style={{ marginBottom:8 }}>No sessions yet</p>
                {user.role==='mentee' && <Link to="/mentors" style={{ color:'var(--teal)', fontWeight:700, fontSize:14 }}>Find a mentor →</Link>}
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {sessions.slice(0,6).map(s => (
                  <div key={s._id} style={{
                    display:'flex', justifyContent:'space-between', alignItems:'center', gap:12,
                    padding:'13px 0', borderBottom:'1px solid var(--border)',
                  }}>
                    <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                      <div style={{
                        width:40, height:40, borderRadius:10, flexShrink:0,
                        background:'linear-gradient(135deg,var(--teal),var(--violet))',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:16, fontWeight:700, color:'var(--bg)', fontFamily:'var(--font-head)',
                      }}>
                        {(user.role==='mentee' ? s.mentor : s.mentee)?.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontSize:14, fontWeight:600, marginBottom:2 }}>{s.title}</p>
                        <p style={{ fontSize:12, color:'var(--ink-3)', fontFamily:'var(--font-mono)' }}>
                          {user.role==='mentee' ? s.mentor?.name : s.mentee?.name}
                          {' · '}{new Date(s.scheduledAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <StatusBadge status={s.status} />
                      {user.role==='mentor' && s.status==='pending' && (
                        <div style={{ display:'flex', gap:6 }}>
                          <button onClick={()=>handleAction(s._id,'accepted')} style={{ width:26,height:26,borderRadius:6,background:'var(--green-dim)',border:'1px solid rgba(34,197,94,0.3)',color:'var(--green)',fontSize:13,cursor:'pointer' }}>✓</button>
                          <button onClick={()=>handleAction(s._id,'rejected')} style={{ width:26,height:26,borderRadius:6,background:'var(--coral-dim)',border:'1px solid rgba(255,77,109,0.3)',color:'var(--coral)',fontSize:13,cursor:'pointer' }}>✕</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Side panel */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {/* Following (mentee) */}
            {user.role==='mentee' && (
              <div style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:18, padding:22 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                  <h2 style={{ fontFamily:'var(--font-head)', fontSize:16, fontWeight:700 }}>Following</h2>
                  <Link to="/mentors" style={{ fontSize:12, fontWeight:700, color:'var(--teal)' }}>Browse →</Link>
                </div>
                {following.length===0 ? (
                  <div style={{ textAlign:'center', padding:'20px 0', color:'var(--ink-3)', fontSize:13 }}>
                    <div style={{ fontSize:32, marginBottom:8 }}>🔍</div>
                    Not following anyone yet
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {following.slice(0,5).map(m => (
                      <Link key={m._id} to={`/mentors/${m._id}`} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 0', borderBottom:'1px solid var(--border)', textDecoration:'none' }}>
                        <div style={{ width:34,height:34,borderRadius:9,background:'linear-gradient(135deg,var(--teal),var(--coral))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,color:'var(--bg)',flexShrink:0 }}>
                          {m.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontSize:13, fontWeight:600, color:'var(--ink)' }}>{m.name}</p>
                          <p style={{ fontSize:11, color:'var(--ink-3)' }}>Mentor</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Mentor quick stats */}
            {user.role==='mentor' && myProfile && (
              <div style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:18, padding:22 }}>
                <h2 style={{ fontFamily:'var(--font-head)', fontSize:16, fontWeight:700, marginBottom:16 }}>Profile Stats</h2>
                {[
                  { label:'Followers',      value:myProfile.followers||0 },
                  { label:'Total Reviews',  value:myProfile.totalReviews||0 },
                  { label:'Total Sessions', value:myProfile.totalSessions||0 },
                  { label:'Hourly Rate',    value:myProfile.hourlyRate>0?`$${myProfile.hourlyRate}/hr`:'Free' },
                  { label:'Availability',   value:myProfile.availability },
                ].map(row => (
                  <div key={row.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 0', borderBottom:'1px solid var(--border)' }}>
                    <span style={{ fontSize:13, color:'var(--ink-2)' }}>{row.label}</span>
                    <span style={{ fontSize:14, fontWeight:700, color:'var(--ink)', fontFamily:'var(--font-head)', textTransform:'capitalize' }}>{row.value}</span>
                  </div>
                ))}
                <Link to="/mentor/edit" style={{ display:'block', textAlign:'center', marginTop:14, padding:'10px', background:'var(--teal-dim)', border:'1px solid rgba(0,229,204,0.25)', borderRadius:10, color:'var(--teal)', fontWeight:700, fontSize:13 }}>
                  ✏️ Update Profile
                </Link>
              </div>
            )}

            {/* Active sessions reminder */}
            {accepted>0 && (
              <div style={{ background:'rgba(0,229,204,0.06)', border:'1px solid rgba(0,229,204,0.2)', borderRadius:14, padding:'16px 18px' }}>
                <p style={{ fontSize:13, fontWeight:700, color:'var(--teal)', marginBottom:4 }}>🟢 {accepted} Active Session{accepted>1?'s':''}</p>
                <p style={{ fontSize:12, color:'var(--ink-2)' }}>You have confirmed sessions coming up.</p>
                <Link to="/sessions?status=accepted" style={{ fontSize:12, color:'var(--teal)', fontWeight:700, marginTop:6, display:'inline-block' }}>View details →</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
