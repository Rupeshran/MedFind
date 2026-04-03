import { createContext, useContext, useState, useEffect } from 'react'

const translations = {}
const modules = import.meta.glob('../translations/*.js', { eager: true })
for (const path in modules) {
  const lang = path.match(/\/(\w+)\.js$/)?.[1]
  if (lang) translations[lang] = modules[path].default
}

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
  { code: 'bho', name: 'Bhojpuri', nativeName: 'भोजपुरी', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
]

const LanguageContext = createContext()

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('mf_lang') || 'en'
  })

  useEffect(() => {
    localStorage.setItem('mf_lang', lang)
    document.documentElement.lang = lang
  }, [lang])

  const t = (key, fallback) => {
    const keys = key.split('.')
    let value = translations[lang]
    for (const k of keys) {
      value = value?.[k]
    }
    if (value) return value

    // Fallback to English
    let enValue = translations['en']
    for (const k of keys) {
      enValue = enValue?.[k]
    }
    return enValue || fallback || key
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
