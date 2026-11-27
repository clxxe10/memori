'use client'

import type { CSSProperties } from 'react'

const h1: CSSProperties = {
  fontSize: 24,
  fontWeight: 800,
  marginBottom: 8,
  color: 'var(--color-text-primary)',
}

const h2: CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  marginBottom: 8,
  color: 'var(--color-text-primary)',
}

const meta: CSSProperties = {
  fontSize: 14,
  color: 'var(--color-text-secondary)',
  marginBottom: 32,
}

const p: CSSProperties = {
  marginBottom: 24,
  color: 'var(--color-text-secondary)',
}

export default function TermsPage() {
  return (
    <main
      style={{
        maxWidth: 600,
        margin: '0 auto',
        padding: '40px 24px',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        background: 'var(--color-bg)',
        color: 'var(--color-text-primary)',
        minHeight: '100vh',
        lineHeight: 1.7,
      }}
    >
      <h1 style={h1}>이용약관</h1>
      <p style={meta}>최종 업데이트: 2026년 11월</p>

      <h2 style={h2}>1. 서비스 이용</h2>
      <p style={p}>Memori는 영어 단어 학습을 위한 서비스입니다. 만 14세 이상만 이용 가능합니다.</p>

      <h2 style={h2}>2. 계정</h2>
      <p style={p}>정확한 정보로 계정을 생성해야 합니다. 계정 보안은 사용자 책임입니다.</p>

      <h2 style={h2}>3. 금지 행위</h2>
      <p style={p}>서비스를 악용하거나 타인에게 피해를 주는 행위는 금지됩니다.</p>

      <h2 style={h2}>4. 사용자 콘텐츠 및 무관용 정책</h2>
      <p style={p}>
        공개 단어장 등 사용자가 게시하는 콘텐츠에 대해 Memori는 부적절한 콘텐츠와 악용 사용자에 대해 무관용(zero tolerance) 정책을 적용합니다.
        욕설·혐오·스팸·불법·유해 콘텐츠는 금지되며, 신고가 접수되면 24시간 이내에 검토하고 필요 시 콘텐츠 삭제 또는 계정 제재를 할 수 있습니다.
        사용자는 앱 내 신고 기능으로 부적절한 콘텐츠를 신고할 수 있습니다.
      </p>

      <h2 style={h2}>5. 구독 및 결제·환불</h2>
      <p style={p}>
        프리미엄 구독 결제와 환불은 Apple App Store 정책을 따릅니다.
        환불 요청은 Apple(reportaproblem.apple.com)을 통해 진행해 주세요.
        구독 해지는 iOS 설정 &gt; Apple ID &gt; 구독에서 할 수 있으며, 해지 후에도 남은 이용 기간까지는 서비스를 이용할 수 있습니다.
      </p>

      <h2 style={h2}>6. 서비스 변경</h2>
      <p style={p}>Memori는 서비스 내용을 변경하거나 종료할 수 있습니다.</p>

      <h2 style={h2}>7. 문의</h2>
      <p style={p}>문의: byoneidea@gmail.com</p>

      <hr style={{ margin: '32px 0', border: 'none', borderTop: '1px solid var(--color-border)' }} />

      <h1 style={h1}>Terms of Service</h1>
      <p style={meta}>Last updated: November 2026</p>

      <h2 style={h2}>1. Service</h2>
      <p style={p}>Memori is a vocabulary learning service. Users must be 14 years or older.</p>

      <h2 style={h2}>2. Account</h2>
      <p style={p}>You must provide accurate information when creating an account. You are responsible for your account security.</p>

      <h2 style={h2}>3. Prohibited Activities</h2>
      <p style={p}>Misuse of the service or activities that harm others are prohibited.</p>

      <h2 style={h2}>4. User Content &amp; Zero-Tolerance Policy</h2>
      <p style={p}>
        Memori applies a zero-tolerance policy toward objectionable content and abusive users in public user-generated content such as shared vocabularies.
        Profanity, hate speech, spam, illegal, or harmful content is prohibited. Reports are reviewed within 24 hours, and we may remove content or take action against accounts as needed.
        Users can report objectionable content using the in-app report feature.
      </p>

      <h2 style={h2}>5. Subscriptions, Payments &amp; Refunds</h2>
      <p style={p}>
        Premium subscription payments and refunds follow Apple App Store policies.
        Request refunds through Apple at reportaproblem.apple.com.
        Cancel subscriptions in iOS Settings &gt; Apple ID &gt; Subscriptions. After cancellation, you can continue using Premium until the end of the current paid period.
      </p>

      <h2 style={h2}>6. Changes</h2>
      <p style={p}>Memori may modify or discontinue the service.</p>

      <h2 style={h2}>7. Contact</h2>
      <p style={p}>Contact: byoneidea@gmail.com</p>
    </main>
  )
}
