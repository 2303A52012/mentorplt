import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { mentorAPI, authAPI } from '../services/api'
import useAuth from '../hooks/useAuth'

const ALL_SKILLS = ['React','Node.js','Python','JavaScript','TypeScript','Java','C++','Ruby','Go','Rust','AWS','Azure','GCP','DevOps','Docker','Kubernetes','Machine Learning','Data Science','UI/UX','Product Management','MongoDB','PostgreSQL','GraphQL','REST APIs','System Design','Microservices','Blockchain','iOS','Android','Flutter','Redis','Kafka','TensorFlow','PyTorch']

export default function MentorProfileEdit() {
  const { user, updateUser } = useAuth()
  const [tab,     setTab]     = useState('basic')
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)

  const [userForm, setUserForm] = useState({ name:user?.name||'', bio:user?.bio||'', avatar:user?.avatar||'' })
  const [profile,  setProfile]  = useState({
    skills:[], experience:0, title:'', company:'',
    linkedin:'', github:'', website:'',
    availability:'available', hourlyRate:0,
  })

  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await mentorAPI.getMyProfile()
        const p = data.profile
        setProfile({
          skills:       p.skills       || [],
          experience:   p.experience   || 0,
          title:        p.title        || '',
          company:      p.company      || '',
          linkedin:     p.linkedin     || '',
          github:       p.github       || '',
          website:      p.website      || '',
          availability: p.availability || 'available',
          hourlyRate:   p.hourlyRate   || 0,
        })
      } catch {} // no profile yet
      finally { setLoading(false) }
    })()
  }, [])

  const toggleSkill = (sk) => setProfile(p => ({
    ...p,
    skills: p.skills.includes(sk) ? p.skills.filter(s=>s!==sk) : [...p.skills, sk],
  }))

  const saveBasic = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const { data } = await authAPI.updateProfile(userForm)
      updateUser(data.user)
      toast.success('Basic info updated!')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const saveProfile = async (e) => {
    e?.preventDefault(); setSaving(true)
    try {
      await mentorAPI.updateProfile(profile)
      toast.success('Profile updated!')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="page-loader"><div className="spinner" /></div>

  const TABS = [
    { id:'basic',   icon:'👤', label:'Basic Info'      },
    { id:'details', icon:'🧑‍🏫', label:'Mentor Details'  },
    { id:'skills',  icon:'⚡', label:'Skills'           },
  ]

  return (
    <div style={{ minHeight:'100vh' }}>
      <div style={{ position:'fixed', inset:0, background:'radial-gradient(ellipse 40% 30% at 70% 80%, rgba(255,77,109,0.05), transparent)', pointerEvents:'none' }} />
      <div style={{ maxWidth:860, margin:'0 auto', padding:'44px 28px 80px', position:'relative' }}>

        <h1 style={{ fontFamily:'var(--font-head)', fontSize:30, fontWeight:700, marginBottom:6 }}>Edit Your Profile</h1>
        <p style={{ color:'var(--ink-2)', marginBottom:28, fontSize:15 }}>Keep your profile fresh to attract the right mentees.</p>

        {/* Tabs */}
        <div style={{ display:'flex', gap:8, marginBottom:28 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              padding:'10px 20px', borderRadius:10, fontSize:14, fontWeight:700,
              cursor:'pointer', fontFamily:'var(--font-body)',
              background: tab===t.id ? 'var(--teal-dim)' : 'var(--bg-2)',
              border:`1px solid ${tab===t.id ? 'rgba(0,229,204,0.4)' : 'var(--border)'}`,
              color: tab===t.id ? 'var(--teal)' : 'var(--ink-2)',
              display:'flex', alignItems:'center', gap:7,
            }}>{t.icon} {t.label}</button>
          ))}
        </div>

        {/* ── Basic Info ── */}
        {tab==='basic' && (
          <form onSubmit={saveBasic} style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:20, padding:28, display:'flex', flexDirection:'column', gap:20 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div className="field">
                <label>Full Name</label>
                <input className="input" value={userForm.name} onChange={e=>setUserForm({...userForm,name:e.target.value})} required />
              </div>
              <div className="field">
                <label>Avatar URL</label>
                <input className="input" value={userForm.avatar} onChange={e=>setUserForm({...userForm,avatar:e.target.value})} placeholder="https://…" />
              </div>
            </div>
            {userForm.avatar && (
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <img src={userForm.avatar} alt="preview" style={{ width:60,height:60,borderRadius:14,objectFit:'cover',border:'2px solid var(--border-2)' }} onError={e=>e.target.style.display='none'} />
                <span style={{ fontSize:12,color:'var(--ink-3)' }}>Avatar preview</span>
              </div>
            )}
            <div className="field">
              <label>Bio</label>
              <textarea className="input" value={userForm.bio} onChange={e=>setUserForm({...userForm,bio:e.target.value})} placeholder="Tell mentees about yourself, your experience and what you love helping with…" maxLength={500} style={{ height:120 }} />
              <span style={{ fontSize:11, color:'var(--ink-3)', textAlign:'right' }}>{userForm.bio.length}/500</span>
            </div>
            <button type="submit" disabled={saving} className="btn btn-primary" style={{ alignSelf:'flex-start', padding:'12px 28px' }}>
              {saving ? 'Saving…' : '💾 Save Basic Info'}
            </button>
          </form>
        )}

        {/* ── Mentor Details ── */}
        {tab==='details' && (
          <form onSubmit={saveProfile} style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:20, padding:28, display:'flex', flexDirection:'column', gap:20 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div className="field">
                <label>Job Title</label>
                <input className="input" value={profile.title} onChange={e=>setProfile({...profile,title:e.target.value})} placeholder="Senior Engineer" />
              </div>
              <div className="field">
                <label>Company</label>
                <input className="input" value={profile.company} onChange={e=>setProfile({...profile,company:e.target.value})} placeholder="Google, Stripe…" />
              </div>
              <div className="field">
                <label>Years of Experience</label>
                <input className="input" type="number" min="0" max="50" value={profile.experience} onChange={e=>setProfile({...profile,experience:Number(e.target.value)})} />
              </div>
              <div className="field">
                <label>Hourly Rate ($ USD, 0 = Free)</label>
                <input className="input" type="number" min="0" value={profile.hourlyRate} onChange={e=>setProfile({...profile,hourlyRate:Number(e.target.value)})} />
              </div>
            </div>

            {/* Availability */}
            <div className="field">
              <label>Availability</label>
              <div style={{ display:'flex', gap:10 }}>
                {[
                  { v:'available',   icon:'🟢', label:'Available'   },
                  { v:'busy',        icon:'🟡', label:'Busy'        },
                  { v:'unavailable', icon:'🔴', label:'Unavailable' },
                ].map(a => (
                  <button key={a.v} type="button" onClick={()=>setProfile({...profile,availability:a.v})} style={{
                    flex:1, padding:'12px', borderRadius:10, cursor:'pointer', fontFamily:'var(--font-body)',
                    background: profile.availability===a.v ? 'var(--teal-dim)' : 'var(--bg-1)',
                    border:`1.5px solid ${profile.availability===a.v ? 'rgba(0,229,204,0.4)' : 'var(--border)'}`,
                    display:'flex', flexDirection:'column', alignItems:'center', gap:4, transition:'all .2s',
                  }}>
                    <span style={{ fontSize:20 }}>{a.icon}</span>
                    <span style={{ fontSize:13, fontWeight:700, color: profile.availability===a.v ? 'var(--teal)' : 'var(--ink-2)' }}>{a.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Links */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14 }}>
              <div className="field"><label>LinkedIn URL</label><input className="input" value={profile.linkedin} onChange={e=>setProfile({...profile,linkedin:e.target.value})} placeholder="https://linkedin.com/in/…" /></div>
              <div className="field"><label>GitHub URL</label><input className="input" value={profile.github} onChange={e=>setProfile({...profile,github:e.target.value})} placeholder="https://github.com/…" /></div>
              <div className="field"><label>Website</label><input className="input" value={profile.website} onChange={e=>setProfile({...profile,website:e.target.value})} placeholder="https://…" /></div>
            </div>

            <button type="submit" disabled={saving} className="btn btn-primary" style={{ alignSelf:'flex-start', padding:'12px 28px' }}>
              {saving ? 'Saving…' : '💾 Save Profile'}
            </button>
          </form>
        )}

        {/* ── Skills ── */}
        {tab==='skills' && (
          <div style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:20, padding:28 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <div>
                <h2 style={{ fontFamily:'var(--font-head)', fontSize:17, fontWeight:700, marginBottom:4 }}>Select Your Skills</h2>
                <p style={{ fontSize:13, color:'var(--ink-2)' }}>
                  <span style={{ color:'var(--teal)', fontWeight:700 }}>{profile.skills.length}</span> selected
                </p>
              </div>
              {profile.skills.length>0 && (
                <button onClick={()=>setProfile({...profile,skills:[]})} style={{ fontSize:12, color:'var(--coral)', background:'none', border:'none', cursor:'pointer', fontFamily:'var(--font-body)', fontWeight:700 }}>
                  Clear all
                </button>
              )}
            </div>

            <div style={{ display:'flex', flexWrap:'wrap', gap:9, marginBottom:24 }}>
              {ALL_SKILLS.map(sk => {
                const sel = profile.skills.includes(sk)
                return (
                  <button key={sk} type="button" onClick={()=>toggleSkill(sk)} style={{
                    padding:'8px 18px', borderRadius:100, cursor:'pointer',
                    fontFamily:'var(--font-body)', fontSize:13, fontWeight:700,
                    background: sel ? 'var(--teal-dim)' : 'var(--bg-1)',
                    border:`1.5px solid ${sel ? 'rgba(0,229,204,0.4)' : 'var(--border)'}`,
                    color: sel ? 'var(--teal)' : 'var(--ink-2)',
                    transition:'all .15s',
                  }}>
                    {sel && '✓ '}{sk}
                  </button>
                )
              })}
            </div>

            <button onClick={saveProfile} disabled={saving} className="btn btn-primary" style={{ padding:'12px 28px' }}>
              {saving ? 'Saving…' : '💾 Save Skills'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
