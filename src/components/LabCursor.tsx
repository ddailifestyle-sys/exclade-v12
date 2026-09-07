import { useEffect, useRef } from "react";

export function LabCursor() {
    const cursorRef = useRef<HTMLSpanElement | null>(null);

    useEffect(() => {
        const moveCursor = (x: number, y: number) => {
            const cursor = cursorRef.current;
            if (!cursor) return;
            cursor.style.setProperty("position", "fixed", "important");
            cursor.style.setProperty("top", `${y}px`, "important");
            cursor.style.setProperty("left", `${x}px`, "important");
            cursor.style.setProperty("width", "2.1rem", "important");
            cursor.style.setProperty("height", "2.1rem", "important");
            cursor.style.setProperty("z-index", "1000", "important");
            cursor.style.setProperty("pointer-events", "none", "important");
            cursor.style.setProperty("transform", "none", "important");
            cursor.style.setProperty("transition", "none", "important");
            cursor.style.setProperty("opacity", "1", "important");
            cursor.classList.add("is-visible");
        };

        const onMouseMove = (event: MouseEvent) => moveCursor(event.clientX, event.clientY);
        const onMouseDown = (event: MouseEvent) => {
            moveCursor(event.clientX, event.clientY);
            const cursor = cursorRef.current;
            if (!cursor) return;
            cursor.classList.add("is-pressed");
            window.setTimeout(() => cursor.classList.remove("is-pressed"), 560);
        };

        window.addEventListener("mousemove", onMouseMove, { passive: true });
        window.addEventListener("mousedown", onMouseDown, { passive: true });
        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mousedown", onMouseDown);
        };
    }, []);

    return (
        <span
            ref={cursorRef}
            className="lab-cursor"
            style={{
                position: "fixed",
                top: "-40px",
                left: "-40px",
                width: "2.1rem",
                height: "2.1rem",
                zIndex: 1000,
                pointerEvents: "none",
                transform: "none",
                opacity: 0,
            }}
            aria-hidden="true"
        >
            <span className="lab-cursor-glass">
                <span className="lab-cursor-neck" />
                <span className="lab-cursor-power" />
            </span>
            <span className="lab-cursor-ring" />
            <span className="lab-cursor-drop" />
        </span>
    );
}
