'use client'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

const steps = [
  { slide:0, img:'home-top.png',       t:{x:246,y:90, w:63, h:41, r:21}, b:{left:110,width:236,pos:'below'},
    title:'🔥 연속 학습일', body:'매일 학습하면 연속 기록이 쌓여요' },
  { slide:0, img:'home-top.png',       t:{x:24, y:156,w:325,h:188,r:34}, b:{left:36, width:250,pos:'below'},
    title:'오늘 복습할 단어 수', body:'복습할 단어를 매일 알려드려요' },
  { slide:0, img:'home-calendar.png',  t:{x:24, y:184,w:325,h:367,r:26}, b:{left:36, width:250,pos:'above'},
    title:'학습 캘린더로 진도 확인', body:'공부한 날이 진하게 표시돼요' },
  { slide:1, img:'wordbook.png',       t:{x:295,y:651,w:60, h:60, r:30}, b:{left:106,width:240,pos:'above'},
    title:'+ 버튼으로 새 단어장 만들기', body:'직접 입력하거나 사진으로 만들 수 있어요' },
  { slide:1, img:'add-word-sheet.png', t:{x:31, y:315,w:330,h:72, r:22}, b:{left:46, width:260,pos:'above'},
    title:'사진 한 장으로 단어를 자동 추출해요', body:'교재를 찍으면 AI가 단어와 뜻을 정리해요' },
  { slide:2, img:'study.png',          t:{x:24, y:185,w:325,h:95, r:30}, b:{left:36, width:260,pos:'below'},
    title:'암기세트로 4단계 완벽 암기', body:'플래시카드부터 타이핑까지 순서대로 진행돼요' },
  { slide:2, img:'study.png',          t:{x:24, y:281,w:325,h:428,r:30}, b:{left:36, width:260,pos:'above'},
    title:'8가지 학습 모드 중 선택', body:'그날 원하는 방식으로 골라서 공부해요' },
  { slide:3, img:'search.png',         t:{x:22, y:120,w:329,h:53, r:26}, b:{left:36, width:300,pos:'below'},
    title:'다른 사람 단어장을 가져와서 바로 학습해요', body:'공개된 단어장을 검색해 내 단어장에 추가해요' },
]

const SLIDES = 4
const BASE_W = 392

export default function TutorialPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setScale(containerRef.current.offsetWidth / BASE_W)
      }
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const finish = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tutorial_done', '1')
    }
    router.push('/home')
  }

  const next = () => {
    if (step < steps.length - 1) setStep(s => s + 1)
    else finish()
  }

  const prev = () => {
    if (step > 0) setStep(s => s - 1)
  }

  const cur = steps[step]
  const s = scale

  const spotStyle = {
    position: 'absolute' as const,
    left: cur.t.x * s,
    top: cur.t.y * s,
    width: cur.t.w * s,
    height: cur.t.h * s,
    borderRadius: cur.t.r * s,
    boxShadow: '0 0 0 2000px rgba(0,0,0,0.4)',
    pointerEvents: 'none' as const,
    transition: 'all 350ms cubic-bezier(0.32,0.72,0,1)',
    zIndex: 10,
  }

  const bubbleTop = cur.b.pos === 'below'
    ? (cur.t.y + cur.t.h + 14) * s
    : (cur.t.y - 14) * s

  const bubbleStyle = {
    position: 'absolute' as const,
    left: cur.b.left * s,
    width: cur.b.width * s,
    top: bubbleTop,
    transform: cur.b.pos === 'above' ? 'translateY(-100%)' : 'none',
    background: '#FFF',
    borderRadius: 16,
    padding: '14px 16px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
    zIndex: 20,
    transition: 'all 350ms cubic-bezier(0.32,0.72,0,1)',
  }

  const tailLeft = Math.max(22, Math.min(cur.t.x + cur.t.w / 2 - cur.b.left, cur.b.width - 22)) * s

  const imgs = ['home-top.png','home-calendar.png','wordbook.png','add-word-sheet.png','study.png','search.png']

  return (
    <div
      ref={containerRef}
      onClick={next}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        maxWidth: '392px',
        margin: '0 auto',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      {/* 스크린샷 레이어 */}
      {imgs.map(img => (
        <img
          key={img}
          src={`/tutorial/${img}`}
          alt=""
          style={{
            position: 'absolute',
            top: img === 'add-word-sheet.png' ? -30 * s : 0,
            left: 0,
            width: img === 'add-word-sheet.png' ? 412 * s : '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'top',
            opacity: cur.img === img ? 1 : 0,
            transition: 'opacity 250ms ease',
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* 스포트라이트 */}
      <div style={spotStyle} />

      {/* 말풍선 */}
      <div style={bubbleStyle} onClick={e => e.stopPropagation()}>
        {/* 꼬리 */}
        <div style={{
          position: 'absolute',
          left: tailLeft,
          marginLeft: -7,
          ...(cur.b.pos === 'below' ? { top: -6 } : { bottom: -6 }),
          width: 14, height: 14,
          background: '#FFF',
          borderRadius: 3,
          transform: 'rotate(45deg)',
        }} />
        <p style={{
          margin: 0, fontSize: 15 * s, fontWeight: 700, lineHeight: 1.3,
          color: '#1C1C1E', letterSpacing: '-0.2px',
          wordBreak: 'keep-all',
        }}>{cur.title}</p>
        <p style={{
          margin: '4px 0 0', fontSize: 13 * s, fontWeight: 400, lineHeight: 1.4,
          color: 'rgba(60,60,67,0.6)',
          wordBreak: 'keep-all',
        }}>{cur.body}</p>
      </div>

      {/* 스킵 버튼 */}
      <button
        onClick={e => { e.stopPropagation(); finish() }}
        style={{
          position: 'absolute', top: 14, right: 24,
          height: 32, padding: '0 14px',
          borderRadius: 9999, border: 'none',
          background: 'rgba(255,255,255,0.18)',
          color: '#FFF', fontSize: 14, fontWeight: 600,
          cursor: 'pointer', zIndex: 30,
        }}
      >스킵</button>

      {/* 하단 컨트롤 */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute', left: 16, right: 16, bottom: 10,
          height: 40, display: 'flex',
          justifyContent: 'space-between', alignItems: 'center',
          zIndex: 30,
        }}
      >
        {/* 이전 버튼 */}
        <button
          onClick={prev}
          style={{
            background: 'none', border: 'none', cursor: step === 0 ? 'default' : 'pointer',
            fontSize: 15, fontWeight: 500, color: 'rgba(255,255,255,0.85)',
            minWidth: 64, opacity: step === 0 ? 0 : 1,
            pointerEvents: step === 0 ? 'none' : 'auto',
          }}
        >이전</button>

        {/* 페이지 점 */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {Array.from({ length: SLIDES }).map((_, i) => (
            <div key={i} style={{
              height: 6,
              width: cur.slide === i ? 18 : 6,
              borderRadius: 9999,
              background: cur.slide === i ? '#FFF' : 'rgba(255,255,255,0.45)',
              transition: 'all 250ms ease',
            }} />
          ))}
        </div>

        {/* 다음/시작 버튼 */}
        <button
          onClick={next}
          style={{
            height: 40, padding: '0 18px',
            borderRadius: 9999, border: 'none',
            background: '#FFF', color: '#1C1C1E',
            fontSize: 15, fontWeight: 700, cursor: 'pointer',
          }}
        >
          {step === steps.length - 1 ? '시작하기' : '다음'}
        </button>
      </div>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          * { transition: none !important; }
        }
      `}</style>
    </div>
  )
}
