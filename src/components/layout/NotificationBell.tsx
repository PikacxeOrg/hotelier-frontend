import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import NotificationsIcon from "@mui/icons-material/Notifications";
import { Badge, IconButton, Tooltip } from "@mui/material";

import { notificationApi } from "@/api";
import { useAuth } from "@/contexts";

const SSE_URL = "/api/notifications/stream";

/**
 * Shows the unread notification count.
 * Connects via Server-Sent Events for real-time updates;
 * falls back to a 60-second poll when SSE is unavailable.
 */
export default function NotificationBell() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [count, setCount] = useState(0);
    const esRef = useRef<EventSource | null>(null);
    const fallbackRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const fetchCount = useCallback(async () => {
        try {
            const { data } = await notificationApi.getUnreadCount();
            setCount(data.unreadCount);
        } catch {
            /* silent */
        }
    }, []);

    useEffect(() => {
        if (!isAuthenticated) {
            return;
        }

        // Initial count
        fetchCount(); // eslint-disable-line react-hooks/set-state-in-effect

        // --- SSE connection ---
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const url = `${SSE_URL}?access_token=${encodeURIComponent(token)}`;
        const es = new EventSource(url);
        esRef.current = es;

        es.onmessage = () => {
            // A new notification arrived – re-fetch for accuracy
            fetchCount();
        };

        es.onerror = () => {
            // SSE failed (token expired, network error, etc.)
            // Start a 60-s fallback poll so the count stays fresh
            if (!fallbackRef.current) {
                fallbackRef.current = setInterval(fetchCount, 60_000);
            }
        };

        es.onopen = () => {
            // SSE reconnected – cancel the fallback poll
            if (fallbackRef.current) {
                clearInterval(fallbackRef.current);
                fallbackRef.current = null;
            }
        };

        return () => {
            es.close();
            esRef.current = null;
            if (fallbackRef.current) {
                clearInterval(fallbackRef.current);
                fallbackRef.current = null;
            }
        };
    }, [isAuthenticated, fetchCount]);

    return (
        <Tooltip title="Notifications">
            <IconButton
                color="inherit"
                onClick={() => navigate("/notifications")}
            >
                <Badge badgeContent={isAuthenticated ? count : 0} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>
        </Tooltip>
    );
}
