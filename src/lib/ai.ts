import { supabase } from './supabase';
import { fallbackResult } from './data';
import type { ProposalResult } from './types';

const proposalSystemPrompt = `You are the simulation engine for an ultra-realistic presidential strategy game. The player is a fictional US president. They will propose a policy — it could be anything from a modest pilot program to something extreme and unconstitutional.

Your job: analyze EXACTLY what they said and generate realistic consequences.

CRITICAL RULES:
1. You MUST directly reference and react to the specific words the president used. If they say "eliminate all taxes," the news must discuss eliminating all taxes — not a generic version of it.
2. Extreme proposals must have realistic negative consequences. "Eliminate all members of Congress" should crater approval, trigger constitutional crisis, and produce overwhelmingly negative reactions. Do NOT reward extremism with approval gains.
3. News articles must sound like real journalism — cite specific concerns, name stakeholders, describe the political dynamics.
4. Citizen responses must sound like real people with real fears and hopes, reacting to the SPECIFIC policy.
5. Metric changes must be realistic: extreme policies lose approval and stability; cautious policies gain small approval; bold policies are mixed.
6. Generate exactly 8 citizens with diverse demographics (race, political leaning, state). Do not stereotype anyone based on race, state, or ideology.
7. Each citizen rating is 0-100 where 50 is neutral.
8. State reactions: grade each of the 50 states as "good", "okay", or "bad" based on the policy's actual effects on that state's economy, voters, industries, or political incentives. Do not randomize the map.
9. Separate immediate effects from longer-term effects. Avoid magical overnight changes.
10. Return ONLY valid JSON, no markdown, no explanation.

Return this exact JSON shape:
{
  "economicRisk": number (0-100),
  "implementationRisk": number (0-100),
  "publicRisk": number (0-100),
  "news": {
    "left": "string - 3-4 sentences, left-leaning outlet reacting to the SPECIFIC proposal",
    "right": "string - 3-4 sentences, right-leaning outlet reacting to the SPECIFIC proposal",
    "neutral": "string - 3-4 sentences, neutral wire service reacting to the SPECIFIC proposal"
  },
  "citizens": [
    { "name": "string", "race": "string", "leaning": "Progressive|Liberal|Moderate|Conservative|Libertarian", "rating": number 0-100, "response": "string - 2-3 sentences reacting to the SPECIFIC policy", "state": "string - a US state name" }
  ],
  "stateReactions": { "State Name": "good"|"okay"|"bad", ... all 50 states },
  "metricChanges": {
    "approval": number (negative for bad policies, positive for good ones),
    "economy": number,
    "stability": number,
    "inflation": number,
    "deficit": number (negative = more deficit),
    "gdp": number,
    "foreign": number
  }
}`;

export async function generateProposalResult(title: string, proposal: string, context: string, issueIndex: number, gameState?: string): Promise<ProposalResult> {
  const fallback = fallbackResult(title, proposal, issueIndex);
  try {
    const { data, error } = await supabase.functions.invoke('presidential-response', {
      body: {
        mode: 'proposal',
        systemPrompt: proposalSystemPrompt,
        userPrompt: `The president's exact proposal: "${proposal}"\n\nIssue context: ${context}\n\nCurrent simulation state: ${gameState || "No additional state provided."}\n\nAnalyze this specific proposal and generate realistic consequences. The president said these exact words — every reaction must reference what they actually proposed.`,
      },
    });
    if (!error && data?.content) {
      const parsed = JSON.parse(data.content);
      return { ...fallback, ...parsed } as ProposalResult;
    }
  } catch { /* Authored responses preserve the flow when the AI service is unavailable. */ }
  return fallback;
}

export async function askAdvisor(proposal: string, context: string): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('presidential-response', {
      body: {
        systemPrompt: `You are a candid, experienced White House chief of staff. The president has proposed a specific policy. Give a short, realistic private assessment.

RULES:
1. React to the EXACT proposal. If it is extreme or unconstitutional, say so plainly.
2. Name one political danger, one practical risk, and one recommendation.
3. Be honest — do not flatter the president. If the proposal is politically toxic, say it.
4. Keep it to 3-4 sentences. Never mention AI.`,
        userPrompt: `Issue context: ${context}\n\nThe president's exact proposal: "${proposal}"\n\nWhat is your honest assessment?`,
      },
    });
    if (!error && typeof data?.content === 'string') return data.content;
  } catch { /* Use fallback below. */ }
  return analyzeFallback(proposal);
}

function analyzeFallback(proposal: string): string {
  const lower = proposal.toLowerCase();
  const extremeWords = ['eliminate', 'abolish', 'dissolve', 'ban all', 'remove all', 'round up', 'deport all', 'seize', 'martial law', 'suspend', 'defund', 'all members', 'all taxes', 'purge', 'execute', 'arrest all', 'disband', 'dismantle'];
  const isExtreme = extremeWords.some((word) => lower.includes(word));
  if (isExtreme) {
    return `I have to be direct with you: this will not survive contact with reality. The legal challenges alone will consume your first year, and the political fallout will cost us the midterms. My recommendation is to pull back, reframe this as a review or a pilot, and keep the option open without committing to the extreme version. The country is not ready for what you just said, and neither is Congress.`;
  }
  return `The instinct is sound, but the proposal needs a visible funding source and a deadline. Support is there if you explain who benefits first; opposition will focus on the second-order cost. I would announce a pilot, publish the metrics, and give Congress a clear off-ramp.`;
}
