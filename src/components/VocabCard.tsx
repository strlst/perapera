import { useCallback, useEffect, useRef, useState } from "react";
import type { AnswerStatus, Mode, Word } from "../types";
import { normalise } from "../vocab";
import RubyText from "./RubyText";
import styles from "./VocabCard.module.css";

interface Props {
    card: Word;
    index: number;
    total: number;
    mode: Mode;
    onCorrect: () => void;
    onWrong: () => void;
    onSkip: () => void;
}

export default function VocabCard({ card, index, total, mode, onCorrect, onWrong, onSkip }: Props) {
    const [value, setValue] = useState("");
    const [status, setStatus] = useState<AnswerStatus>("idle");
    const [anim, setAnim] = useState<"shake" | "pop" | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setValue("");
        setStatus("idle");
        setAnim(null);

        const el = cardRef.current;
        if (el) {
            el.classList.remove(styles.cardEnter);
            void el.offsetWidth;
            el.classList.add(styles.cardEnter);
        }

        setTimeout(() => inputRef.current?.focus(), 50);
    }, [card]);

    const check = useCallback(() => {
        if (status === "correct") {
            onCorrect();
            return;
        }
        if (status === "wrong") {
            onSkip();
            return;
        }

        const expected = mode === "en -> ja" ? card.japanese : card.english;
        const isCorrect = normalise(value) === normalise(expected);

        if (isCorrect) {
            setStatus("correct");
            setAnim("pop");
            setTimeout(() => setAnim(null), 300);
            setTimeout(() => onCorrect(), 700);
        } else {
            setStatus("wrong");
            setAnim("shake");
            onWrong();
            setTimeout(() => setAnim(null), 400);
        }
    }, [value, status, card, mode, onCorrect, onWrong, onSkip]);

    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") check();
        if (e.key === "Escape") onSkip();
    };

    const question = mode === "en -> ja" ? card.english : card.japanese;
    const isJpPrompt = mode === "ja -> en";
    const placeholder = mode === "en -> ja" ? "日本語で入力…" : "type in english…";

    // for wrong feedback: show ruby if we're in en->ja mode and have furigana, else plain text
    const showRubyAnswer = mode === "en -> ja" && !!card.japaneseFuri;

    const cardClass = [
        styles.card,
        anim === "shake" ? styles.shake : "",
        anim === "pop" ? styles.pop : "",
    ].filter(Boolean).join(" ");

    return (
        <div ref={cardRef} className={cardClass}>
            <span className={styles.counter}>{index + 1} / {total}</span>

            <p className={styles.badge}>
                <span className={styles.dot} />
                {mode}
            </p>

            <p className={`${styles.word} ${isJpPrompt ? styles.wordJp : ""}`}>
                {question}
            </p>

            {!isJpPrompt && card.exampleEN && (
                <p className={styles.example}>"{card.exampleEN}"</p>
            )}

            {isJpPrompt && card.exampleJP && (
                <p className={styles.example}>{card.exampleJP}</p>
            )}

            <div className={styles.inputRow}>
                <input
                    ref={inputRef}
                    className={[
                        styles.input,
                        status === "correct" ? styles.inputCorrect : "",
                        status === "wrong" ? styles.inputWrong : "",
                    ].filter(Boolean).join(" ")}
                    value={value}
                    placeholder={placeholder}
                    disabled={status === "correct"}
                    onChange={(e) => {
                        if (status !== "correct") setValue(e.target.value);
                    }}
                    onKeyDown={handleKey}
                    style={{
                        fontFamily: mode === "en -> ja" ? "'Noto Sans JP', sans-serif" : "'Ubuntu', sans-serif",
                    }}
                />
                <button className={styles.submitBtn} onClick={check}>
                    {status === "correct" ? "next ->" : status === "wrong" ? "skip" : "check"}
                </button>
            </div>

            <div className={`${styles.feedback} ${status !== "idle" ? styles[`feedback_${status}`] : ""}`}>
                {status === "correct" && (
                    <span>✓ correct!</span>
                )}
                {status === "wrong" && (
                    <span className={styles.wrongFeedback}>
                        <span className={styles.wrongLabel}>✗ answer:</span>
                        {showRubyAnswer
                            ? <RubyText furi={card.japaneseFuri} />
                            : <span className={styles.feedbackWord}>
                                {mode === "en -> ja" ? card.japanese : card.english}
                            </span>
                        }
                    </span>
                )}
            </div>

            <div className={styles.actions}>
                <button className={styles.ghostBtn} onClick={onSkip}>
                    skip · esc
                </button>
                {status === "idle" && (
                    <button className={styles.ghostBtn} onClick={() => { setStatus("wrong"); onWrong(); }}>
                        show answer
                    </button>
                )}
            </div>
        </div>
    );
}