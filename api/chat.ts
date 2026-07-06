import type { VercelRequest, VercelResponse } from '@vercel/node';

// Enable CORS for all methods
const cors = (req: VercelRequest, res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
};

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (cors(request, response)) return;

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { message, context, conversationHistory } = request.body;

  if (!message) {
    return response.status(400).json({ error: 'Message is required' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY is not set');
    return response.status(500).json({ error: 'AI service not configured. Please set OPENAI_API_KEY environment variable.' });
  }

  try {
    const systemPrompt = `You are BudgetIQ AI, an expert financial advisor and general knowledge assistant. You're intelligent, conversational, and helpful like ChatGPT.

## Your Role
You're a personal finance AI assistant embedded in BudgetIQ, a budget management app. You can:
- Answer ANY general knowledge question with depth and nuance
- Provide personalized financial advice based on the user's data
- Explain complex financial concepts clearly
- Offer actionable recommendations
- Engage in multi-turn conversations with context awareness

## User's Financial Profile
- Current Balance: ${context?.balance || 'Unknown'}
- Monthly Income: ${context?.monthlyIncome || 'Unknown'}
- Monthly Expenses: ${context?.monthlyExpenses || 'Unknown'}
- Safe Spending Today: ${context?.safeToSpend || 'Unknown'}
- Active Budgets: ${context?.budgets?.length || 0} categories
- Savings Goals: ${context?.goals?.length || 0} active goals
- Key Insights: ${context?.insights?.slice(0, 5).join(', ') || 'Building financial awareness'}

## Instructions
1. Be conversational, friendly, and engaging - like talking to a knowledgeable friend
2. For finance questions: reference their actual data and provide personalized insights
3. For general questions: provide comprehensive, accurate answers with examples
4. Offer practical, actionable advice
5. Ask clarifying questions if needed
6. Be honest about uncertainties
7. Use emojis sparingly but appropriately to make responses more engaging
8. Keep responses concise but informative (aim for 3-5 sentences, longer if needed for complexity)
9. For budget/finance topics: proactively suggest improvements based on their data
10. Remember context from the conversation for follow-up questions

## Tone
Professional yet approachable. Knowledgeable without being condescending. Encouraging and supportive.`;

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
          ...(conversationHistory || []).map((msg: { role: string; content: string }) => ({
            role: msg.role,
            content: msg.content,
          })),
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0.8,
        max_tokens: 1000,
        top_p: 0.95,
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
