import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    FormControlLabel,
    Switch,
    TextField,
    Typography,
} from "@mui/material";

import { accommodationApi } from "@/api";

export default function CreateAccommodationPage() {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: "",
        location: "",
        amenities: "" as string,
        minGuests: 1,
        maxGuests: 4,
        autoApproval: false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const { data } = await accommodationApi.create({
                name: form.name,
                location: form.location,
                amenities: form.amenities
                    .split(",")
                    .map((a) => a.trim())
                    .filter(Boolean),
                minGuests: form.minGuests,
                maxGuests: form.maxGuests,
                autoApproval: form.autoApproval,
            });
            navigate(`/accommodations/${data.id}`);
        } catch {
            setError("Failed to create accommodation.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 600, mx: "auto" }}>
            <Typography variant="h4" gutterBottom>
                New Accommodation
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Card>
                <CardContent>
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
                            label="Name"
                            required
                            value={form.name}
                            onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                            }
                        />
                        <TextField
                            label="Location"
                            required
                            value={form.location}
                            onChange={(e) =>
                                setForm({ ...form, location: e.target.value })
                            }
                        />
                        <TextField
                            label="Amenities (comma-separated)"
                            value={form.amenities}
                            onChange={(e) =>
                                setForm({ ...form, amenities: e.target.value })
                            }
                            helperText="e.g. WiFi, Kitchen, AC, Parking"
                        />
                        <Box sx={{ display: "flex", gap: 2 }}>
                            <TextField
                                label="Min Guests"
                                type="number"
                                required
                                value={form.minGuests}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        minGuests: +e.target.value,
                                    })
                                }
                                slotProps={{ htmlInput: { min: 1 } }}
                            />
                            <TextField
                                label="Max Guests"
                                type="number"
                                required
                                value={form.maxGuests}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        maxGuests: +e.target.value,
                                    })
                                }
                                slotProps={{ htmlInput: { min: 1 } }}
                            />
                        </Box>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={form.autoApproval}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            autoApproval: e.target.checked,
                                        })
                                    }
                                />
                            }
                            label="Auto-approve reservations"
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                        >
                            {loading ? "Creating…" : "Create Accommodation"}
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
