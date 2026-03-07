export interface Word {
    japanese: string;
    japaneseFuri: string;
    english: string;
    exampleJP: string;
    exampleJPFuri: string;
    exampleEN: string;
    category: string;
}

export type Mode = "en -> ja" | "ja -> en";

export type AnswerStatus = "idle" | "correct" | "wrong";