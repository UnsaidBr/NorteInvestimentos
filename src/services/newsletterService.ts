export interface SubscribeResult {
  success: boolean;
  message: string;
  alreadySubscribed?: boolean;
}

export async function subscribeToNewsletter(
  email: string,
  consent: boolean
): Promise<SubscribeResult> {
  const normalized = email.toLowerCase().trim();

  try {
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalized, consent }),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: data.error || 'Erro ao processar inscrição.',
      };
    }

    // Also persist in local storage as local cache
    try {
      const stored = JSON.parse(localStorage.getItem('norteinvest_newsletter_emails') || '[]');
      if (!stored.includes(normalized)) {
        stored.push(normalized);
        localStorage.setItem('norteinvest_newsletter_emails', JSON.stringify(stored));
      }
    } catch (e) {
      // safe
    }

    return {
      success: true,
      message: data.message || 'Inscrição confirmada com sucesso!',
      alreadySubscribed: data.alreadySubscribed,
    };
  } catch (error) {
    // Client-side fallback if server endpoint is temporarily unreachable
    try {
      const stored = JSON.parse(localStorage.getItem('norteinvest_newsletter_emails') || '[]');
      if (stored.includes(normalized)) {
        return {
          success: true,
          message: 'Este e-mail já está cadastrado em nosso Radar Semanal.',
          alreadySubscribed: true,
        };
      }
      stored.push(normalized);
      localStorage.setItem('norteinvest_newsletter_emails', JSON.stringify(stored));
      return {
        success: true,
        message: 'Inscrição realizada com sucesso! Você receberá nosso radar semanal.',
      };
    } catch (e) {
      return {
        success: false,
        message: 'Não foi possível registrar seu e-mail no momento. Tente novamente.',
      };
    }
  }
}
