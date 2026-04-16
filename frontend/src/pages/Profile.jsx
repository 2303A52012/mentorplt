import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { mentorAPI, followAPI, feedbackAPI, sessionAPI } from '../services/api'
import useAuth from '../hooks/useAuth'

function Stars({ n, interactive, onRate }) {
  return (
    <div className="stars">
      {[1,2,3,4,5].map(i => (
        <span key={i}
          className={`star ${i<=Math.round(n)?'on':''} ${interactive?'interactive':''}`}
          style={{ fontSize: interactive?26:15 }}
          onClick={() => interactive && onRate && onRate(i)}
        >★</span>
      ))}
    </div>
  )
}

const AVAIL = {
  available:   { label:'Available',   color:'var(--green)',  bg:'var(--green-dim)' },
  busy:        { label:'Busy',        color:'var(--gold)',   bg:'var(--gold-dim)'  },
  unavailable: { label:'Unavailable', color:'var(--coral)',  bg:'var(--coral-dim)' },
}

export default function Profile() {
  const { id } = useParams()
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [mentor,      setMentor]      = useState(null)
  const [feedback,    setFeedback]    = useState([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading,     setLoading]     = useState(true)
  const [followLoading, setFollowLoading] = useState(false)
  const [tab,         setTab]         = useState('about')
  const [showBook,    setShowBook]    = useState(false)
  const [showReview,  setShowReview]  = useState(false)
  const [sessForm,    setSessForm]    = useState({ title:'', description:'', scheduledAt:'', duration:60 })
  const [revForm,     setRevForm]     = useState({ rating:5, review:'' })
  const [submitting,  setSubmitting]  = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const [mRes, fRes] = await Promise.all([
          mentorAPI.getOne(id),
          feedbackAPI.getMentorFeedback(id),
        ])
        setMentor(mRes.data.mentor)
        setFeedback(fRes.data.feedback)
        if (isAuthenticated) {
          const { data } = await followAPI.checkFollow(id)
          setIsFollowing(data.isFollowing)
        }
      } catch { toast.error('Failed to load profile') }
      finally { setLoading(false) }
    })()
  }, [id, isAuthenticated])

  const handleFollow = async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    setFollowLoading(true)
    try {
      if (isFollowing) {
        await followAPI.unfollow(id)
        setIsFollowing(false)
        setMentor(m => ({ ...m, followers: (m.followers||1)-1 }))
        toast('Unfollowed')
      } else {
        await followAPI.follow(id)
        setIsFollowing(true)
        setMentor(m => ({ ...m, followers: (m.followers||0)+1 }))
        toast.success('Now following!')
      }
    } catch (e) { toast.error(e.response?.data?.message || 'Error') }
    finally { setFollowLoading(false) }
  }

  const handleBook = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) { navigate('/login'); return }
    setSubmitting(true)
    try {
      await sessionAPI.book({ mentor: id, ...sessForm })
      toast.success('Session request sent! 📅')
      setShowBook(false)
      setSessForm({ title:'', description:'', scheduledAt:'', duration:60 })
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to book') }
    finally { setSubmitting(false) }
  }

  const handleReview = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) { navigate('/login'); return }
    setSubmitting(true)
    try {
      const { data } = await feedbackAPI.submit({ mentor: id, ...revForm })
      setFeedback(f => [data.feedback, ...f])
      toast.success('Review submitted! ⭐')
      setShowReview(false)
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to submit') }
    finally { setSubmitting(false) }
  }

  if (loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!mentor)  return <div style={{ textAlign:'center', padding:80, color:'var(--ink-2)' }}>Mentor not found.</div>

  const { user:mu, skills=[], experience, rating, totalReviews, availability, title, company, linkedin, github, website, totalSessions, followers, hourlyRate } = mentor
  const av      = AVAIL[availability] || AVAIL.unavailable
  const isOwn   = user?._id === mu?._id
  const canBook = isAuthenticated && !isOwn
  const canReview = isAuthenticated && user?.role === 'mentee' && !isOwn

  return (
    <div style={{ minHeight:'100vh' }}>
      {/* Hero header */}
      <div style={{ position:'relative', overflow:'hidden' }}>
        {/* Decorative BG */}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg, rgba(0,229,204,0.06) 0%, transparent 100%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:-80, right:-80, width:320, height:320, borderRadius:'50%', background:'radial-gradient(circle, rgba(124,92,252,0.08), transparent 70%)', pointerEvents:'none' }} />

        <div style={{ maxWidth:1100, margin:'0 auto', padding:'48px 28px 40px', position:'relative' }}>
          <div style={{ display:'flex', gap:24, alignItems:'flex-start', flexWrap:'wrap' }}>
            {/* Avatar */}
            <div style={{
              width:104, height:104, borderRadius:22, flexShrink:0,
              background:'linear-gradient(135deg,var(--teal),var(--violet))',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:44, fontWeight:700, color:'var(--bg)', fontFamily:'var(--font-head)',
              border:'3px solid rgba(0,229,204,0.3)',
              overflow:'hidden',
            }}>
              {mu.avatar
                ? <img src={mu.avatar} alt={mu.name} style={{ width:'100%',height:'100%',objectFit:'cover' }} />
                : mu.name?.[0]?.toUpperCase()}
            </div>

            {/* Info */}
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap', marginBottom:5 }}>
                <h1 style={{ fontFamily:'var(--font-head)', fontSize:'clamp(24px,4vw,34px)', fontWeight:700 }}>{mu.name}</h1>
                <span style={{ padding:'4px 12px', borderRadius:100, fontSize:12, fontWeight:700, background:av.bg, color:av.color }}>{av.label}</span>
              </div>
              {(title||company) && (
                <p style={{ fontSize:15, color:'var(--ink-2)', marginBottom:14 }}>{[title,company].filter(Boolean).join(' at ')}</p>
              )}
              {/* Stats row */}
              <div style={{ display:'flex', flexWrap:'wrap', gap:0 }}>
                {[
                  { v:`⭐ ${rating>0?rating.toFixed(1):'New'}`, l:'Rating' },
                  { v:totalReviews||0,  l:'Reviews'  },
                  { v:`${experience||0}yr`, l:'Experience' },
                  { v:followers||0,     l:'Followers' },
                  { v:totalSessions||0, l:'Sessions'  },
                ].map((s,i) => (
                  <React.Fragment key={i}>
                    {i>0 && <div style={{ width:1, height:36, background:'var(--border)', margin:'0 16px' }} />}
                    <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
                      <span style={{ fontSize:16, fontWeight:700, fontFamily:'var(--font-head)' }}>{s.v}</span>
                      <span style={{ fontSize:10, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'.6px' }}>{s.l}</span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            {!isOwn && (
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                <button onClick={handleFollow} disabled={followLoading} style={{
                  padding:'10px 22px', borderRadius:10, border:'1px solid',
                  borderColor: isFollowing ? 'rgba(0,229,204,0.4)' : 'rgba(0,229,204,0.3)',
                  background: isFollowing ? 'rgba(0,229,204,0.1)' : 'transparent',
                  color:'var(--teal)', fontSize:14, fontWeight:700,
                  cursor:'pointer', fontFamily:'var(--font-body)',
                  opacity: followLoading ? .6 : 1,
                }}>
                  {isFollowing ? '✓ Following' : '+ Follow'}
                </button>
                {canBook && (
                  <button onClick={() => setShowBook(true)} className="btn btn-primary">
                    📅 Book Session
                  </button>
                )}
                {canReview && (
                  <button onClick={() => setShowReview(true)} style={{
                    padding:'10px 18px', borderRadius:10, background:'var(--gold-dim)',
                    border:'1px solid rgba(255,194,62,0.3)', color:'var(--gold)',
                    fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-body)',
                  }}>⭐ Review</button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom:'1px solid var(--border)', position:'sticky', top:63, zIndex:50, background:'var(--bg)', backdropFilter:'blur(10px)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 28px', display:'flex', gap:0 }}>
          {['about','skills','reviews'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding:'14px 20px', background:'none', border:'none',
              borderBottom:`2px solid ${tab===t?'var(--teal)':'transparent'}`,
              color: tab===t ? 'var(--teal)' : 'var(--ink-2)',
              fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-head)',
              textTransform:'capitalize', transition:'all .2s',
              display:'flex', alignItems:'center', gap:7,
            }}>
              {t}
              {t==='reviews' && totalReviews>0 && (
                <span style={{ background:'var(--teal-dim)', color:'var(--teal)', borderRadius:100, padding:'0 7px', fontSize:11, fontWeight:700 }}>{totalReviews}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'36px 28px 80px' }}>
        {tab==='about' && (
          <div style={{ maxWidth:680, animation:'fadeUp .3s ease' }}>
            <h2 style={{ fontFamily:'var(--font-head)', fontSize:20, marginBottom:14 }}>About</h2>
            <p style={{ fontSize:15, color:'var(--ink-2)', lineHeight:1.75, marginBottom:24 }}>{mu.bio || 'No bio provided yet.'}</p>

            {hourlyRate>0 && (
              <div style={{ display:'inline-flex', alignItems:'center', gap:12, padding:'12px 22px', background:'var(--green-dim)', border:'1px solid rgba(34,197,94,0.2)', borderRadius:12, marginBottom:24 }}>
                <span style={{ fontSize:13, color:'var(--ink-2)' }}>Hourly Rate</span>
                <span style={{ fontSize:24, fontWeight:700, color:'var(--green)', fontFamily:'var(--font-head)' }}>${hourlyRate}<span style={{ fontSize:14 }}>/hr</span></span>
              </div>
            )}

            {(linkedin||github||website) && (
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                {[[linkedin,'🔗 LinkedIn'],[github,'🐙 GitHub'],[website,'🌐 Website']].filter(([u])=>u).map(([url,label]) => (
                  <a key={label} href={url} target="_blank" rel="noreferrer" style={{
                    padding:'8px 16px', background:'var(--bg-2)', border:'1px solid var(--border)',
                    borderRadius:8, fontSize:13, fontWeight:600, color:'var(--ink-2)',
                    transition:'border-color .2s',
                  }}>{label}</a>
                ))}
              </div>
            )}
          </div>
        )}

        {tab==='skills' && (
          <div style={{ animation:'fadeUp .3s ease' }}>
            <h2 style={{ fontFamily:'var(--font-head)', fontSize:20, marginBottom:18 }}>Skills & Expertise</h2>
            <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
              {skills.length>0 ? skills.map(s => (
                <span key={s} style={{
                  padding:'9px 20px', background:'var(--teal-dim)', border:'1px solid rgba(0,229,204,0.2)',
                  borderRadius:100, fontSize:14, fontWeight:600, color:'var(--teal)',
                }}>{s}</span>
              )) : <p style={{ color:'var(--ink-3)' }}>No skills listed yet.</p>}
            </div>
          </div>
        )}

        {tab==='reviews' && (
          <div style={{ animation:'fadeUp .3s ease', maxWidth:680 }}>
            <h2 style={{ fontFamily:'var(--font-head)', fontSize:20, marginBottom:18 }}>Reviews ({feedback.length})</h2>
            {feedback.length===0 ? (
              <div style={{ textAlign:'center', padding:'40px 0', color:'var(--ink-3)' }}>
                <div style={{ fontSize:40, marginBottom:12 }}>⭐</div>
                <p>No reviews yet. Be the first to review!</p>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {feedback.map((f,i) => (
                  <div key={f._id} style={{
                    background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:14,
                    padding:20, animation:`fadeUp .3s ease ${i*0.05}s both`,
                  }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
                      <div style={{
                        width:38, height:38, borderRadius:10, flexShrink:0,
                        background:'linear-gradient(135deg,var(--coral),var(--violet))',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:15, fontWeight:700, color:'#fff',
                      }}>{f.mentee?.name?.[0]?.toUpperCase()}</div>
                      <div style={{ flex:1 }}>
                        <p style={{ fontSize:14, fontWeight:700, marginBottom:3 }}>{f.mentee?.name}</p>
                        <Stars n={f.rating} />
                      </div>
                      <span style={{ fontSize:12, color:'var(--ink-3)' }}>{new Date(f.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p style={{ fontSize:14, color:'var(--ink-2)', lineHeight:1.65 }}>{f.review}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Book Modal */}
      {showBook && (
        <div className="overlay" onClick={() => setShowBook(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <h2 style={{ fontFamily:'var(--font-head)', fontSize:20, marginBottom:22 }}>📅 Book a Session</h2>
            <form onSubmit={handleBook} style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div className="field"><label>Session Title</label>
                <input className="input" value={sessForm.title} onChange={e=>setSessForm({...sessForm,title:e.target.value})} placeholder="What do you want to discuss?" required />
              </div>
              <div className="field"><label>Description (optional)</label>
                <textarea className="input" value={sessForm.description} onChange={e=>setSessForm({...sessForm,description:e.target.value})} placeholder="Add more context…" style={{ height:80 }} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:12 }}>
                <div className="field"><label>Date & Time</label>
                  <input className="input" type="datetime-local" value={sessForm.scheduledAt} onChange={e=>setSessForm({...sessForm,scheduledAt:e.target.value})} required />
                </div>
                <div className="field"><label>Duration</label>
                  <select className="input" value={sessForm.duration} onChange={e=>setSessForm({...sessForm,duration:Number(e.target.value)})}>
                    {[30,45,60,90,120].map(d=><option key={d} value={d}>{d} min</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:6 }}>
                <button type="button" onClick={()=>setShowBook(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Sending…' : 'Send Request →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReview && (
        <div className="overlay" onClick={() => setShowReview(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <h2 style={{ fontFamily:'var(--font-head)', fontSize:20, marginBottom:22 }}>⭐ Review {mu.name}</h2>
            <form onSubmit={handleReview} style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div className="field">
                <label>Your Rating</label>
                <Stars n={revForm.rating} interactive onRate={r => setRevForm({...revForm,rating:r})} />
              </div>
              <div className="field"><label>Your Review</label>
                <textarea className="input" value={revForm.review} onChange={e=>setRevForm({...revForm,review:e.target.value})} placeholder="Share your experience…" style={{ height:120 }} required />
              </div>
              <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
                <button type="button" onClick={()=>setShowReview(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" disabled={submitting} style={{
                  padding:'10px 22px', background:'var(--gold)', border:'none', borderRadius:8,
                  color:'var(--bg)', fontWeight:700, cursor:'pointer', fontFamily:'var(--font-body)',
                }}>
                  {submitting ? 'Submitting…' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
