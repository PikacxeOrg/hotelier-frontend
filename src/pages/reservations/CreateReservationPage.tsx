import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    TextField,
    Typography,
} from "@mui/material";

import { accommodationApi, reservationApi } from "@/api";
import { LoadingScreen } from "@/components";
import type { AccommodationResponse } from "@/types";

export default function CreateReservationPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const accommodationId = searchParams.get("accommodationId") ?? "";

    const [accommodation, setAccommodation] =
        useState<AccommodationResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        fromDate: "",
        toDate: "",
        numOfGuests: 1,
    });

    useEffect(() => {
        if (!accommodationId) {
            setLoading(false);
            return;
        }
        accommodationApi
            .getById(accommodationId)
            .then(({ data }) => {
                setAccommodation(data);
                setForm((f) => ({ ...f, numOfGuests: data.minGuests }));
            })
            .catch(() => setError("Accommodation not found."))
            .finally(() => setLoading(false));
    }, [accommodationId]);

    if (loading) return <LoadingScreen />;
    if (!accommodation) {
        return (
            <Box sx={{ maxWidth: 600, mx: "auto" }}>
                <Alert severity="error">
                    No accommodation specified. Please select an accommodation
                    first.
                </Alert>
            </Box>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            await reservationApi.create({
                accommodationId: accommodation.id,
                fromDate: form.fromDate,
                toDate: form.toDate,
                numOfGuests: form.numOfGuests,
            });
            navigate("/my-reservations");
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ??
                err?.response?.data ??
                "Failed to create reservation.";
            setError(
                typeof msg === "string" ? msg : "Failed to create reservation.",
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 600, mx: "auto" }}>
            <Typography variant="h4" gutterBottom>
                Book: {accommodation.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
                {accommodation.location} · {accommodation.minGuests}–
                {accommodation.maxGuests} guests
                {accommodation.autoApproval ? " · Auto-approved" : ""}
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
                        <Box sx={{ display: "flex", gap: 2 }}>
                            <TextField
                                label="Check-in"
                                type="date"
                                required
                                fullWidth
                                value={form.fromDate}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        fromDate: e.target.value,
                                    })
                                }
                                slotProps={{ inputLabel: { shrink: true } }}
                            />
                            <TextField
                                label="Check-out"
                                type="date"
                                required
                                fullWidth
                                value={form.toDate}
                                onChange={(e) =>
                                    setForm({ ...form, toDate: e.target.value })
                                }
                                slotProps={{ inputLabel: { shrink: true } }}
                            />
                        </Box>
                        <TextField
                            label="Number of Guests"
                            type="number"
                            required
                            value={form.numOfGuests}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    numOfGuests: +e.target.value,
                                })
                            }
                            slotProps={{
                                htmlInput: {
                                    min: accommodation.minGuests,
                                    max: accommodation.maxGuests,
                                },
                            }}
                            helperText={`Min: ${accommodation.minGuests}, Max: ${accommodation.maxGuests}`}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={submitting}
                        >
                            {submitting ? "Submitting…" : "Request Reservation"}
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
