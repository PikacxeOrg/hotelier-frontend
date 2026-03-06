import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Link,
    TextField,
    Typography,
} from "@mui/material";

import { useAuth } from "@/contexts";

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await login(form);
            navigate("/");
        } catch {
            setError("Invalid username or password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 420, mx: "auto", mt: 8 }}>
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom textAlign="center">
                        Sign in
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
                                setForm({ ...form, username: e.target.value })
                            }
                        />
                        <TextField
                            label="Password"
                            type="password"
                            required
                            value={form.password}
                            onChange={(e) =>
                                setForm({ ...form, password: e.target.value })
                            }
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            fullWidth
                        >
                            {loading ? "Signing in…" : "Sign in"}
                        </Button>
                    </Box>

                    <Typography
                        variant="body2"
                        sx={{ mt: 2, textAlign: "center" }}
                    >
                        Don&apos;t have an account?{" "}
                        <Link component={RouterLink} to="/register">
                            Register
                        </Link>
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
}
