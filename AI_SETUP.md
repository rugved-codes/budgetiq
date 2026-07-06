# BudgetIQ AI Assistant Setup Guide

Your AI Finance Assistant is now ready to use! Follow these steps to activate it:

## 1. Get an OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Go to "API keys" and click "Create new secret key"
4. Copy the key (you'll only see it once!)

## 2. Add the API Key to Vercel

### Option A: Using Vercel Dashboard
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your BudgetIQ project
3. Go to **Settings** → **Environment Variables**
4. Add a new variable:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: Paste your OpenAI API key
5. Make sure it's enabled for **Production**
6. Click "Save"

### Option B: Using Vercel CLI
```bash
vercel env add OPENAI_API_KEY
# Paste your OpenAI API key when prompted
```

## 3. Local Development (Optional)

If you want to test locally, create a `.env.local` file in your project root:

```
OPENAI_API_KEY=sk-your-actual-key-here
```

Then run:
```bash
npm run dev
```

## 4. Test the AI Assistant

1. Deploy your project to Vercel (or test locally)
2. Open the dashboard
3. Click on the "AI Finance Assistant" section
4. Ask questions like:
   - "What should I spend today?"
   - "How's my budget looking?"
   - "Tell me about my spending habits"
   - Any general question!

## ⚠️ Important Notes

- **Keep your API key secret!** Never commit it to git or share it publicly
- OpenAI API calls will incur costs. Check your usage on the [OpenAI dashboard](https://platform.openai.com/account/usage/overview)
- The AI now has access to your financial data to provide personalized advice
- If the API fails, you'll see fallback responses based on rules

## Pricing

OpenAI uses the gpt-3.5-turbo model (most affordable). Each response costs about $0.001 USD. Monitor your usage!

## Features

✅ Ask any question - the AI can answer general questions AND financial questions  
✅ Personalized responses using your actual financial data  
✅ Fallback to rule-based responses if API is unavailable  
✅ Friendly, conversational AI assistant  

Enjoy your AI-powered budget assistant! 🚀
