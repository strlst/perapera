import styles from "./RubyText.module.css";

interface Segment {
    base: string;
    reading: string | null;
}

// only kanji (CJK unified + ext-A) get ruby annotations
// kana and other characters are emitted as plain segments
function isKanji(c: string): boolean {
    const cp = c.codePointAt(0)!;
    return (cp >= 0x4e00 && cp <= 0x9fff) || (cp >= 0x3400 && cp <= 0x4dbf);
}

// parses strings like "開発(かいはつ)する" or "チケットを取(と)る"
export function parseFurigana(furi: string): Segment[] {
    const segments: Segment[] = [];
    let i = 0;

    while (i < furi.length) {
        const parenOpen = furi.indexOf("(", i);
        if (parenOpen === -1) {
            if (i < furi.length) segments.push({ base: furi.slice(i), reading: null });
            break;
        }

        const parenClose = furi.indexOf(")", parenOpen);
        if (parenClose === -1) {
            segments.push({ base: furi.slice(i), reading: null });
            break;
        }

        const reading = furi.slice(parenOpen + 1, parenClose);

        // scan back to find the contiguous kanji run immediately before '('
        let baseStart = parenOpen - 1;
        while (baseStart >= i && isKanji(furi[baseStart])) baseStart--;
        baseStart++;

        // text between current position and the kanji run is plain
        if (i < baseStart) {
            segments.push({ base: furi.slice(i, baseStart), reading: null });
        }

        segments.push({ base: furi.slice(baseStart, parenOpen), reading });
        i = parenClose + 1;
    }

    return segments;
}

interface Props {
    furi: string;
    className?: string;
}

export default function RubyText({ furi, className }: Props) {
    const segments = parseFurigana(furi);

    return (
        <span className={`${styles.ruby} ${className ?? ""}`}>
            {segments.map((seg, i) =>
                seg.reading ? (
                    <ruby key={i} className={styles.rubyPair}>
                        {seg.base}
                        <rp>(</rp>
                        <rt>{seg.reading}</rt>
                        <rp>)</rp>
                    </ruby>
                ) : (
                    <span key={i}>{seg.base}</span>
                )
            )}
        </span>
    );
}