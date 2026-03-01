import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    FormControl,
    InputLabel,
    Link,
    MenuItem,
    Select,
    TextField,
    Typography,
} from "@mui/material";

import { useAuth } from "@/contexts";
import { UserType } from "@/types";

export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        username: "",
        password: "",
        confirmPassword: "",
        name: "",
        lastName: "",
        email: "",
        address: "",
        userType: UserType.Guest,
    });

    const handleChange = (field: string, value: string | number) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            await register({
                username: form.username,
                password: form.password,
                name: form.name,
                lastName: form.lastName,
                email: form.email,
                address: form.address,
                userType: form.userType,
            });
            navigate("/");
        } catch {
            setError(
                "Registration failed. Username or email may already be taken.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 480, mx: "auto", mt: 6 }}>
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom textAlign="center">
                        Create Account
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                        }}
                    >
                        <TextField
                            label="Username"
                            required
                            value={form.username}
                            onChange={(e) =>
                                handleChange("username", e.target.value)
                            }
                        />
                        <TextField
                            label="Email"
                            type="email"
                            required
                            value={form.email}
                            onChange={(e) =>
                                handleChange("email", e.target.value)
                            }
                        />
                        <Box sx={{ display: "flex", gap: 2 }}>
                            <TextField
                                label="First Name"
                                required
                                fullWidth
                                value={form.name}
                                onChange={(e) =>
                                    handleChange("name", e.target.value)
                                }
                            />
                            <TextField
                                label="Last Name"
                                required
                                fullWidth
                                value={form.lastName}
                                onChange={(e) =>
                                    handleChange("lastName", e.target.value)
                                }
                            />
                        </Box>
                        <TextField
                            label="Address"
                            required
                            value={form.address}
                            onChange={(e) =>
                                handleChange("address", e.target.value)
                            }
                        />
                        <Box sx={{ display: "flex", gap: 2 }}>
                            <TextField
                                label="Password"
                                type="password"
                                required
                                fullWidth
                                value={form.password}
                                onChange={(e) =>
                                    handleChange("password", e.target.value)
                                }
                            />
                            <TextField
                                label="Confirm Password"
                                type="password"
                                required
                                fullWidth
                                value={form.confirmPassword}
                                onChange={(e) =>
                                    handleChange(
                                        "confirmPassword",
                                        e.target.value,
                                    )
                                }
                            />
                        </Box>

                        <FormControl size="small">
                            <InputLabel>I am a</InputLabel>
                            <Select
                                value={form.userType}
                                label="I am a"
                                onChange={(e) =>
                                    handleChange("userType", e.target.value)
                                }
                            >
                                <MenuItem value={UserType.Guest}>
                                    Guest
                                </MenuItem>
                                <MenuItem value={UserType.Host}>Host</MenuItem>
                            </Select>
                        </FormControl>

                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            fullWidth
                        >
                            {loading ? "Creating account…" : "Register"}
                        </Button>
                    </Box>

                    <Typography
                        variant="body2"
                        sx={{ mt: 2, textAlign: "center" }}
                    >
                        Already have an account?{" "}
                        <Link component={RouterLink} to="/login">
                            Sign in
                        </Link>
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
}
