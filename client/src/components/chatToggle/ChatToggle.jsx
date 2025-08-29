import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./ChatToggle.module.scss";

export default function ChatToggle({
  currentUserId,
  users = [],
  role = "buyer",
  defaultOpen = false,
  position = "br",
  panelWidth = 380,
  panelHeight = 520,
  persistKey = "chat_toggle_open",
}) {
  // ====== UI open/close ======
  const [isOpen, setIsOpen] = useState(() => {
    try {
      const saved = localStorage.getItem(persistKey);
      return saved ? JSON.parse(saved) : defaultOpen;
    } catch {
      return defaultOpen;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(persistKey, JSON.stringify(isOpen));
    } catch (e) {
      console.log(e)
    }
  }, [isOpen]);

  // ====== People list ======
  const me = useMemo(() => users.find((u) => u.id === currentUserId), [users, currentUserId]);
  const counterRole = role === "buyer" ? "seller" : "buyer";
  const people = useMemo(() => users.filter((u) => u.role === counterRole), [users, counterRole]);

  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? people.filter((p) => p.name.toLowerCase().includes(q)) : people;
  }, [people, query]);

  const [activeId, setActiveId] = useState(filtered[0]?.id || "");
  useEffect(() => {
    if (!filtered.find((p) => p.id === activeId)) setActiveId(filtered[0]?.id || "");
  }, [filtered, activeId]);

  // ====== Threads & messages in localStorage ======
  const STORE = "bm_chat_threads_v1";
  const loadThreads = () => {
    try {
      return JSON.parse(localStorage.getItem(STORE) || "{}");
    } catch {
      return {};
    }
  };
  const saveThreads = (t) => {
    try {
      localStorage.setItem(STORE, JSON.stringify(t));
    } catch (e) {
      console.log(e)
    }
  };
  const threadId = (a, b) => [a, b].sort().join("|");

  const [threads, setThreads] = useState(loadThreads);
  useEffect(() => saveThreads(threads), [threads]);

  const activeThreadId = activeId ? threadId(currentUserId, activeId) : "";
  const msgs = threads[activeThreadId]?.messages || [];

  // ====== Send message ======
  const [text, setText] = useState("");
  const listRef = useRef(null);

  const send = () => {
    const body = text.trim();
    if (!body || !activeId) return;
    const now = Date.now();
    setThreads((prev) => {
      const next = { ...prev };
      const tid = activeThreadId;
      const cur = next[tid] || { participants: [currentUserId, activeId], messages: [] };
      cur.messages = [...cur.messages, { id: now, from: currentUserId, text: body, ts: now }];
      next[tid] = cur;
      return next;
    });
    setText("");
    // scroll to bottom after short delay
    setTimeout(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    }, 0);
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  // ====== Helpers ======
  const avatar = (u) =>
    u?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(u?.name || "U")}&background=0D8ABC&color=fff`;

  // ====== Render ======
  return (
    <>
      {/* Floating button */}
      <button
        className={`${styles.fab} ${styles[position]} ${isOpen ? styles.fabOpen : ""}`}
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-label="Toggle chat"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 4h16v12H7l-3 3V4z" fill="currentColor" />
        </svg>
        <span>Chat</span>
      </button>

      {/* Panel */}
      <div
          className={`${styles.panel} ${styles[position]} ${isOpen ? styles.open : ""}`}
          style={{ "--w": `${panelWidth}px`, "--h": `${panelHeight}px` }}
          role="dialog"
          aria-label="Chat panel"
      >
        <header className={styles.header}>
          <div className={styles.title}>
            <strong>Chat</strong>
            <span className={styles.subtitle}>
              {role === "buyer" ? "Chọn người bán để nhắn" : "Chọn khách hàng để nhắn"}
            </span>
          </div>
          <button
            className={styles.close}
            aria-label="Close chat"
            onClick={() => setIsOpen(false)}
            title="Đóng"
          >
            ×
          </button>
        </header>

        <div className={styles.body}>
          {/* Left: people list */}
          <aside className={styles.sidebar}>
            <div className={styles.search}>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={role === "buyer" ? "Tìm người bán..." : "Tìm khách hàng..."}
              />
            </div>
            <ul className={styles.people}>
              {filtered.map((p) => (
                <li
                  key={p.id}
                  className={`${styles.person} ${activeId === p.id ? styles.active : ""}`}
                  onClick={() => setActiveId(p.id)}
                >
                  <img src={avatar(p)} alt="" />
                  <div className={styles.meta}>
                    <div className={styles.name}>{p.name}</div>
                    <div className={styles.roleLabel}>{p.role === "seller" ? "Người bán" : "Khách"}</div>
                  </div>
                </li>
              ))}
              {!filtered.length && <li className={styles.empty}>Không có kết quả</li>}
            </ul>
          </aside>

          {/* Right: conversation */}
          <section className={styles.convo}>
            {!activeId ? (
              <div className={styles.placeholder}>Hãy chọn một người để bắt đầu trò chuyện.</div>
            ) : (
              <>
                <div className={styles.threadHeader}>
                  {(() => {
                    const p = people.find((x) => x.id === activeId);
                    return (
                      <>
                        <img src={avatar(p)} alt="" />
                        <div>
                          <div className={styles.name}>{p?.name}</div>
                          <div className={styles.roleLabel}>
                            {p?.role === "seller" ? "Người bán" : "Khách"}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className={styles.messages} ref={listRef}>
                  {msgs.map((m) => {
                    const mine = m.from === currentUserId;
                    return (
                      <div key={m.id} className={`${styles.msg} ${mine ? styles.mine : styles.their}`}>
                        <div className={styles.bubble}>{m.text}</div>
                        <div className={styles.time}>
                          {new Date(m.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    );
                  })}
                  {!msgs.length && (
                    <div className={styles.empty}>
                      Hãy gửi tin nhắn đầu tiên cho{" "}
                      {people.find((x) => x.id === activeId)?.name || "đối tác"}.
                    </div>
                  )}
                </div>

                <form
                  className={styles.inputRow}
                  onSubmit={(e) => {
                    e.preventDefault();
                    send();
                  }}
                >
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={onKey}
                    placeholder="Nhập tin nhắn và nhấn Enter..."
                    rows={1}
                  />
                  <button type="submit" disabled={!text.trim()}>
                    Gửi
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
