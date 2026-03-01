import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import NotificationsIcon from "@mui/icons-material/Notifications";
import { Badge, IconButton, Tooltip } from "@mui/material";

import { notificationApi } from "@/api";
import { useAuth } from "@/contexts";

/** Polls for unread notification count every 30 s. */
export default function NotificationBell() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!isAuthenticated) return;

        const fetch = async () => {
            try {
                const { data } = await notificationApi.getUnreadCount();
                setCount(data.unreadCount);
            } catch {
                /* silent */
            }
        };

        fetch();
        const id = setInterval(fetch, 30_000);
        return () => clearInterval(id);
    }, [isAuthenticated]);

    return (
        <Tooltip title="Notifications">
            <IconButton
                color="inherit"
                onClick={() => navigate("/notifications")}
            >
                <Badge badgeContent={count} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>
        </Tooltip>
    );
}
