import {
  ExpoSpeechRecognitionModule,
  type ExpoSpeechRecognitionErrorEvent,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { useCallback, useEffect, useState } from 'react';

function getSpeechErrorMessage(event: ExpoSpeechRecognitionErrorEvent): string {
  if (event.error === 'not-allowed') {
    return 'Microphone and speech recognition access are required.';
  }

  if (event.error === 'no-speech' || event.error === 'speech-timeout') {
    return 'No speech detected.';
  }

  if (event.error === 'network') {
    return 'Speech recognition needs a working connection on this device.';
  }

  if (event.error === 'service-not-allowed' || event.error === 'language-not-supported') {
    return 'Speech recognition is not available on this device.';
  }

  return event.message || 'Speech recognition failed. Try again.';
}

export function useSpeechToText() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  useSpeechRecognitionEvent('start', () => {
    setIsListening(true);
    setError(null);
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
  });

  useSpeechRecognitionEvent('result', (event) => {
    setTranscript(event.results[0]?.transcript ?? '');
  });

  useSpeechRecognitionEvent('error', (event) => {
    setIsListening(false);
    setError(getSpeechErrorMessage(event));
  });

  const start = useCallback(async () => {
    setError(null);
    setTranscript('');

    const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permission.granted) {
      setError('Microphone and speech recognition access are required.');
      return false;
    }

    if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
      setError('Speech recognition is not available on this device.');
      return false;
    }

    ExpoSpeechRecognitionModule.start({
      lang: 'en-US',
      interimResults: true,
      continuous: false,
      maxAlternatives: 1,
      addsPunctuation: true,
    });

    return true;
  }, []);

  const stop = useCallback(() => {
    ExpoSpeechRecognitionModule.stop();
  }, []);

  const clear = useCallback(() => {
    setError(null);
    setTranscript('');
  }, []);

  const toggle = useCallback(async () => {
    if (isListening) {
      stop();
      return false;
    }

    return start();
  }, [isListening, start, stop]);

  useEffect(() => {
    return () => {
      ExpoSpeechRecognitionModule.abort();
    };
  }, []);

  return {
    error,
    isListening,
    transcript,
    start,
    stop,
    toggle,
    clear,
  };
}
