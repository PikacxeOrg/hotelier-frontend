import { useEffect, useState } from "react";

import DeleteIcon from "@mui/icons-material/Delete";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    FormControlLabel,
    IconButton,
    Switch,
    Typography,
} from "@mui/material";

import { notificationApi } from "@/api";
import { LoadingScreen } from "@/components";
import type { NotificationResponse } from "@/types";
import { useSnackbar } from "notistack";

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<NotificationResponse[]>(
        [],
    );
    const [preferences, setPreferences] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);
    const [showPrefs, setShowPrefs] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        Promise.all([
            notificationApi.getAll({ pageSize: 50 }),
            notificationApi.getPreferences(),
        ])
            .then(([notifRes, prefRes]) => {
                setNotifications(notifRes.data.items);
                setPreferences(prefRes.data.preferences);
            })
            .catch(() =>
                enqueueSnackbar("Failed to load notifications.", {
                    variant: "error",
                }),
            )
            .finally(() => setLoading(false));
    }, [enqueueSnackbar]);

    const handleMarkRead = async (id: string) => {
        try {
            await notificationApi.markAsRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
            );
        } catch {
            enqueueSnackbar("Failed to mark notification as read.", {
                variant: "error",
            });
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationApi.markAllAsRead();
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, isRead: true })),
            );
            enqueueSnackbar("All notifications marked as read.", {
                variant: "success",
            });
        } catch {
            enqueueSnackbar("Failed to mark all as read.", {
                variant: "error",
            });
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await notificationApi.delete(id);
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        } catch {
            enqueueSnackbar("Failed to delete notification.", {
                variant: "error",
            });
        }
    };

    const handlePrefChange = async (key: string, value: boolean) => {
        const updated = { ...preferences, [key]: value };
        setPreferences(updated);
        try {
            await notificationApi.updatePreferences({
                preferences: { [key]: value },
            });
            enqueueSnackbar("Preferences saved.", { variant: "success" });
        } catch {
            setPreferences((prev) => ({ ...prev, [key]: !value }));
            enqueueSnackbar("Failed to save preferences.", {
                variant: "error",
            });
        }
    };

    if (loading) return <LoadingScreen />;

    return (
        <Box>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                }}
            >
                <Typography variant="h4">Notifications</Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<DoneAllIcon />}
                        onClick={handleMarkAllRead}
                    >
                        Mark all read
                    </Button>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setShowPrefs(!showPrefs)}
                    >
                        {showPrefs ? "Hide" : "Show"} Preferences
                    </Button>
                </Box>
            </Box>

            {/* Preferences panel */}
            {showPrefs && (
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Notification Preferences
                        </Typography>
                        {Object.entries(preferences).map(([key, enabled]) => (
                            <FormControlLabel
                                key={key}
                                control={
                                    <Switch
                                        checked={enabled}
                                        onChange={(e) =>
                                            handlePrefChange(
                                                key,
                                                e.target.checked,
                                            )
                                        }
                                    />
                                }
                                label={key.replace(/([A-Z])/g, " $1").trim()}
                            />
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Notification list */}
            {notifications.length === 0 ? (
                <Typography color="text.secondary">
                    No notifications.
                </Typography>
            ) : (
                notifications.map((n) => (
                    <Card
                        key={n.id}
                        sx={{
                            mb: 1,
                            bgcolor: n.isRead ? "transparent" : "action.hover",
                            cursor: n.isRead ? "default" : "pointer",
                        }}
                        onClick={() => !n.isRead && handleMarkRead(n.id)}
                    >
                        <CardContent
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                py: 1.5,
                                "&:last-child": { pb: 1.5 },
                            }}
                        >
                            <Box sx={{ flex: 1 }}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                    }}
                                >
                                    <Chip
                                        label={n.topic}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                    />
                                    {!n.isRead && (
                                        <Chip
                                            label="New"
                                            size="small"
                                            color="info"
                                        />
                                    )}
                                </Box>
                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                    {n.message}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    {new Date(n.createdAt).toLocaleString()}
                                </Typography>
                            </Box>
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(n.id);
                                }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </CardContent>
                    </Card>
                ))
            )}
        </Box>
    );
}
