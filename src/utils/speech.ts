export function speak(text: string): void {
  if (!window.speechSynthesis) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-GB';
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

type SpeechResultHandler = (text: string) => void;
type SpeechEndHandler = () => void;

export function startSpeechRecognition(
  onResult: SpeechResultHandler,
  onEnd?: SpeechEndHandler
): SpeechRecognition | null {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SR) {
    alert('Speech recognition is not supported on this browser.');
    return null;
  }

  const recognition = new SR();
  recognition.lang = 'en-GB';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.onerror = () => {
    onEnd?.();
  };

  recognition.onend = () => {
    onEnd?.();
  };

  recognition.start();
  return recognition;
}
