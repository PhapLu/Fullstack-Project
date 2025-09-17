// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Truong Gia Hy
// ID: S4053650

import { useState, useEffect, useRef, useMemo } from "react";
import styles from "./ChatToggle.module.scss";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, clearUnseen } from "../../store/slices/authSlices";
import { getSocket } from "../../utils/socketClient";
import { apiUtils } from "../../utils/newRequest";
import { getImageUrl } from "../../utils/imageUrl";

export default function ChatToggle({
    currentUserId,
    role = "buyer",
    defaultOpen = false,
    position = "br",
    panelWidth = 380,
    panelHeight = 520,
    persistKey = "chat_toggle_open",
}) {
    const userInfo = useSelector(selectUser);
    const socket = getSocket();
    const dispatch = useDispatch();

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
            console.log(e);
        }
    }, [isOpen]);

    // ====== Conversations ======
    const [conversations, setConversations] = useState([]);
    const [activeConvId, setActiveConvId] = useState(null);
    const [activeMessages, setActiveMessages] = useState([]);

    const conversationsRef = useRef(conversations);
    useEffect(() => {
        conversationsRef.current = conversations;
    }, [conversations]);

    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [activeMessages]);

    useEffect(() => {
        const handler = (e) => {
            const other = e.detail?.otherUser;
            console.log(
                "🔥 [ChatToggle] openChatWith event received:",
                e.detail
            );
            if (!other || !currentUserId) {
                console.log(
                    "❌ [ChatToggle] Missing 'otherUser' or 'currentUserId'"
                );
                return;
            }

            const currentConvos = conversationsRef.current;

            const exists = currentConvos.find((c) =>
                (c.members || [])
                    .map((m) => m.user?._id?.toString() || m._id?.toString())
                    .includes(other?._id?.toString())
            );

            if (exists) {
                console.log('ALO')
                setActiveConvId(exists._id);
            } else {
                console.log('ALO2')
                console.log(other)
                const tempId = `temp_${other._id}`;
                const ghostConv = {
                    _id: tempId,
                    isTemp: true,
                    lastMessage: null,
                    members: [
                        { user: { _id: currentUserId } },
                        { user: other }, // full object, including role + profile
                    ],
                    thumbnail: other.avatar,
                    title:
                        (other.role === "vendor" && (other.vendorProfile?.businessName || other.name)) ||
                        (other.role === "customer" && (other.customerProfile?.name || other.name)) ||
                        other.name ||
                        "Unknown",

                };
                setConversations((prev) => {
                    if (prev.some((c) => c._id === tempId)) return prev;
                    return [ghostConv, ...prev];
                });

                setActiveConvId(tempId);
                setActiveMessages([]);
            }

            setIsOpen(true); // ✅ Open the panel
        };

        window.addEventListener("openChatWith", handler);
        console.log("👂 [ChatToggle] Listening to openChatWith event");

        return () => {
            window.removeEventListener("openChatWith", handler);
        };
    }, [currentUserId]);

    const fetchActiveConversation = async () => {
        if (!activeConvId) return;
        try {
            const { data } = await apiUtils.get(
                `/conversation/readConversation/${activeConvId}`
            );
            const conv = data?.metadata?.conversation;

            if (!conv?._id) {
                console.warn("Conversation not found in response:", data);
                return;
            }

            setConversations((prev) =>
                prev.map((c) => (c._id === conv._id ? { ...c, ...conv } : c))
            );
            setActiveMessages(conv.messages || []);
        } catch (err) {
            console.error("Failed to load full conversation:", err);
        }
    };

    useEffect(() => {
        if (!activeConvId?.startsWith("temp_")) {
            fetchActiveConversation();
        } else {
            // temp conversation: no fetch, just clear messages
            setActiveMessages([]);
        }
    }, [activeConvId]);

    useEffect(() => {
        if (isOpen) {
            console.log("Chat panel opened, fetching conversations...");
            const fetchConversations = async () => {
                try {
                    const { data } = await apiUtils.get(
                        "/conversation/readConversations"
                    );
                    const fetched = data?.metadata?.conversations || [];

                    setConversations((prev) => {
                        const ghosts = prev.filter((c) => c.isTemp);
                        const existingIds = new Set(fetched.map((c) => c._id));
                        const merged = [
                            ...ghosts.filter((g) => !existingIds.has(g._id)),
                            ...fetched,
                        ];
                        return merged;
                    });

                    // Select first one if none selected
                    if (fetched.length > 0 && !activeConvId) {
                        setActiveConvId(fetched[0]._id);
                    }
                } catch (err) {
                    console.error("Failed to load conversations:", err);
                }
            };

            fetchConversations();
        }
    }, [currentUserId, isOpen]); // ✅ rerun every time panel opens

    const activeConversation = conversations.find(
        (c) => c._id === activeConvId
    );

    const listRef = useRef(null);
    const [text, setText] = useState("");

    // ====== Normalize message ======
    const normalizeMsg = (m, fallbackFrom = null) => {
        const ts = m?.createdAt
            ? new Date(m.createdAt).getTime()
            : m?.ts
            ? m.ts
            : Date.now();
        return {
            id: m?._id || m?.id || Date.now(),
            from: m?.senderId || m?.from || fallbackFrom,
            text: m?.content || m?.text || "",
            ts,
            pending: !!m?.pending,
        };
    };

    // ====== Socket wiring ======
    useEffect(() => {
        if (!socket || !currentUserId) return;

        socket.onmessage = (event) => {
            try {
                const { event: evt, data } = JSON.parse(event.data);

                if (evt === "getMessage") {
                    const { conversationId, message } = data;
                    console.log("📥 [WS] getMessage received", data);

                    // ✅ Update conversation list
                    setConversations((prev) =>
                        prev.map((c) => {
                            if (c._id !== conversationId) return c;
                            const updated = {
                                ...c,
                                lastMessage: normalizeMsg(message),
                            };
                            if (Array.isArray(c.messages)) {
                                updated.messages = [
                                    ...c.messages,
                                    normalizeMsg(message),
                                ];
                            }
                            return updated;
                        })
                    );

                    // ✅ Also update activeMessages if this is the active conversation
                    if (activeConvId === conversationId) {
                        setActiveMessages((prev) => [
                            ...prev,
                            normalizeMsg(message),
                        ]);
                    }
                }

                if (evt === "messagesSeen") {
                    console.log("✅ [WS] messagesSeen received:", data);
                    // optionally update local seen state here
                }
            } catch (err) {
                console.error("❌ [WS] Failed to parse incoming message:", err);
            }
        };

        return () => {
            socket.onmessage = null;
        };
    }, [socket, currentUserId]);

    useEffect(() => {
        if (activeConvId && socket) {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(
                    JSON.stringify({
                        event: "messageSeen",
                        data: { conversationId: activeConvId },
                    })
                );
            } else {
                console.warn(
                    "⛔ Tried to send messageSeen but socket is not OPEN"
                );
            }

            dispatch(clearUnseen());
        }
    }, [activeConvId, socket, dispatch]);

    function getDisplayName(conversation, currentUserId) {
        const other = (conversation.members || [])
            .map((m) => m.user || m)
            .find((u) => u._id?.toString() !== currentUserId?.toString());
        if (!other) return "Unknown";

        if (other.role === "vendor") {
            return other.vendorProfile?.businessName || other.name || "Vendor";
        }
        if (other.role === "customer") {
            return other.customerProfile?.name || other.name || "Customer";
        }
        return other.name || "User";
    }

    // ====== Send message ======
    const send = async () => {
        const body = text.trim();
        if (!body || !activeConvId) return;
        setText("");

        const now = Date.now();

          const optimisticMessage = {
            _id: now,
            senderId: currentUserId,
            content: body,
            createdAt: now,
            pending: true,
          };
          setActiveMessages((prev) => [...prev, optimisticMessage]);

        const isTemp = activeConvId?.startsWith("temp_");

        try {
            const { data } = await apiUtils.patch("/conversation/sendMessage", {
                conversationId: isTemp ? null : activeConvId,
                otherUserId: activeConversation?.otherMember?._id,
                content: body,
            });

            const { conversationId, newMessage, conversation } = data.metadata;

            if (isTemp) {
                setConversations((prev) => {
                    const filtered = prev.filter((c) => c._id !== activeConvId);
                    return [
                        {
                            ...conversation,
                            lastMessage: normalizeMsg(newMessage),
                        },
                        ...filtered,
                    ];
                });
                setActiveConvId(conversationId);
            } else {
                setConversations((prev) =>
                    prev.map((c) =>
                        c._id === conversationId
                            ? {
                                  ...c,
                                  lastMessage: normalizeMsg(newMessage),
                                  messages: [
                                      ...(c.messages || []),
                                      normalizeMsg(newMessage),
                                  ],
                              }
                            : c
                    )
                );
            }

            // Replace pending message
            setActiveMessages((prev) => [
                ...prev.filter((m) => !m.pending),
                normalizeMsg(newMessage),
            ]);

            // ====== ✅ WebSocket Send (Native ws) ======
            const receiverId = (activeConversation?.members || [])
                .map((m) => m.user || m)
                .find(
                    (u) => u._id?.toString() !== currentUserId?.toString()
                )?._id;

            if (socket?.readyState === WebSocket.OPEN) {
                socket.send(
                    JSON.stringify({
                        event: "sendMessage",
                        data: {
                            conversationId,
                            receiverId,
                            content: body,
                        },
                    })
                );
            } else {
                console.warn("❌ Socket not open. Message not sent.");
            }
        } catch (err) {
            console.error("❌ Send failed", err);
            // Optionally rollback pending message
        }
    };

    const onKey = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    return (
        <>
            {/* Floating button */}
            <button
                className={`${styles.fab} ${styles[position]} ${
                    isOpen ? styles.fabOpen : ""
                }`}
                onClick={() => setIsOpen((v) => !v)}
                aria-expanded={isOpen}
                aria-label="Toggle chat"
            >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path d="M4 4h16v12H7l-3 3V4z" fill="currentColor" />
                </svg>
                <span>Chat</span>
            </button>

            {/* Panel */}
            <div
                className={`${styles.panel} ${styles[position]} ${
                    isOpen ? styles.open : ""
                }`}
                style={{ "--w": `${panelWidth}px`, "--h": `${panelHeight}px` }}
                role="dialog"
                aria-label="Chat panel"
            >
                <header className={styles.header}>
                    <div className={styles.title}>
                        <strong>Chat</strong>
                        <span className={styles.subtitle}>
                            {role === "customer"
                                ? "Select a vendor to chat"
                                : "Select a customer to chat"}
                        </span>
                    </div>
                    <button
                        className={styles.close}
                        aria-label="Close chat"
                        onClick={() => setIsOpen(false)}
                    >
                        ✕
                    </button>
                </header>

                <div className={styles.body}>
                    {/* Sidebar */}
                    <aside className={styles.sidebar}>
                        <ul className={styles.people}>
                            {conversations.map((c) => (
                                <li
                                    key={c?._id}
                                    className={`${styles.person} ${
                                        activeConvId === c?._id
                                            ? styles.active
                                            : ""
                                    }`}
                                    onClick={() => setActiveConvId(c?._id)}
                                >
                                    <img
                                        src={getImageUrl(c.thumbnail)}
                                        alt=""
                                    />
                                    <div className={styles.meta}>
                                        <div className={styles.name}>
                                            {getDisplayName(c, currentUserId)}
                                        </div>
                                        <div className={styles.lastMessage}>
                                            {c.lastMessage?.text ||
                                                c.lastMessage?.content ||
                                                "No messages yet"}
                                        </div>
                                    </div>
                                </li>
                            ))}
                            {!conversations.length && (
                                <li className={styles.empty}>
                                    No conversations
                                </li>
                            )}
                        </ul>
                    </aside>

                    {/* Conversation */}
                    <section className={styles.convo}>
                        {!activeConversation ? (
                            <div className={styles.placeholder}>
                                Please select a conversation to start chatting.
                            </div>
                        ) : (
                            <>
                                <div className={styles.threadHeader}>
                                    <img
                                        src={getImageUrl(
                                            activeConversation.thumbnail
                                        )}
                                        alt=""
                                    />
                                    <div>
                                        <div className={styles.name}>
                                            {activeConversation.title ||
                                                "Unknown user"}
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.messages} ref={listRef}>
                                    {activeMessages.map((msg) => {
                                        const normalized = normalizeMsg(msg, currentUserId);
                                        const myId = currentUserId?.toString?.() ?? String(currentUserId ?? "");
                                        const fromRaw = normalized.from;
                                        const fromId =
                                          typeof fromRaw === "object"
                                            ? fromRaw?._id?.toString?.() ?? ""
                                            : fromRaw?.toString?.() ?? "";
                                        const isMine = fromId === myId;

                                        return (
                                            <div
                                                key={normalized.id}
                                                className={`${styles.msg} ${
                                                    isMine
                                                        ? styles.mine
                                                        : styles.their
                                                }`}
                                            >
                                                <div className={styles.bubble}>
                                                    {normalized.text}
                                                </div>
                                                <div className={styles.time}>
                                                    {new Date(
                                                        normalized.ts
                                                    ).toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
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
                                        onChange={(e) =>
                                            setText(e.target.value)
                                        }
                                        onKeyDown={onKey}
                                        placeholder="Type a message and press Enter..."
                                        rows={1}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!text.trim()}
                                    >
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
