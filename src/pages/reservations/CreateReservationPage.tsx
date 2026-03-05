import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";

import { accommodationApi, availabilityApi, reservationApi } from "@/api";
import { LoadingScreen } from "@/components";
import { useAuth } from "@/contexts";
import type { AccommodationResponse, AvailabilityResponse } from "@/types";
import { PriceType, UserType } from "@/types";

export default function CreateReservationPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { enqueueSnackbar } = useSnackbar();
    const { user } = useAuth();
    const accommodationId = searchParams.get("accommodationId") ?? "";

    // Hosts are not allowed to make reservations
    if (user?.userType === UserType.Host) {
        return (
            <Box sx={{ maxWidth: 680, mx: "auto" }}>
                <Alert severity="error">
                    Hosts cannot make reservations. Please use a guest account
                    to book accommodations.
                </Alert>
                <Button sx={{ mt: 2 }} onClick={() => navigate("/")}>
                    Back to Home
                </Button>
            </Box>
        );
    }

    const [accommodation, setAccommodation] =
        useState<AccommodationResponse | null>(null);
    const [windows, setWindows] = useState<AvailabilityResponse[]>([]);
    const [bookedRanges, setBookedRanges] = useState<
        { fromDate: string; toDate: string }[]
    >([]);
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
        Promise.all([
            accommodationApi.getById(accommodationId),
            availabilityApi.getByAccommodation(accommodationId, true),
            reservationApi.getBookedRanges(accommodationId),
        ])
            .then(([accRes, avRes, bookedRes]) => {
                setAccommodation(accRes.data);
                setWindows(avRes.data);
                setBookedRanges(bookedRes.data);
                setForm((f) => ({ ...f, numOfGuests: accRes.data.minGuests }));
            })
            .catch(() => setError("Failed to load accommodation."))
            .finally(() => setLoading(false));
    }, [accommodationId]);

    if (loading) return <LoadingScreen />;
    if (!accommodation) {
        return (
            <Box sx={{ maxWidth: 680, mx: "auto" }}>
                <Alert severity="error">
                    No accommodation specified. Please select an accommodation
                    first.
                </Alert>
            </Box>
        );
    }

    const isWindowBooked = (w: AvailabilityResponse): boolean =>
        bookedRanges.some((b) => {
            const bFrom = b.fromDate.split("T")[0];
            const bTo = b.toDate.split("T")[0];
            const wFrom = w.fromDate.split("T")[0];
            const wTo = w.toDate.split("T")[0];
            return bFrom < wTo && bTo > wFrom;
        });

    const handleSelectWindow = (w: AvailabilityResponse) => {
        setForm((f) => ({
            ...f,
            fromDate: w.fromDate.split("T")[0],
            toDate: w.toDate.split("T")[0],
        }));
    };

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
            enqueueSnackbar("Reservation request submitted!", {
                variant: "success",
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

    const nights =
        form.fromDate && form.toDate
            ? Math.max(
                  0,
                  (new Date(form.toDate).getTime() -
                      new Date(form.fromDate).getTime()) /
                      86_400_000,
              )
            : 0;

    const matchingWindow =
        form.fromDate && form.toDate
            ? windows.find(
                  (w) =>
                      w.fromDate.split("T")[0] <= form.fromDate &&
                      w.toDate.split("T")[0] >= form.toDate,
              )
            : null;

    return (
        <Box sx={{ maxWidth: 680, mx: "auto" }}>
            <Typography variant="h4" gutterBottom>
                Book: {accommodation.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
                {accommodation.location} · {accommodation.minGuests}–
                {accommodation.maxGuests} guests
                {accommodation.autoApproval ? " · Auto-approved" : ""}
            </Typography>

            {/* Available windows */}
            {windows.length > 0 && (
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                mb: 1.5,
                            }}
                        >
                            <EventAvailableIcon color="success" />
                            <Typography variant="h6">
                                Available Periods
                            </Typography>
                        </Box>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1.5 }}
                        >
                            Click a row to pre-fill the dates below.
                        </Typography>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Check-in</TableCell>
                                    <TableCell>Check-out</TableCell>
                                    <TableCell>Price / night</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {windows.map((w) => {
                                    const booked = isWindowBooked(w);
                                    return (
                                        <TableRow
                                            key={w.id}
                                            hover={!booked}
                                            sx={{
                                                cursor: booked
                                                    ? "default"
                                                    : "pointer",
                                                opacity: booked ? 0.55 : 1,
                                            }}
                                            onClick={() =>
                                                !booked &&
                                                handleSelectWindow(w)
                                            }
                                            selected={
                                                !booked &&
                                                form.fromDate ===
                                                    w.fromDate.split("T")[0] &&
                                                form.toDate ===
                                                    w.toDate.split("T")[0]
                                            }
                                        >
                                            <TableCell>
                                                {new Date(
                                                    w.fromDate,
                                                ).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(
                                                    w.toDate,
                                                ).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                €{w.price.toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={
                                                        w.priceType ===
                                                        PriceType.PerGuest
                                                            ? "Per guest"
                                                            : "Per unit"
                                                    }
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={
                                                        booked
                                                            ? "Reserved"
                                                            : "Available"
                                                    }
                                                    color={
                                                        booked
                                                            ? "error"
                                                            : "success"
                                                    }
                                                    size="small"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {windows.length === 0 && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    No availability periods are currently defined for this
                    accommodation.
                </Alert>
            )}

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

                        {/* Price estimate */}
                        {matchingWindow && nights > 0 && (
                            <>
                                <Divider />
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        €{matchingWindow.price.toFixed(2)} ×{" "}
                                        {nights} night{nights !== 1 ? "s" : ""}
                                        {matchingWindow.priceType ===
                                            PriceType.PerGuest &&
                                            ` × ${form.numOfGuests} guests`}
                                    </Typography>
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight={700}
                                    >
                                        €
                                        {(
                                            matchingWindow.price *
                                            nights *
                                            (matchingWindow.priceType ===
                                            PriceType.PerGuest
                                                ? form.numOfGuests
                                                : 1)
                                        ).toFixed(2)}
                                    </Typography>
                                </Box>
                            </>
                        )}

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
