import { useState } from "react";

import SaveIcon from "@mui/icons-material/Save";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    TextField,
    Typography,
} from "@mui/material";

import { usersApi } from "@/api";
import { useAuth } from "@/contexts";

export default function ProfilePage() {
    const { user, refreshProfile } = useAuth();
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

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
        setError("");
        setSuccess("");
        setLoading(true);
        try {
            await usersApi.updateProfile(profile);
            await refreshProfile();
            setSuccess("Profile updated.");
        } catch {
            setError("Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    const handleCredentialsUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);
        try {
            await usersApi.updateCredentials({
                username: credentials.username || undefined,
                newPassword: credentials.newPassword || undefined,
                currentPassword: credentials.currentPassword,
            });
            setSuccess("Credentials updated.");
            setCredentials({
                username: "",
                newPassword: "",
                currentPassword: "",
            });
        } catch {
            setError(
                "Failed to update credentials. Check your current password.",
            );
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

            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                </Alert>
            )}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

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
        </Box>
    );
}
