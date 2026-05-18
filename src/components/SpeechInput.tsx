import { useRef, useState } from 'react'
import { startSpeechRecognition } from '../utils/speech'

type Props = {
  value: string
  onChange: (value: string) => void
  placeholder: string
}

export default function SpeechInput({ value, onChange, placeholder }: Props) {
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const startListening = () => {
    setListening(true)
    recognitionRef.current = startSpeechRecognition(
      text => onChange(text),
      () => setListening(false),
    )
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setListening(false)
  }

  return (
    <>
      <textarea
        className="text-area"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <button className="secondary-btn" onClick={listening ? stopListening : startListening}>
        {listening ? '🔴 Listening…' : '🎤 Speak'}
      </button>
    </>
  )
}
