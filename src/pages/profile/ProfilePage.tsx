import { useState } from "react";

import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import SaveIcon from "@mui/icons-material/Save";
import {
    Box,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    TextField,
    Typography,
} from "@mui/material";

import { useSnackbar } from "notistack";

import { usersApi } from "@/api";
import { useAuth } from "@/contexts";

export default function ProfilePage() {
    const { user, refreshProfile, logout } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const [profile, setProfile] = useState({
        name: user?.name ?? "",
        lastName: user?.lastName ?? "",
        email: user?.email ?? "",
        address: user?.address ?? "",
    });

    const [credentials, setCredentials] = useState({
        username: "",
        newPassword: "",
        currentPassword: "",
    });

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await usersApi.updateProfile(profile);
            await refreshProfile();
            enqueueSnackbar("Profile updated.", { variant: "success" });
        } catch {
            enqueueSnackbar("Failed to update profile.", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleCredentialsUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await usersApi.updateCredentials({
                username: credentials.username || undefined,
                newPassword: credentials.newPassword || undefined,
                currentPassword: credentials.currentPassword,
            });
            enqueueSnackbar("Credentials updated.", { variant: "success" });
            setCredentials({
                username: "",
                newPassword: "",
                currentPassword: "",
            });
        } catch {
            enqueueSnackbar(
                "Failed to update credentials. Check your current password.",
                { variant: "error" },
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        setLoading(true);
        try {
            await usersApi.deleteAccount();
            logout();
        } catch {
            enqueueSnackbar(
                "Cannot delete account. You may have active or pending reservations.",
                { variant: "error" },
            );
            setDeleteDialogOpen(false);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <Box sx={{ maxWidth: 600, mx: "auto" }}>
            <Typography variant="h4" gutterBottom>
                My Profile
            </Typography>

            {/* Profile info */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Personal Information
                    </Typography>
                    <Box
                        component="form"
                        onSubmit={handleProfileUpdate}
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                        }}
                    >
                        <Box sx={{ display: "flex", gap: 2 }}>
                            <TextField
                                label="First Name"
                                fullWidth
                                value={profile.name}
                                onChange={(e) =>
                                    setProfile({
                                        ...profile,
                                        name: e.target.value,
                                    })
                                }
                            />
                            <TextField
                                label="Last Name"
                                fullWidth
                                value={profile.lastName}
                                onChange={(e) =>
                                    setProfile({
                                        ...profile,
                                        lastName: e.target.value,
                                    })
                                }
                            />
                        </Box>
                        <TextField
                            label="Email"
                            type="email"
                            value={profile.email}
                            onChange={(e) =>
                                setProfile({
                                    ...profile,
                                    email: e.target.value,
                                })
                            }
                        />
                        <TextField
                            label="Address"
                            value={profile.address}
                            onChange={(e) =>
                                setProfile({
                                    ...profile,
                                    address: e.target.value,
                                })
                            }
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            startIcon={<SaveIcon />}
                            disabled={loading}
                        >
                            Save Changes
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* Credentials */}
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Change Credentials
                    </Typography>
                    <Box
                        component="form"
                        onSubmit={handleCredentialsUpdate}
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                        }}
                    >
                        <TextField
                            label="New Username (optional)"
                            value={credentials.username}
                            onChange={(e) =>
                                setCredentials({
                                    ...credentials,
                                    username: e.target.value,
                                })
                            }
                        />
                        <TextField
                            label="New Password (optional)"
                            type="password"
                            value={credentials.newPassword}
                            onChange={(e) =>
                                setCredentials({
                                    ...credentials,
                                    newPassword: e.target.value,
                                })
                            }
                        />
                        <Divider />
                        <TextField
                            label="Current Password"
                            type="password"
                            required
                            value={credentials.currentPassword}
                            onChange={(e) =>
                                setCredentials({
                                    ...credentials,
                                    currentPassword: e.target.value,
                                })
                            }
                        />
                        <Button
                            type="submit"
                            variant="outlined"
                            disabled={loading}
                        >
                            Update Credentials
                        </Button>
                    </Box>
                </CardContent>
            </Card>
            {/* Danger Zone */}
            <Card sx={{ mt: 3, borderColor: "error.main", border: 1 }}>
                <CardContent>
                    <Typography variant="h6" color="error" gutterBottom>
                        Danger Zone
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                    >
                        Permanently delete your account and all associated data.
                        This action cannot be undone.
                    </Typography>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteForeverIcon />}
                        onClick={() => setDeleteDialogOpen(true)}
                        disabled={loading}
                    >
                        Delete Account
                    </Button>
                </CardContent>
            </Card>

            {/* Confirm delete dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Delete Account</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to permanently delete your
                        account? All your data will be removed and you will be
                        logged out immediately. This cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        color="error"
                        variant="contained"
                        onClick={handleDeleteAccount}
                        disabled={loading}
                    >
                        Yes, Delete My Account
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
