import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setOpen(false) }, [pathname])

  const isActive = (p) => pathname === p || pathname.startsWith(p + '/')

  const links = [
    { to: '/mentors',   label: 'Discover' },
    ...(isAuthenticated ? [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/sessions',  label: 'Sessions'  },
    ] : []),
    ...(user?.role === 'mentor' ? [{ to: '/mentor/edit', label: 'My Profile' }] : []),
    ...(user?.role === 'admin'  ? [{ to: '/admin',       label: 'Admin'      }] : []),
  ]

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: scrolled ? 'rgba(5,5,8,0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      transition: 'all .3s ease',
    }}>
      <nav style={{ maxWidth:1300, margin:'0 auto', padding:'0 28px', height:64, display:'flex', alignItems:'center', gap:32 }}>

        {/* Logo */}
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
          <div style={{
            width:34, height:34, borderRadius:10,
            background:'linear-gradient(135deg, var(--teal), var(--violet))',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:16, fontWeight:900, color:'var(--bg)',
            fontFamily:'var(--font-head)',
          }}>M</div>
          <span style={{ fontFamily:'var(--font-head)', fontWeight:700, fontSize:20, letterSpacing:'-0.5px' }}>
            Mentor<span style={{ color:'var(--teal)' }}>Hub</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display:'flex', gap:2, flex:1 }} className="hide-mobile">
          {links.map(l => (
            <Link key={l.to} to={l.to} style={{
              padding:'7px 15px', borderRadius:8, fontSize:14, fontWeight:600,
              color: isActive(l.to) ? 'var(--ink)' : 'var(--ink-2)',
              background: isActive(l.to) ? 'rgba(255,255,255,0.07)' : 'transparent',
              transition: 'all .2s',
            }}>{l.label}</Link>
          ))}
        </div>

        {/* Auth */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginLeft:'auto', flexShrink:0 }} className="hide-mobile">
          {isAuthenticated ? (
            <>
              <div style={{
                display:'flex', alignItems:'center', gap:9, padding:'5px 14px 5px 5px',
                background:'var(--bg-2)', border:'1px solid var(--border)',
                borderRadius:100,
              }}>
                <div style={{
                  width:30, height:30, borderRadius:'50%', flexShrink:0,
                  background:'linear-gradient(135deg,var(--teal),var(--coral))',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:13, fontWeight:700, color:'var(--bg)',
                }}>{user?.name?.[0]?.toUpperCase()}</div>
                <span style={{ fontSize:14, fontWeight:600 }}>{user?.name?.split(' ')[0]}</span>
                <span style={{
                  fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:100,
                  background:'var(--teal-dim)', color:'var(--teal)',
                  textTransform:'uppercase', letterSpacing:'.5px',
                }}>{user?.role}</span>
              </div>
              <button onClick={() => { logout(); navigate('/login') }} style={{
                background:'transparent', border:'1px solid var(--border)',
                color:'var(--ink-2)', padding:'8px 15px', borderRadius:8,
                fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'var(--font-body)',
              }}>Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ padding:'8px 16px', borderRadius:8, fontSize:14, fontWeight:600, color:'var(--ink-2)' }}>Sign in</Link>
              <Link to="/register" style={{
                padding:'8px 18px', borderRadius:8, fontSize:14, fontWeight:700,
                background:'var(--teal)', color:'var(--bg)',
              }}>Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile burger */}
        <button onClick={() => setOpen(!open)} style={{
          display:'none', flexDirection:'column', gap:5,
          background:'none', border:'none', cursor:'pointer', padding:4, marginLeft:'auto',
        }} className="mobile-burger" aria-label="Menu">
          {[0,1,2].map(i => (
            <span key={i} style={{
              display:'block', width:22, height:2, background:'var(--ink-2)', borderRadius:2,
              transition:'all .25s',
              transform: open && i===0 ? 'rotate(45deg) translate(5px,5px)' : open && i===2 ? 'rotate(-45deg) translate(5px,-5px)' : 'none',
              opacity: open && i===1 ? 0 : 1,
            }} />
          ))}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div style={{
          background:'var(--bg-1)', borderTop:'1px solid var(--border)',
          padding:'12px 28px 20px', display:'flex', flexDirection:'column', gap:4,
        }}>
          {links.map(l => (
            <Link key={l.to} to={l.to} style={{
              padding:'11px 14px', borderRadius:8, fontSize:15, fontWeight:600,
              color: isActive(l.to) ? 'var(--teal)' : 'var(--ink-2)',
            }}>{l.label}</Link>
          ))}
          <div className="divider" />
          {isAuthenticated
            ? <button onClick={() => { logout(); navigate('/login') }} style={{ padding:'11px 14px', background:'none', border:'none', color:'var(--coral)', fontSize:15, fontWeight:600, cursor:'pointer', textAlign:'left', fontFamily:'var(--font-body)' }}>Sign out</button>
            : <Link to="/register" style={{ padding:'11px 14px', color:'var(--teal)', fontSize:15, fontWeight:700 }}>Get Started →</Link>
          }
        </div>
      )}
    </header>
  )
}
