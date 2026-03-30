export interface Word {
  id: string;
  original: string;
  translation: string;
  exampleSentence?: string;
  createdAt: number;
  correctAnswers: number;
  wrongAnswers: number;
}
