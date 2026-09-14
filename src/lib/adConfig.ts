/**
 * AdMob rewarded video ad unit IDs
 *
 * AdMob 콘솔에서 용도별로 광고 단위를 만든 뒤 아래에 넣어 주세요.
 */

/** 사진 → 단어 추출 (camera gate) */
export const ADMOB_REWARD_PHOTO_EXTRACT =
  'ca-app-pub-6562435784605266/6131326867'

/**
 * PDF 시험지 생성 (pdf gate)
 *
 * TODO: AdMob 콘솔에서 PDF 시험지용 리워드 광고 단위를 새로 만들고 이 값을 교체하세요.
 * 지금은 임시로 사진 추출 단위를 fallback으로 사용합니다.
 */
export const ADMOB_REWARD_PDF_EXAM = ADMOB_REWARD_PHOTO_EXTRACT
