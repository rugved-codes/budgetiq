import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { message, context } = request.body;

  if (!message) {
    return response.status(400).json({ error: 'Message is required' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY is not set');
    return response.status(500).json({ error: 'AI service not configured' });
  }

  try {
    const systemPrompt = `You are a helpful AI financial assistant for a personal budget app called BudgetIQ. 
You have access to the user's financial data and should provide helpful, personalized financial advice.

User's Current Financial Data:
- Balance: ${context?.balance || 'Not provided'}
- Monthly Income: ${context?.monthlyIncome || 'Not provided'}
- Monthly Expenses: ${context?.monthlyExpenses || 'Not provided'}
- Safe to Spend Today: ${context?.safeToSpend || 'Not provided'}
- Active Budgets: ${context?.budgets?.length || 0}
- Savings Goals: ${context?.goals?.length || 0}
- Recent Insights: ${context?.insights?.slice(0, 3).join(', ') || 'None'}

Be concise, friendly, and personalized. When answering questions about their finances, reference their actual data.
You can answer any question, but try to provide financial insights when relevant.`;

    const response_obj = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response_obj.ok) {
      const error = await response_obj.json();
      console.error('OpenAI API error:', error);
      return response.status(response_obj.status).json({
        error: error.error?.message || 'Failed to generate response',
      });
    }

    const data = await response_obj.json();
    const reply = data.choices[0]?.message?.content;

    if (!reply) {
      return response.status(500).json({ error: 'No response from AI service' });
    }

    return response.status(200).json({ reply });
  } catch (error) {
    console.error('Chat handler error:', error);
    return response.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
