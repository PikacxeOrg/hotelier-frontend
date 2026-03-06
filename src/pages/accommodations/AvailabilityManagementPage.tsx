import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";

import { accommodationApi, availabilityApi } from "@/api";
import { LoadingScreen } from "@/components";
import { useAuth } from "@/contexts";
import type { AccommodationResponse, AvailabilityResponse } from "@/types";
import { PriceType } from "@/types";

const emptyForm = {
    fromDate: "",
    toDate: "",
    price: 0,
    priceType: PriceType.PerUnit as PriceType,
    modifiers: "" as string,
};

export default function AvailabilityManagementPage() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const [accommodation, setAccommodation] =
        useState<AccommodationResponse | null>(null);
    const [windows, setWindows] = useState<AvailabilityResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const load = async () => {
        if (!id) return;
        try {
            const [accRes, avRes] = await Promise.all([
                accommodationApi.getById(id),
                availabilityApi.getByAccommodation(id),
            ]);
            setAccommodation(accRes.data);
            setWindows(avRes.data);
        } catch {
            enqueueSnackbar("Failed to load data.", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    if (loading) return <LoadingScreen />;
    if (!accommodation)
        return <Typography>Accommodation not found.</Typography>;
    if (user?.id !== accommodation.hostId) {
        return (
            <Typography color="error">
                Only the owner can manage availability.
            </Typography>
        );
    }

    const openCreate = () => {
        setEditingId(null);
        setForm(emptyForm);
        setDialogOpen(true);
    };

    const openEdit = (w: AvailabilityResponse) => {
        setEditingId(w.id);
        setForm({
            fromDate: w.fromDate.split("T")[0],
            toDate: w.toDate.split("T")[0],
            price: w.price,
            priceType: w.priceType,
            modifiers: Object.entries(w.priceModifiers)
                .map(([k, v]) => `${k}:${v}`)
                .join(", "),
        });
        setDialogOpen(true);
    };

    const parseModifiers = (str: string): Record<string, number> => {
        const result: Record<string, number> = {};
        if (!str.trim()) return result;
        for (const part of str.split(",")) {
            const [key, val] = part.split(":").map((s) => s.trim());
            if (key && val) result[key] = parseFloat(val);
        }
        return result;
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const modifiers = parseModifiers(form.modifiers);
            if (editingId) {
                await availabilityApi.update(editingId, {
                    fromDate: form.fromDate,
                    toDate: form.toDate,
                    price: form.price,
                    priceType: form.priceType,
                    priceModifiers: modifiers,
                });
            } else {
                await availabilityApi.create({
                    accommodationId: accommodation.id,
                    fromDate: form.fromDate,
                    toDate: form.toDate,
                    price: form.price,
                    priceType: form.priceType,
                    priceModifiers: modifiers,
                });
            }
            enqueueSnackbar(
                editingId
                    ? "Availability period updated."
                    : "Availability period created.",
                { variant: "success" },
            );
            setDialogOpen(false);
            await load();
        } catch {
            enqueueSnackbar(
                editingId
                    ? "Failed to update — there may be existing reservations in this period."
                    : "Failed to create availability period.",
                { variant: "error" },
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (windowId: string) => {
        if (!confirm("Delete this availability period?")) return;
        try {
            await availabilityApi.delete(windowId);
            setWindows((prev) => prev.filter((w) => w.id !== windowId));
            enqueueSnackbar("Availability period deleted.", {
                variant: "success",
            });
        } catch {
            enqueueSnackbar(
                "Cannot delete — there may be existing reservations in this period.",
                { variant: "error" },
            );
        }
    };

    return (
        <Box sx={{ maxWidth: 800, mx: "auto" }}>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                }}
            >
                <Box>
                    <Typography variant="h4">Availability & Pricing</Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        {accommodation.name}
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={openCreate}
                >
                    Add Period
                </Button>
            </Box>

            {windows.length === 0 ? (
                <Typography color="text.secondary">
                    No availability periods defined. Add one to start accepting
                    reservations.
                </Typography>
            ) : (
                windows.map((w) => (
                    <Card key={w.id} sx={{ mb: 2 }}>
                        <CardContent
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                            }}
                        >
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="h6">
                                    {new Date(w.fromDate).toLocaleDateString()}{" "}
                                    — {new Date(w.toDate).toLocaleDateString()}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    €{w.price.toFixed(2)} / night (
                                    {w.priceType === PriceType.PerGuest
                                        ? "per guest"
                                        : "per unit"}
                                    )
                                </Typography>
                                <Box
                                    sx={{
                                        display: "flex",
                                        gap: 0.5,
                                        mt: 1,
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <Chip
                                        label={
                                            w.isAvailable
                                                ? "Available"
                                                : "Unavailable"
                                        }
                                        color={
                                            w.isAvailable
                                                ? "success"
                                                : "default"
                                        }
                                        size="small"
                                    />
                                    {Object.entries(w.priceModifiers).map(
                                        ([k, v]) => (
                                            <Chip
                                                key={k}
                                                label={`${k}: ×${v}`}
                                                size="small"
                                                variant="outlined"
                                            />
                                        ),
                                    )}
                                </Box>
                            </Box>
                            <IconButton onClick={() => openEdit(w)}>
                                <EditIcon />
                            </IconButton>
                            <IconButton
                                color="error"
                                onClick={() => handleDelete(w.id)}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </CardContent>
                    </Card>
                ))
            )}

            {/* Create / Edit Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {editingId ? "Edit Period" : "New Availability Period"}
                </DialogTitle>
                <DialogContent
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        pt: "16px !important",
                    }}
                >
                    <Box sx={{ display: "flex", gap: 2 }}>
                        <TextField
                            label="From"
                            type="date"
                            fullWidth
                            value={form.fromDate}
                            onChange={(e) =>
                                setForm({ ...form, fromDate: e.target.value })
                            }
                            slotProps={{ inputLabel: { shrink: true } }}
                        />
                        <TextField
                            label="To"
                            type="date"
                            fullWidth
                            value={form.toDate}
                            onChange={(e) =>
                                setForm({ ...form, toDate: e.target.value })
                            }
                            slotProps={{ inputLabel: { shrink: true } }}
                        />
                    </Box>
                    <Box sx={{ display: "flex", gap: 2 }}>
                        <TextField
                            label="Price per night (€)"
                            type="number"
                            fullWidth
                            value={form.price}
                            onChange={(e) =>
                                setForm({ ...form, price: +e.target.value })
                            }
                            slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Price Type</InputLabel>
                            <Select
                                value={form.priceType}
                                label="Price Type"
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        priceType: e.target.value as PriceType,
                                    })
                                }
                            >
                                <MenuItem value={PriceType.PerUnit}>
                                    Per Unit
                                </MenuItem>
                                <MenuItem value={PriceType.PerGuest}>
                                    Per Guest
                                </MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                    <TextField
                        label="Price Modifiers"
                        value={form.modifiers}
                        onChange={(e) =>
                            setForm({ ...form, modifiers: e.target.value })
                        }
                        helperText="e.g. weekend:1.2, holiday:1.5"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? "Saving…" : editingId ? "Update" : "Create"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
