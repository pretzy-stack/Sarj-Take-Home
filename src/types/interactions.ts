export interface Interaction {
  from: string
  to: string
  count: number
  sentiment: string
  quotes: string[]
  positions?: number[]
}

export interface AnalysisData {
  characters: string[]
  interactions: Interaction[]
}
