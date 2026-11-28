import { detectLanguage, languageToTTSCode } from '@/lib/detectLanguage'

const PREFERRED_VOICE_HINTS = ['Enhanced', 'Premium', 'Samantha', 'Google', 'Karen', 'Alex']

function pickWebVoice(voices: SpeechSynthesisVoice[], langCode: string): SpeechSynthesisVoice | undefined {
  const langPrefix = langCode.split('-')[0]
  const langVoices = voices.filter(v => v.lang.startsWith(langPrefix) || v.lang === langCode)
  if (langVoices.length === 0) return undefined

  for (const hint of PREFERRED_VOICE_HINTS) {
    const found = langVoices.find(v => v.name.includes(hint))
    if (found) return found
  }
  return langVoices.find(v => v.lang === langCode) || langVoices[0]
}

async function speakWeb(text: string, langCode: string): Promise<void> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

  window.speechSynthesis.cancel()

  const waitForVoices = (): Promise<SpeechSynthesisVoice[]> =>
    new Promise(resolve => {
      const existing = window.speechSynthesis.getVoices()
      if (existing.length > 0) {
        resolve(existing)
        return
      }
      const onChange = () => {
        window.speechSynthesis.removeEventListener('voiceschanged', onChange)
        resolve(window.speechSynthesis.getVoices())
      }
      window.speechSynthesis.addEventListener('voiceschanged', onChange)
      setTimeout(() => {
        window.speechSynthesis.removeEventListener('voiceschanged', onChange)
        resolve(window.speechSynthesis.getVoices())
      }, 500)
    })

  const voices = await waitForVoices()
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = langCode
  utter.rate = 0.9
  utter.pitch = 1
  utter.volume = 1
  const voice = pickWebVoice(voices, langCode)
  if (voice) utter.voice = voice
  window.speechSynthesis.speak(utter)
}

async function speakNative(text: string, langCode: string): Promise<void> {
  const { TextToSpeech } = await import('@capacitor-community/text-to-speech')
  try {
    await TextToSpeech.stop()
  } catch {
    // ignore if nothing is speaking
  }
  await TextToSpeech.speak({
    text,
    lang: langCode,
    rate: 0.9,
    pitch: 1.0,
    volume: 1.0,
    category: 'playback',
  })
}

/** App-wide TTS: native iOS voice on device, enhanced web voices in browser / old binaries */
export async function speak(text: string): Promise<void> {
  const trimmed = text?.trim()
  if (!trimmed) return

  const langCode = languageToTTSCode(detectLanguage(trimmed))

  if (typeof window !== 'undefined') {
    const { Capacitor } = await import('@capacitor/core')
    if (Capacitor.isNativePlatform() && Capacitor.isPluginAvailable('TextToSpeech')) {
      try {
        await speakNative(trimmed, langCode)
        return
      } catch (e) {
        console.warn('Native TTS failed, falling back to web:', e)
      }
    }
  }

  await speakWeb(trimmed, langCode)
}

export async function stopSpeaking(): Promise<void> {
  if (typeof window !== 'undefined') {
    const { Capacitor } = await import('@capacitor/core')
    if (Capacitor.isNativePlatform() && Capacitor.isPluginAvailable('TextToSpeech')) {
      try {
        const { TextToSpeech } = await import('@capacitor-community/text-to-speech')
        await TextToSpeech.stop()
      } catch {
        // ignore
      }
      return
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
  }
}
