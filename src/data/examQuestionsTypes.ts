export type ExamOption = {
    id: string;
    text: string;
};

export type ExamQuestion = {
    id: number;
    originalId?: number;
    question: string;
    image?: string;
    options: ExamOption[];
    correctAnswer: string;
};

export type ExamCategory = "isletme" | "teknik" | "yonetmelik";
