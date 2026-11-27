'use client'

import type { CSSProperties } from 'react'

const tableWrap: CSSProperties = {
  overflowX: 'auto',
  WebkitOverflowScrolling: 'touch',
  marginBottom: 24,
}

const tableStyle: CSSProperties = {
  width: '100%',
  minWidth: 520,
  borderCollapse: 'collapse',
  fontSize: 13,
  color: 'var(--color-text-secondary)',
}

const thStyle: CSSProperties = {
  textAlign: 'left',
  padding: '8px 10px',
  borderBottom: '1px solid var(--color-border)',
  color: 'var(--color-text-primary)',
  fontWeight: 700,
  whiteSpace: 'nowrap',
}

const tdStyle: CSSProperties = {
  padding: '8px 10px',
  borderBottom: '1px solid var(--color-border)',
  verticalAlign: 'top',
}

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
  marginTop: 8,
  color: 'var(--color-text-primary)',
}

const meta: CSSProperties = {
  fontSize: 14,
  color: 'var(--color-text-secondary)',
  marginBottom: 32,
}

const p: CSSProperties = {
  marginBottom: 16,
  color: 'var(--color-text-secondary)',
}

const ul: CSSProperties = {
  margin: '0 0 24px',
  paddingLeft: 20,
  color: 'var(--color-text-secondary)',
}

const li: CSSProperties = { marginBottom: 6 }

export default function PrivacyPage() {
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
      {/* ========== 한국어 ========== */}
      <h1 style={h1}>개인정보처리방침</h1>
      <p style={meta}>시행일: 2026년 11월</p>

      <p style={p}>
        Memori(이하 &quot;서비스&quot;)는 이용자의 개인정보를 중요시하며, 「개인정보 보호법」 등 관련 법령을 준수합니다.
        본 방침은 서비스가 실제로 수집·이용하는 정보에 근거하여 작성되었습니다.
      </p>

      <h2 style={h2}>1. 수집하는 개인정보 항목</h2>
      <p style={p}>서비스는 아래 항목을 수집할 수 있습니다.</p>
      <ul style={ul}>
        <li style={li}>
          <strong style={{ color: 'var(--color-text-primary)' }}>필수</strong> — 이메일 주소, 비밀번호(이메일 가입 시), 계정 식별자(사용자 ID)
        </li>
        <li style={li}>
          <strong style={{ color: 'var(--color-text-primary)' }}>선택 · 프로필</strong> — 닉네임, 프로필 사진(아바타), 일일 학습 목표
        </li>
        <li style={li}>
          <strong style={{ color: 'var(--color-text-primary)' }}>소셜 로그인</strong>
          <ul style={{ marginTop: 6, paddingLeft: 18 }}>
            <li style={li}>카카오: 닉네임(profile_nickname), 프로필 이미지(profile_image)</li>
            <li style={li}>구글: 제공자가 전달하는 이메일, 이름(full_name 등), 프로필 이미지 URL</li>
            <li style={li}>애플: 제공자가 전달하는 이메일 및 이름(최초 동의 시)</li>
          </ul>
        </li>
        <li style={li}>
          <strong style={{ color: 'var(--color-text-primary)' }}>사진(AI 단어 추출)</strong> — 이용자가 선택한 사진을 JPEG로 압축한 뒤 서버를 통해 Anthropic API에 전송합니다. 추출 결과(단어·뜻 등)는 단어장에 저장되며, 원본 사진은 별도 영구 저장하지 않습니다.
        </li>
        <li style={li}>
          <strong style={{ color: 'var(--color-text-primary)' }}>학습 기록</strong> — 단어장·단어, 학습 통계(user_learning_stats), 일별 학습 기록(user_daily_study), 좋아요·댓글 등 커뮤니티 활동
        </li>
        <li style={li}>
          <strong style={{ color: 'var(--color-text-primary)' }}>광고 식별자</strong> — 보상형 광고(Google AdMob) 제공을 위해 기기 광고 식별자가 광고 사업자에 의해 처리될 수 있습니다.
        </li>
        <li style={li}>
          <strong style={{ color: 'var(--color-text-primary)' }}>구매 정보</strong> — 구독·결제 상태 확인을 위해 사용자 ID가 RevenueCat에 전달되며, 결제 자체는 Apple App Store를 통해 처리됩니다.
        </li>
        <li style={li}>
          <strong style={{ color: 'var(--color-text-primary)' }}>신고·차단 기록</strong> — 신고자/피신고자 ID, 대상 단어장 ID, 신고 사유 / 차단자·피차단자 ID
        </li>
        <li style={li}>
          <strong style={{ color: 'var(--color-text-primary)' }}>문의</strong> — 답변용 이메일, 문의 유형, 문의 내용(support_requests)
        </li>
        <li style={li}>
          <strong style={{ color: 'var(--color-text-primary)' }}>기기 로컬 저장</strong> — 테마·마이컬러, 언어, 알림 설정, 학습 즐겨찾기, 튜토리얼/코치마크 완료 여부, AI 추출·PDF 사용 횟수, 스피드 모드 최고점 등(localStorage)
        </li>
      </ul>

      <h2 style={h2}>2. 개인정보의 수집·이용 목적</h2>
      <ul style={ul}>
        <li style={li}>회원 가입·로그인·본인 식별 및 계정 관리</li>
        <li style={li}>프로필 표시 및 공개 단어장 작성자 정보 제공</li>
        <li style={li}>단어장·학습 기록 저장·동기화 및 학습 기능 제공</li>
        <li style={li}>사진 기반 AI 단어 추출 및 단어 정보 자동 생성</li>
        <li style={li}>프리미엄 구독 결제·복원·이용 권한 확인</li>
        <li style={li}>보상형 광고 제공</li>
        <li style={li}>고객 문의 응대</li>
        <li style={li}>부적절한 콘텐츠 신고·이용자 차단 등 커뮤니티 안전 관리</li>
        <li style={li}>앱 설정(테마, 언어, 알림 등) 유지</li>
      </ul>

      <h2 style={h2}>3. 보유 및 이용 기간</h2>
      <p style={p}>
        원칙적으로 회원 탈퇴 시 개인정보는 지체 없이 삭제합니다. 앱 내 계정 탈퇴 시 단어장·단어·학습 통계·일별 학습 기록 및 계정이 삭제됩니다.
        다만 관련 법령에 따라 일정 기간 보관이 필요한 경우에는 해당 기간 동안 보관 후 파기합니다.
      </p>

      <h2 style={h2}>4. 파기 절차 및 방법</h2>
      <p style={p}>
        보유 기간이 경과하거나 처리 목적이 달성된 개인정보는 지체 없이 파기합니다.
        전자적 파일 형태의 정보는 복구 및 재생이 불가능한 방법으로 삭제합니다.
      </p>

      <h2 style={h2}>5. 처리 위탁 및 국외 이전</h2>
      <p style={p}>서비스 운영을 위해 아래와 같이 개인정보를 위탁·이전할 수 있습니다.</p>
      <div style={tableWrap}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>업체명</th>
              <th style={thStyle}>국가</th>
              <th style={thStyle}>이전 항목</th>
              <th style={thStyle}>목적</th>
              <th style={thStyle}>보유기간</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tdStyle}>Supabase</td>
              <td style={tdStyle}>대한민국<br />(ap-northeast-2, 서울)</td>
              <td style={tdStyle}>계정·프로필, 단어장/학습 데이터, 아바타 파일, 문의·신고·차단 기록</td>
              <td style={tdStyle}>인증, DB·스토리지 호스팅</td>
              <td style={tdStyle}>회원 탈퇴 시까지<br />(또는 위탁 계약 종료 시)</td>
            </tr>
            <tr>
              <td style={tdStyle}>Anthropic</td>
              <td style={tdStyle}>미국</td>
              <td style={tdStyle}>AI 추출용 사진(이미지), 단어·뜻 텍스트</td>
              <td style={tdStyle}>단어 추출·단어 정보 생성</td>
              <td style={tdStyle}>요청 처리 목적 달성 시까지<br />(제공사 정책에 따름)</td>
            </tr>
            <tr>
              <td style={tdStyle}>Vercel</td>
              <td style={tdStyle}>미국</td>
              <td style={tdStyle}>웹/API 요청 처리에 수반되는 접속·처리 데이터</td>
              <td style={tdStyle}>앱·API 호스팅</td>
              <td style={tdStyle}>서비스 제공 기간 / 로그 정책에 따름</td>
            </tr>
            <tr>
              <td style={tdStyle}>Google AdMob</td>
              <td style={tdStyle}>미국</td>
              <td style={tdStyle}>광고 식별자 등 광고 제공에 필요한 기기 정보</td>
              <td style={tdStyle}>보상형 광고 제공</td>
              <td style={tdStyle}>광고 제공사 정책에 따름</td>
            </tr>
            <tr>
              <td style={tdStyle}>RevenueCat</td>
              <td style={tdStyle}>미국</td>
              <td style={tdStyle}>사용자 ID, 구독·구매 상태</td>
              <td style={tdStyle}>인앱 구독 관리·복원</td>
              <td style={tdStyle}>구독 관리 목적 달성 시까지<br />(제공사 정책에 따름)</td>
            </tr>
            <tr>
              <td style={tdStyle}>카카오 / Google / Apple</td>
              <td style={tdStyle}>각 제공사 소재지</td>
              <td style={tdStyle}>소셜 로그인 시 동의된 프로필·이메일 정보</td>
              <td style={tdStyle}>소셜 로그인 인증</td>
              <td style={tdStyle}>인증 처리 및 회원 관리 기간</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 style={h2}>6. 제3자 제공</h2>
      <p style={p}>
        서비스는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다.
        다만 이용자가 사전에 동의한 경우, 또는 법령에 따라 요구되는 경우에는 예외로 할 수 있습니다.
        (위탁·국외 이전은 제5조에 따릅니다.)
      </p>

      <h2 style={h2}>7. 이용자 권리와 행사 방법</h2>
      <p style={p}>
        이용자는 언제든지 자신의 개인정보에 대해 열람·정정·삭제·처리정지를 요청할 수 있습니다.
        앱 내 프로필에서 닉네임·프로필 사진을 수정하거나, 계정 탈퇴를 통해 삭제를 요청할 수 있습니다.
        이메일(byoneidea@gmail.com)로도 요청할 수 있으며, 요청 확인 후 지체 없이 조치합니다.
      </p>

      <h2 style={h2}>8. 만 14세 미만 아동</h2>
      <p style={p}>
        서비스는 만 14세 미만 아동을 대상으로 하지 않으며, 만 14세 미만의 개인정보를 고의로 수집하지 않습니다.
        만 14세 미만임이 확인되면 해당 정보를 삭제합니다.
      </p>

      <h2 style={h2}>9. 자동 수집 장치</h2>
      <ul style={ul}>
        <li style={li}>
          <strong style={{ color: 'var(--color-text-primary)' }}>로컬 저장소(localStorage)</strong> — 테마, 언어, 알림, 즐겨찾기, 튜토리얼 상태, 사용 횟수 등 앱 설정을 기기에 저장합니다. 기기/브라우저에서 사이트 데이터를 삭제하여 제거할 수 있습니다.
        </li>
        <li style={li}>
          <strong style={{ color: 'var(--color-text-primary)' }}>광고 식별자</strong> — AdMob 보상형 광고를 위해 사용될 수 있습니다. 거부 방법: iOS 설정 &gt; 개인정보 보호 &gt; 추적
        </li>
      </ul>

      <h2 style={h2}>10. 개인정보 보호책임자</h2>
      <ul style={ul}>
        {/* TODO: 개인정보 보호책임자 성명 기재 */}
        <li style={li}>직책: 운영자</li>
        <li style={li}>성명: </li>
        <li style={li}>이메일: byoneidea@gmail.com</li>
      </ul>

      <h2 style={h2}>11. 시행일</h2>
      <p style={{ ...p, marginBottom: 32 }}>본 개인정보처리방침은 2026년 11월부터 시행합니다.</p>

      <hr style={{ margin: '32px 0', border: 'none', borderTop: '1px solid var(--color-border)' }} />

      {/* ========== English ========== */}
      <h1 style={h1}>Privacy Policy</h1>
      <p style={meta}>Effective: November 2026</p>

      <p style={p}>
        Memori (&quot;Service&quot;) respects your privacy and complies with applicable data protection laws.
        This policy is based on data and services actually used in the product.
      </p>

      <h2 style={h2}>1. Information We Collect</h2>
      <ul style={ul}>
        <li style={li}>
          <strong style={{ color: 'var(--color-text-primary)' }}>Required</strong> — Email address, password (email sign-up), account ID
        </li>
        <li style={li}>
          <strong style={{ color: 'var(--color-text-primary)' }}>Optional · Profile</strong> — Nickname, profile photo (avatar), daily study goal
        </li>
        <li style={li}>
          <strong style={{ color: 'var(--color-text-primary)' }}>Social login</strong>
          <ul style={{ marginTop: 6, paddingLeft: 18 }}>
            <li style={li}>Kakao: nickname (profile_nickname), profile image (profile_image)</li>
            <li style={li}>Google: email, name (e.g. full_name), profile image URL as provided</li>
            <li style={li}>Apple: email and name as provided (name typically on first consent)</li>
          </ul>
        </li>
        <li style={li}>
          <strong style={{ color: 'var(--color-text-primary)' }}>Photos (AI word extract)</strong> — Selected photos are JPEG-compressed and sent via our server to the Anthropic API. Extracted words are saved to your vocabulary; original photos are not permanently stored by us.
        </li>
        <li style={li}>
          <strong style={{ color: 'var(--color-text-primary)' }}>Study data</strong> — Folders/words, learning stats (user_learning_stats), daily study (user_daily_study), likes/comments
        </li>
        <li style={li}>
          <strong style={{ color: 'var(--color-text-primary)' }}>Advertising ID</strong> — May be processed by Google AdMob for rewarded ads
        </li>
        <li style={li}>
          <strong style={{ color: 'var(--color-text-primary)' }}>Purchase info</strong> — User ID is sent to RevenueCat for subscription status; payments are processed by the Apple App Store
        </li>
        <li style={li}>
          <strong style={{ color: 'var(--color-text-primary)' }}>Reports / blocks</strong> — Reporter/owner IDs, folder ID, reason / blocker and blocked user IDs
        </li>
        <li style={li}>
          <strong style={{ color: 'var(--color-text-primary)' }}>Support</strong> — Reply email, category, message content (support_requests)
        </li>
        <li style={li}>
          <strong style={{ color: 'var(--color-text-primary)' }}>Local storage</strong> — Theme/color, language, notification prefs, study favorites, tutorial/coachmark flags, AI/PDF usage counts, speed-mode best score (localStorage)
        </li>
      </ul>

      <h2 style={h2}>2. Purpose of Collection and Use</h2>
      <ul style={ul}>
        <li style={li}>Account registration, login, identification, and account management</li>
        <li style={li}>Profile display and public vocabulary author info</li>
        <li style={li}>Storing/syncing vocabularies and study records; providing study features</li>
        <li style={li}>AI photo word extraction and automatic word-info generation</li>
        <li style={li}>Premium subscription purchase, restore, and entitlement checks</li>
        <li style={li}>Rewarded advertising</li>
        <li style={li}>Customer support</li>
        <li style={li}>Community safety (reports and user blocks)</li>
        <li style={li}>Persisting app preferences (theme, language, notifications, etc.)</li>
      </ul>

      <h2 style={h2}>3. Retention Period</h2>
      <p style={p}>
        In principle, personal information is deleted without delay upon account deletion.
        In-app account deletion removes folders, words, learning stats, daily study records, and the account.
        Where retention is required by law, we retain data only for the period required and then destroy it.
      </p>

      <h2 style={h2}>4. Destruction Procedure and Method</h2>
      <p style={p}>
        When the retention period expires or the processing purpose is achieved, we destroy personal information without delay.
        Electronic files are deleted in a manner that prevents recovery or reproduction.
      </p>

      <h2 style={h2}>5. Entrustment and Cross-Border Transfer</h2>
      <p style={p}>We may entrust or transfer personal information as follows to operate the Service:</p>
      <div style={tableWrap}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Provider</th>
              <th style={thStyle}>Country</th>
              <th style={thStyle}>Data transferred</th>
              <th style={thStyle}>Purpose</th>
              <th style={thStyle}>Retention</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tdStyle}>Supabase</td>
              <td style={tdStyle}>South Korea<br />(ap-northeast-2, Seoul)</td>
              <td style={tdStyle}>Account/profile, vocabulary/study data, avatar files, support/report/block records</td>
              <td style={tdStyle}>Auth, database &amp; storage hosting</td>
              <td style={tdStyle}>Until account deletion<br />(or end of entrustment)</td>
            </tr>
            <tr>
              <td style={tdStyle}>Anthropic</td>
              <td style={tdStyle}>United States</td>
              <td style={tdStyle}>Photos for AI extract; word/meaning text</td>
              <td style={tdStyle}>Word extraction &amp; word-info generation</td>
              <td style={tdStyle}>Until request processing is complete<br />(per provider policy)</td>
            </tr>
            <tr>
              <td style={tdStyle}>Vercel</td>
              <td style={tdStyle}>United States</td>
              <td style={tdStyle}>Request/processing data incidental to web/API hosting</td>
              <td style={tdStyle}>App &amp; API hosting</td>
              <td style={tdStyle}>Service period / provider log policy</td>
            </tr>
            <tr>
              <td style={tdStyle}>Google AdMob</td>
              <td style={tdStyle}>United States</td>
              <td style={tdStyle}>Advertising identifiers and device info needed for ads</td>
              <td style={tdStyle}>Rewarded ads</td>
              <td style={tdStyle}>Per ad provider policy</td>
            </tr>
            <tr>
              <td style={tdStyle}>RevenueCat</td>
              <td style={tdStyle}>United States</td>
              <td style={tdStyle}>User ID, subscription/purchase status</td>
              <td style={tdStyle}>In-app subscription management &amp; restore</td>
              <td style={tdStyle}>Until subscription management purpose is met<br />(per provider policy)</td>
            </tr>
            <tr>
              <td style={tdStyle}>Kakao / Google / Apple</td>
              <td style={tdStyle}>Provider locations</td>
              <td style={tdStyle}>Profile/email consented for social login</td>
              <td style={tdStyle}>Social authentication</td>
              <td style={tdStyle}>Auth processing and account period</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 style={h2}>6. Provision to Third Parties</h2>
      <p style={p}>
        We do not provide personal information to third parties in principle, except with prior consent or where required by law.
        (Entrustment and cross-border transfers are described in Section 5.)
      </p>

      <h2 style={h2}>7. Your Rights and How to Exercise Them</h2>
      <p style={p}>
        You may request access, correction, deletion, or suspension of processing at any time.
        You can edit nickname/avatar in Profile, or delete your account in the app.
        You may also email byoneidea@gmail.com; we will act without undue delay after verification.
      </p>

      <h2 style={h2}>8. Children Under 14</h2>
      <p style={p}>
        The Service is not directed to children under 14, and we do not knowingly collect their personal information.
        If we learn that a user is under 14, we will delete the relevant information.
      </p>

      <h2 style={h2}>9. Automatic Collection</h2>
      <ul style={ul}>
        <li style={li}>
          <strong style={{ color: 'var(--color-text-primary)' }}>Local storage</strong> — Theme, language, notifications, favorites, tutorial state, usage counts, etc. You can clear site data on your device/browser.
        </li>
        <li style={li}>
          <strong style={{ color: 'var(--color-text-primary)' }}>Advertising ID</strong> — May be used for AdMob rewarded ads. Opt out: iOS Settings &gt; Privacy &gt; Tracking
        </li>
      </ul>

      <h2 style={h2}>10. Privacy Officer</h2>
      <ul style={ul}>
        {/* TODO: Fill privacy officer full name */}
        <li style={li}>Title: Operator</li>
        <li style={li}>Name: </li>
        <li style={li}>Email: byoneidea@gmail.com</li>
      </ul>

      <h2 style={h2}>11. Effective Date</h2>
      <p style={p}>This Privacy Policy is effective as of November 2026.</p>
    </main>
  )
}
