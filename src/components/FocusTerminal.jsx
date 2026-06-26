import { marked } from "marked";
import { useEffect, useRef, useState } from "react";

const COMMAND = "cat focus.txt";
const TYPE_DELAY = 52;
const OUTPUT_LINE_DELAY = 140;
const POST_COMMAND_DELAY = 380;

marked.setOptions({ breaks: true, gfm: true });

function splitMarkdownBlocks(content) {
  return content
    .trim()
    .split(/\n{2,}/)
    .filter(Boolean);
}

export default function FocusTerminal({
  content,
  user = "matyas",
  host = "portfolio",
  path = "~",
}) {
  const rootRef = useRef(null);
  const hasRun = useRef(false);
  const [started, setStarted] = useState(false);
  const [typedCommand, setTypedCommand] = useState("");
  const [phase, setPhase] = useState("idle");
  const [visibleBlocks, setVisibleBlocks] = useState(0);

  const blocks = splitMarkdownBlocks(content);
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasRun.current) {
          hasRun.current = true;
          setStarted(true);
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;

    if (reducedMotion) {
      setTypedCommand(COMMAND);
      setPhase("output");
      setVisibleBlocks(blocks.length);
      return;
    }

    setPhase("typing");
    let index = 0;
    const interval = window.setInterval(() => {
      index += 1;
      setTypedCommand(COMMAND.slice(0, index));
      if (index >= COMMAND.length) {
        window.clearInterval(interval);
        window.setTimeout(() => setPhase("output"), POST_COMMAND_DELAY);
      }
    }, TYPE_DELAY);

    return () => window.clearInterval(interval);
  }, [started, reducedMotion, blocks.length]);

  useEffect(() => {
    if (phase !== "output" || reducedMotion) return;

    let index = 0;
    const interval = window.setInterval(() => {
      index += 1;
      setVisibleBlocks(index);
      if (index >= blocks.length) {
        window.clearInterval(interval);
        setPhase("done");
      }
    }, OUTPUT_LINE_DELAY);

    return () => window.clearInterval(interval);
  }, [phase, reducedMotion, blocks.length]);

  const showCursor = phase === "typing" || (phase === "output" && visibleBlocks < blocks.length);
  const title = `${user}@${host} — zsh`;

  return (
    <div className="terminal" ref={rootRef} aria-label="Terminal showing current focus">
      <div className="terminal-titlebar">
        <div className="terminal-lights" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <span className="terminal-title">{title}</span>
      </div>

      <div className="terminal-body">
        <p className="terminal-line" aria-hidden={phase === "idle"}>
          <span className="terminal-prompt-user">{user}</span>
          <span className="terminal-prompt-at">@</span>
          <span className="terminal-prompt-host">{host}</span>
          <span className="terminal-prompt-path">:{path}</span>
          <span className="terminal-prompt-symbol">$ </span>
          <span className="terminal-command">{typedCommand}</span>
          {showCursor && <span className="terminal-cursor" aria-hidden="true"></span>}
        </p>

        {(phase === "output" || phase === "done") && (
          <div className="terminal-output" aria-live="polite">
            {blocks.slice(0, visibleBlocks).map((block, i) => (
              <div
                key={i}
                className="terminal-output-block"
                dangerouslySetInnerHTML={{ __html: marked.parse(block) }}
              />
            ))}
            {phase === "output" && visibleBlocks < blocks.length && (
              <span className="terminal-cursor" aria-hidden="true"></span>
            )}
          </div>
        )}
      </div>

      <div className="terminal-sr">
        {phase === "done" || (reducedMotion && started)
          ? `Command: ${COMMAND}. Output: ${content}`
          : "Terminal animation in progress."}
      </div>
    </div>
  );
}
