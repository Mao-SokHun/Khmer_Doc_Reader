import { useEffect, useRef } from 'react';
import { getGoogleClientId, isGoogleAuthConfigured } from '../lib/auth';

type GoogleSignInButtonProps = {
  onCredential: (credential: string) => void;
  lang: 'kh' | 'en';
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (el: HTMLElement, config: Record<string, unknown>) => void;
        };
      };
    };
  }
}

export function GoogleSignInButton({ onCredential, lang }: GoogleSignInButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const clientId = getGoogleClientId();

  useEffect(() => {
    if (!clientId || !ref.current) return;

    let cancelled = false;

    const init = () => {
      if (cancelled || !ref.current || !window.google) return;
      ref.current.innerHTML = '';
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: { credential?: string }) => {
          if (response.credential) onCredential(response.credential);
        },
      });
      window.google.accounts.id.renderButton(ref.current, {
        type: 'standard',
        theme: 'outline',
        size: 'medium',
        text: 'signin_with',
        locale: lang === 'kh' ? 'km' : 'en',
        width: 240,
      });
    };

    if (window.google) {
      init();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = init;
    document.body.appendChild(script);

    return () => {
      cancelled = true;
    };
  }, [clientId, lang, onCredential]);

  if (!isGoogleAuthConfigured()) return null;
  return <div ref={ref} className="min-h-[40px]" />;
}
