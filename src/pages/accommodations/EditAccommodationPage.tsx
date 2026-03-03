import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    Box,
    Button,
    Card,
    CardContent,
    FormControlLabel,
    Switch,
    TextField,
    Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";

import { accommodationApi } from "@/api";
import ImageUpload from "@/components/ImageUpload";
import { LoadingScreen } from "@/components";
import { useAuth } from "@/contexts";
import type { AccommodationResponse } from "@/types";

export default function EditAccommodationPage() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const [accommodation, setAccommodation] =
        useState<AccommodationResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        name: "",
        location: "",
        amenities: "",
        minGuests: 1,
        maxGuests: 4,
        autoApproval: false,
    });
    const [pictures, setPictures] = useState<string[]>([]);

    useEffect(() => {
        if (!id) return;
        accommodationApi
            .getById(id)
            .then(({ data }) => {
                setAccommodation(data);
                setForm({
                    name: data.name,
                    location: data.location,
                    amenities: data.amenities.join(", "),
                    minGuests: data.minGuests,
                    maxGuests: data.maxGuests,
                    autoApproval: data.autoApproval,
                });
                setPictures(data.pictures);
            })
            .catch(() =>
                enqueueSnackbar("Failed to load accommodation.", {
                    variant: "error",
                }),
            )
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <LoadingScreen />;
    if (!accommodation)
        return <Typography>Accommodation not found.</Typography>;
    if (user?.id !== accommodation.hostId) {
        return (
            <Typography color="error">
                You can only edit your own accommodations.
            </Typography>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await accommodationApi.update(accommodation.id, {
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
            enqueueSnackbar("Accommodation saved.", { variant: "success" });
            navigate(`/accommodations/${accommodation.id}`);
        } catch {
            enqueueSnackbar("Failed to update accommodation.", {
                variant: "error",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this accommodation?"))
            return;
        try {
            await accommodationApi.delete(accommodation.id);
            enqueueSnackbar("Accommodation deleted.", { variant: "success" });
            navigate("/my-accommodations");
        } catch {
            enqueueSnackbar("Failed to delete accommodation.", {
                variant: "error",
            });
        }
    };

    return (
        <Box sx={{ maxWidth: 600, mx: "auto" }}>
            <Typography variant="h4" gutterBottom>
                Edit Accommodation
            </Typography>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <ImageUpload
                        entityId={accommodation.id}
                        pictures={pictures}
                        onPicturesChange={setPictures}
                    />
                </CardContent>
            </Card>

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
                        <Box sx={{ display: "flex", gap: 2 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={saving}
                                sx={{ flex: 1 }}
                            >
                                {saving ? "Saving…" : "Save Changes"}
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={handleDelete}
                            >
                                Delete
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
