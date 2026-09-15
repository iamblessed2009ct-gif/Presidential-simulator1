export type Screen = 'home' | 'proposal' | 'summary' | 'news' | 'states' | 'citizens' | 'election';
export type Party = 'Democratic' | 'Republican' | 'Independent' | 'Unity Coalition';
export type Leaning = 'Progressive' | 'Liberal' | 'Moderate' | 'Conservative' | 'Libertarian';
export type StateGrade = 'good' | 'okay' | 'bad';

export type Metrics = {
  approval: number; economy: number; global: number; crisis: number; inflation: number;
  deficit: number; debt: number; gdp: number; stability: number; family: number; foreign: number;
};
export type Citizen = { name: string; race: string; leaning: Leaning; rating: number; response: string; state: string };
export type ProposalResult = { title: string; category: string; economicRisk: number; implementationRisk: number; publicRisk: number; news: { left: string; right: string; neutral: string }; citizens: Citizen[]; stateReactions: Record<string, StateGrade>; metricChanges: Partial<Metrics>; advisor?: string };
export type Profile = { name: string; party: Party; vicePresident: string; margin: string };
