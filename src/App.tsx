import { useEffect, useState } from "react";
import { CSV_FILES, parseCsv, shuffle } from "./vocab";
import type { Mode, Word } from "./types";
import VocabCard from "./components/VocabCard";
import styles from "./App.module.css";

export default function App() {
    const [allWords, setAllWords] = useState<Word[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeCategories, setActiveCategories] = useState<Set<string>>(
        new Set(CSV_FILES.map((f) => f.label))
    );
    const [queue, setQueue] = useState<Word[]>([]);
    const [cursor, setCursor] = useState(0);
    const [correct, setCorrect] = useState(0);
    const [wrong, setWrong] = useState(0);

    // mode is typed for future extensibility, add a toggle button and setMode to enable ja -> en
    const [mode] = useState<Mode>("en -> ja");

    useEffect(() => {
        Promise.all(
            CSV_FILES.map((f) =>
                fetch(f.url)
                    .then((r) => {
                        if (!r.ok) throw new Error(`failed to load ${f.label}`);
                        return r.text();
                    })
                    .then((text) => parseCsv(text, f.label))
            )
        )
            .then((results) => {
                setAllWords(results.flat());
                setLoading(false);
            })
            .catch((e: Error) => {
                setError(e.message);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (!allWords.length) return;
        const filtered = allWords.filter((w) => activeCategories.has(w.category));
        setQueue(shuffle(filtered));
        setCursor(0);
        setCorrect(0);
        setWrong(0);
    }, [allWords, activeCategories]);

    const toggleCategory = (label: string) => {
        setActiveCategories((prev) => {
            const next = new Set(prev);
            if (next.has(label) && next.size === 1) return prev;
            next.has(label) ? next.delete(label) : next.add(label);
            return next;
        });
    };

    const restart = () => {
        setQueue((q) => shuffle(q));
        setCursor(0);
        setCorrect(0);
        setWrong(0);
    };

    const total = queue.length;
    const done = total > 0 && cursor >= total;
    const remaining = Math.max(0, total - cursor);
    const attempted = correct + wrong;
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

    return (
        <div className={styles.app}>
            <header className={styles.header}>
                <h1 className={styles.title}>
                    ペラ<span className={styles.accent}>ペラ</span>
                </h1>
                <p className={styles.subtitle}>エンジニア語彙 · 練習</p>
            </header>

            {loading && (
                <div className={styles.status}>
                    <span className={styles.spinner} />
                    fetching vocabulary data…
                </div>
            )}

            {error && (
                <div className={`${styles.status} ${styles.statusError}`}>
                    ⚠ {error}
                </div>
            )}

            {!loading && !error && (
                <>
                    <div className={styles.stats}>
                        <div className={styles.stat}>
                            <span className={`${styles.statNum} ${styles.statCorrect}`}>{correct}</span>
                            <span className={styles.statLabel}>correct</span>
                        </div>
                        <div className={styles.divider} />
                        <div className={styles.stat}>
                            <span className={`${styles.statNum} ${styles.statWrong}`}>{wrong}</span>
                            <span className={styles.statLabel}>wrong</span>
                        </div>
                        <div className={styles.divider} />
                        <div className={styles.stat}>
                            <span className={styles.statNum}>{remaining}</span>
                            <span className={styles.statLabel}>remaining</span>
                        </div>
                    </div>

                    <div className={styles.filters}>
                        {CSV_FILES.map((f) => (
                            <button
                                key={f.label}
                                className={`${styles.pill} ${activeCategories.has(f.label) ? styles.pillActive : ""}`}
                                onClick={() => toggleCategory(f.label)}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    <div className={styles.progressBar}>
                        <div
                            className={styles.progressFill}
                            style={{ width: total ? `${(cursor / total) * 100}%` : "0%" }}
                        />
                    </div>

                    {!done && queue[cursor] && (
                        <div className={styles.cardWrap}>
                            <VocabCard
                                key={cursor}
                                card={queue[cursor]}
                                index={cursor}
                                total={total}
                                mode={mode}
                                onCorrect={() => { setCorrect((n) => n + 1); setCursor((n) => n + 1); }}
                                onWrong={() => setWrong((n) => n + 1)}
                                onSkip={() => setCursor((n) => n + 1)}
                            />
                        </div>
                    )}

                    {done && (
                        <div className={styles.complete}>
                            <h2 className={styles.completeTitle}>session complete</h2>
                            <p className={styles.completeSub}>you reviewed all {total} cards</p>
                            <p className={styles.score}>{accuracy}%</p>
                            <p className={styles.completeSub}>{correct} correct · {wrong} wrong</p>
                            <button className={styles.restartBtn} onClick={restart}>
                                practice again
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}