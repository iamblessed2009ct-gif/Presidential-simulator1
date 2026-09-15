# The Nation — AI Presidential Simulation

This version uses **Google Gemini** as the game's live simulation engine. The AI generates the presidential consequences instead of relying only on scripted responses.

## AI setup

Google currently provides a free tier for eligible Gemini API models. This project defaults to `gemini-3.7-flash`, and the model can be changed with the `GEMINI_MODEL` Supabase secret.

1. Create a Gemini API key in Google AI Studio.
2. In your Supabase project, open **Edge Functions → Secrets**.
3. Add:
   - `GEMINI_API_KEY` = your Gemini API key
   - `GEMINI_MODEL` = `gemini-3.7-flash` (optional)
4. Deploy the `presidential-response` Edge Function.
5. Keep the Gemini key server-side. **Do not put it in `VITE_*` variables or browser code.**

The browser continues to call the existing Supabase Edge Function. The Edge Function calls Gemini, so the API key is never sent to the player.

## What is AI-generated

When the player submits a proposal, Gemini generates:

- economic, implementation, and public risk
- left-leaning, right-leaning, and neutral news coverage
- eight individual citizen reactions
- ratings for those citizens
- all 50 state reactions
- approval, economy, inflation, deficit, GDP, stability, and foreign-relations changes
- private Chief of Staff advice

The prompt also sends the current month, president, party, and major simulation metrics to Gemini so the reaction can account for the administration's existing situation.

If Gemini is unavailable, the game automatically falls back to its built-in deterministic simulator so the game remains playable.

## Important

"Free AI" means the Gemini API's currently available free tier, not unlimited usage. Google can impose rate limits and change model availability or pricing. Check Google's current Gemini API pricing before deploying publicly.
