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

    let data: any = null;
    try {
      data = await res.json();
    } catch {
      // Resposta que não é JSON (ex.: página HTML) = o servidor da API não está respondendo aqui
      return {
        success: false,
        message: 'Servidor de cadastro indisponível. Seu e-mail NÃO foi registrado. Tente novamente em instantes.',
      };
    }
    if (!res.ok) {
      return {
        success: false,
        message: (data && data.error) || 'Erro ao processar inscrição.',
      };
    }

    return {
      success: true,
      message: data.message || 'Inscrição confirmada com sucesso!',
      alreadySubscribed: data.alreadySubscribed,
    };
  } catch (error) {
    // Nunca fingir sucesso: sem o servidor, o e-mail não foi salvo em lugar nenhum
    return {
      success: false,
      message: 'Não foi possível conectar ao servidor. Seu e-mail NÃO foi registrado. Tente novamente em instantes.',
    };
  }
}
