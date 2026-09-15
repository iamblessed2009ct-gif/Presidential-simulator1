import type { Citizen, ProposalResult, StateGrade } from './types';

export const states = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];
export const stateAbbr: Record<string,string> = { Alabama:'AL', Alaska:'AK', Arizona:'AZ', Arkansas:'AR', California:'CA', Colorado:'CO', Connecticut:'CT', Delaware:'DE', Florida:'FL', Georgia:'GA', Hawaii:'HI', Idaho:'ID', Illinois:'IL', Indiana:'IN', Iowa:'IA', Kansas:'KS', Kentucky:'KY', Louisiana:'LA', Maine:'ME', Maryland:'MD', Massachusetts:'MA', Michigan:'MI', Minnesota:'MN', Mississippi:'MS', Missouri:'MO', Montana:'MT', Nebraska:'NE', Nevada:'NV', 'New Hampshire':'NH', 'New Jersey':'NJ', 'New Mexico':'NM', 'New York':'NY', 'North Carolina':'NC', 'North Dakota':'ND', Ohio:'OH', Oklahoma:'OK', Oregon:'OR', Pennsylvania:'PA', 'Rhode Island':'RI', 'South Carolina':'SC', 'South Dakota':'SD', Tennessee:'TN', Texas:'TX', Utah:'UT', Vermont:'VT', Virginia:'VA', Washington:'WA', 'West Virginia':'WV', Wisconsin:'WI', Wyoming:'WY' };
export const issues = [
  { title: 'The cost of staying afloat', tag: 'ECONOMY • NATIONAL', context: 'Households are feeling the squeeze from elevated prices. A bipartisan group wants relief now, while your budget director warns that a rushed package could keep inflation high.', choices: ['Targeted grocery and utility rebates for working families', 'A temporary payroll-tax holiday paid for with spending cuts', 'Leave markets alone and focus on long-term supply reform'] },
  { title: 'The border after midnight', tag: 'SECURITY • NATIONAL', context: 'Border communities are asking for help as arrivals rise. A court ruling has narrowed your options, and both parties are demanding a plan that can survive a divided Congress.', choices: ['Expand judges and asylum processing capacity', 'Use emergency authorities for a temporary restriction', 'Offer a legal pathway paired with new enforcement'] },
  { title: 'An ally under pressure', tag: 'WORLD • INTERNATIONAL', context: 'A treaty ally reports that foreign-backed groups are testing its airspace. Your intelligence team has high confidence in the pattern but low confidence in the sponsor.', choices: ['Move additional defensive assets into the region', 'Open a private channel before making any public move', 'Build a coalition statement with allied governments'] },
  { title: 'An open agenda month', tag: 'OPEN AGENDA • MONTH 6', context: 'There is no single crisis demanding the podium this month. Your advisors want one defining initiative that tells the country what your presidency is for.', choices: ['A national housing and construction initiative', 'A public service and civic renewal program', 'A competitiveness package for advanced manufacturing'] },
];

type Analysis = { extremism: number; constitutional: boolean; category: string; keywords: string[]; tone: 'extreme' | 'bold' | 'moderate' | 'cautious' };

const extremeWords = ['eliminate', 'abolish', 'dissolve', 'ban all', 'remove all', 'round up', 'deport all', 'seize', 'nationalize', 'martial law', 'suspend', 'shutdown', 'defund', 'zero', 'all members', 'all taxes', 'all immigrants', 'never', 'immediately ban', 'strip', 'purge', 'execute', 'arrest all', 'shut down', 'dismantle', 'outlaw', 'prohibit all', 'cancel all', 'end all', 'cut all', 'fire all', 'disband'];
const boldWords = ['increase', 'expand', 'launch', 'establish', 'create', 'reform', 'overhaul', 'massive', 'sweeping', 'major', 'comprehensive', 'double', 'triple', 'free', 'universal', 'mandatory', 'federal', 'national'];
const cautiousWords = ['study', 'review', 'pilot', 'gradual', 'limited', 'targeted', 'modest', 'temporary', 'encourage', 'incentivize', 'voluntary', 'optional', 'small'];
const economyWords = ['tax', 'tariff', 'spending', 'budget', 'deficit', 'debt', 'gdp', 'economy', 'inflation', 'interest rate', 'jobs', 'employment', 'wages', 'trade', 'subsidy', 'stimulus', 'dollar', 'federal reserve'];
const foreignWords = ['war', 'treaty', 'ally', 'sanction', 'military', 'nato', 'united nations', 'china', 'russia', 'iran', 'israel', 'ukraine', 'taiwan', 'border', 'immigration', 'trade deal', 'diplomat', 'embassy', 'nuclear'];
const socialWords = ['healthcare', 'education', 'abortion', 'gun', 'marriage', 'race', 'religion', 'climate', 'environment', 'prison', 'police', 'voting', 'rights', 'welfare', 'housing', 'drugs', 'crime'];

function analyzeProposal(proposal: string): Analysis {
  const lower = proposal.toLowerCase();
  const foundExtreme = extremeWords.filter((word) => lower.includes(word));
  const foundBold = boldWords.filter((word) => lower.includes(word));
  const foundCautious = cautiousWords.filter((word) => lower.includes(word));
  let extremism = 15;
  if (foundExtreme.length > 0) extremism = 70 + foundExtreme.length * 10;
  else if (foundBold.length > 0) extremism = 35 + foundBold.length * 5;
  else if (foundCautious.length > 0) extremism = 15;
  extremism = Math.min(100, extremism);
  let category = 'domestic';
  if (foreignWords.some((word) => lower.includes(word))) category = 'foreign';
  else if (economyWords.some((word) => lower.includes(word))) category = 'economic';
  else if (socialWords.some((word) => lower.includes(word))) category = 'social';
  const constitutional = !foundExtreme.some((word) => ['dissolve', 'martial law', 'suspend', 'purge', 'execute', 'arrest all', 'round up', 'all members'].includes(word));
  const keywords = [...foundExtreme, ...foundBold, ...foundCautious];
  const tone: Analysis['tone'] = extremism >= 70 ? 'extreme' : extremism >= 35 ? 'bold' : extremism >= 20 ? 'moderate' : 'cautious';
  return { extremism, constitutional, category, keywords, tone };
}

const citizenNames = ['Maria Alvarez','Darnell Brooks','Emily Chen','Robert Kowalski','Aisha Rahman','Tommy Nguyen','Grace Whitaker','Luis Mendoza'];
const citizenRaces = ['Latina','Black','Asian American','White','Middle Eastern','Vietnamese American','White','Latino'];
const citizenLeanings = ['Progressive','Moderate','Liberal','Conservative','Liberal','Libertarian','Moderate','Conservative'] as const;

function citizenResponse(index: number, isExtreme: boolean, isCautious: boolean, constitutional: boolean, lower: string): string {
  if (index === 0) {
    if (isExtreme) return `You want to ${lower}? I cannot support something this drastic. My family would be directly hurt by this, and I do not think you have thought through what happens the day after.`;
    if (isCautious) return `This sounds reasonable. I do not love it, but I can see the logic. Just make sure it actually reaches people like me.`;
    return `I agree with the direction, but the details matter. I want to see how this shows up in my monthly budget before I celebrate.`;
  }
  if (index === 1) {
    if (isExtreme) return `Finally, someone willing to say it out loud. I have been waiting for a president who does not flinch. The establishment will fight you, but that is exactly why I voted for you.`;
    return `This is exactly the kind of thing politicians promise, then forget when the cameras leave. I am watching who pays for it.`;
  }
  if (index === 2) {
    if (isExtreme) {
      return constitutional
        ? `I am not sure this is even legal. You cannot just ${lower} by executive order. The courts will block it within a week, and then what?`
        : `This is not policy. This is a power grab. I did not vote for a king, I voted for a president. There are rules.`;
    }
    return `I do not trust a plan this expensive without a sunset clause and a number attached to it. Show me the cost.`;
  }
  if (isExtreme) return `I am scared. I have children in school. What you are proposing would upend everything for people like us. This is not leadership, it is recklessness.`;
  return `I am cautiously optimistic. I have seen promises before. But if you actually follow through, this could matter.`;
}

function buildCitizenResponses(proposal: string, analysis: Analysis): Citizen[] {
  const lower = proposal.toLowerCase();
  const isExtreme = analysis.tone === 'extreme';
  const isCautious = analysis.tone === 'cautious';
  return citizenNames.map((name, index) => {
    const baseRating = isExtreme ? 22 + ((index * 7) % 18) : isCautious ? 55 + ((index * 5) % 20) : 48 + ((index * 11) % 25);
    const leaningAdjust = citizenLeanings[index] === 'Conservative' && analysis.category === 'economic' ? -5 : citizenLeanings[index] === 'Progressive' && analysis.category === 'social' ? +8 : 0;
    return { name, race: citizenRaces[index], leaning: citizenLeanings[index], rating: Math.max(5, Math.min(95, baseRating + leaningAdjust)), state: states[(index * 7 + proposal.length) % states.length], response: citizenResponse(index, isExtreme, isCautious, analysis.constitutional, lower) };
  });
}

function buildNews(proposal: string, analysis: Analysis) {
  const lower = proposal.toLowerCase();
  const quoted = `"${proposal}"`;
  if (analysis.tone === 'extreme') {
    return {
      left: `The president's call to ${lower} crossed a line that even this divided press corps cannot ignore. Civil liberties groups are already preparing legal challenges, and constitutional scholars on both sides are questioning whether the administration has the authority — or the mandate — to follow through. The proposal drew immediate condemnation from congressional leadership, who warned of institutional damage if the White House proceeds.`,
      right: `In a stunning move, the president announced plans to ${lower}, a proposal that energized the base but sent shockwaves through Capitol Hill. Supporters called it long overdue; critics called it unworkable. The legal path is uncertain, the political cost is high, and the question now is whether this was a governing strategy or a headline designed to dominate the news cycle.`,
      neutral: `The president proposed ${quoted} today, an announcement that immediately raised questions about feasibility, legality, and political consequences. Legal experts are divided on whether the administration can act unilaterally. Congressional leaders from both parties have requested briefings. Markets reacted cautiously, and international allies are seeking clarification on what the policy means in practice.`,
    };
  }
  if (analysis.tone === 'bold') {
    return {
      left: `The White House unveiled a plan to ${lower}, marking the most ambitious domestic move of the term so far. Progressive groups welcomed the scale but warned that execution will determine whether it reaches the people who need it most. Republicans are already framing it as overreach.`,
      right: `The president announced ${quoted}, betting big on an activist federal role. Conservative analysts questioned the cost and the precedent, while business groups warned of unintended consequences. Whether it survives Congress remains an open question.`,
      neutral: `The administration proposed ${quoted}, a significant policy initiative that will be tested in the coming weeks by congressional negotiations, budget constraints, and public reaction. The plan has drawn early support from the president's party and skepticism from the opposition.`,
    };
  }
  return {
    left: `The president's proposal to ${lower} is a measured step that falls short of what advocates wanted. It signals attention to the issue without committing to the structural change many on the left are demanding.`,
    right: `The administration floated ${quoted}, a modest proposal that drew a collective shrug from fiscal hawks. It does little to address the underlying problem, but it also does not create new liabilities.`,
    neutral: `The president proposed ${quoted}, a targeted approach that reflects the administration's preference for incremental action. The policy will face limited opposition and likely produce limited impact.`,
  };
}

function buildStateReactions(analysis: Analysis): Record<string, StateGrade> {
  const seed = analysis.extremism;
  return Object.fromEntries(states.map((state, index) => {
    if (analysis.tone === 'extreme') return [state, (index + seed) % 3 === 0 ? 'okay' : 'bad'];
    if (analysis.tone === 'bold') return [state, (index + seed) % 4 === 0 ? 'bad' : (index + seed) % 3 === 0 ? 'okay' : 'good'];
    return [state, (index + seed) % 5 === 0 ? 'bad' : (index + seed) % 3 === 0 ? 'okay' : 'good'];
  }));
}

function buildMetricChanges(analysis: Analysis, issueIndex: number) {
  if (analysis.tone === 'extreme') return { approval: -12 - (analysis.extremism % 10), economy: -8, stability: -15, inflation: 0.4, deficit: -50, gdp: -0.3, foreign: issueIndex === 2 ? -10 : -5, crisis: 20 };
  if (analysis.tone === 'bold') return { approval: 3 - (analysis.extremism % 6), economy: 2, stability: -2, inflation: 0.2, deficit: -30, gdp: 0.15, foreign: issueIndex === 2 ? 4 : 0, crisis: 5 };
  return { approval: 2, economy: 1, stability: 1, inflation: 0, deficit: -10, gdp: 0.05, foreign: issueIndex === 2 ? 2 : 0, crisis: -2 };
}

export const fallbackResult = (title: string, proposal: string, issueIndex: number): ProposalResult => {
  const analysis = analyzeProposal(proposal);
  return {
    title: proposal,
    category: analysis.category,
    economicRisk: Math.min(95, 20 + analysis.extremism * 0.6),
    implementationRisk: Math.min(95, 15 + analysis.extremism * 0.7),
    publicRisk: Math.min(95, 10 + analysis.extremism * 0.8),
    news: buildNews(proposal, analysis),
    citizens: buildCitizenResponses(proposal, analysis),
    stateReactions: buildStateReactions(analysis),
    metricChanges: buildMetricChanges(analysis, issueIndex),
  };
};
