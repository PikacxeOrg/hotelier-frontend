import { useEffect, useState } from "react";

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
    IconButton,
    Link,
    Rating,
    TextField,
    Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { Link as RouterLink } from "react-router-dom";

import { accommodationApi, ratingApi } from "@/api";
import { LoadingScreen } from "@/components";
import type { RatingResponse } from "@/types";
import { RatingTargetType } from "@/types";

export default function MyReviewsPage() {
    const [reviews, setReviews] = useState<RatingResponse[]>([]);
    const [accommodationNames, setAccommodationNames] = useState<
        Record<string, string>
    >({});
    const [loading, setLoading] = useState(true);
    const { enqueueSnackbar } = useSnackbar();

    // Edit dialog state
    const [editingReview, setEditingReview] = useState<RatingResponse | null>(
        null,
    );
    const [editScore, setEditScore] = useState<number | null>(null);
    const [editComment, setEditComment] = useState("");
    const [saving, setSaving] = useState(false);

    const load = async () => {
        try {
            const { data } = await ratingApi.getMine();
            setReviews(data);

            const accommodationIds = [
                ...new Set(
                    data
                        .filter(
                            (r) =>
                                r.targetType === RatingTargetType.Accommodation,
                        )
                        .map((r) => r.targetId),
                ),
            ];

            const entries = await Promise.all(
                accommodationIds.map(async (id) => {
                    try {
                        const { data: acc } =
                            await accommodationApi.getById(id);
                        return [id, acc.name] as const;
                    } catch {
                        return [id, id] as const;
                    }
                }),
            );
            setAccommodationNames(Object.fromEntries(entries));
        } catch {
            enqueueSnackbar("Failed to load reviews.", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this review?")) return;
        try {
            await ratingApi.delete(id);
            setReviews((prev) => prev.filter((r) => r.id !== id));
            enqueueSnackbar("Review deleted.", { variant: "success" });
        } catch {
            enqueueSnackbar("Failed to delete review.", { variant: "error" });
        }
    };

    const openEdit = (r: RatingResponse) => {
        setEditingReview(r);
        setEditScore(r.score);
        setEditComment(r.comment ?? "");
    };

    const handleUpdate = async () => {
        if (!editingReview || !editScore) return;
        setSaving(true);
        try {
            const { data } = await ratingApi.update(editingReview.id, {
                score: editScore,
                comment: editComment || undefined,
            });
            setReviews((prev) =>
                prev.map((r) => (r.id === data.id ? data : r)),
            );
            setEditingReview(null);
            enqueueSnackbar("Review updated.", { variant: "success" });
        } catch {
            enqueueSnackbar("Failed to update review.", { variant: "error" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <LoadingScreen />;

    return (
        <Box sx={{ maxWidth: 800, mx: "auto" }}>
            <Typography variant="h4" gutterBottom>
                My Reviews
            </Typography>

            {reviews.length === 0 ? (
                <Typography color="text.secondary">
                    You haven&apos;t written any reviews yet.
                </Typography>
            ) : (
                reviews.map((r) => (
                    <Card key={r.id} sx={{ mb: 2 }}>
                        <CardContent
                            sx={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 2,
                            }}
                        >
                            <Box sx={{ flex: 1 }}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        mb: 0.5,
                                    }}
                                >
                                    <Rating
                                        value={r.score}
                                        size="small"
                                        readOnly
                                    />
                                    <Chip
                                        label={
                                            r.targetType ===
                                            RatingTargetType.Accommodation
                                                ? "Accommodation"
                                                : "Host"
                                        }
                                        size="small"
                                        variant="outlined"
                                    />
                                    {r.targetType ===
                                        RatingTargetType.Accommodation && (
                                        <Link
                                            component={RouterLink}
                                            to={`/accommodations/${r.targetId}`}
                                            variant="caption"
                                            underline="hover"
                                        >
                                            {accommodationNames[r.targetId] ??
                                                "View accommodation"}
                                        </Link>
                                    )}
                                </Box>
                                {r.comment && (
                                    <Typography variant="body2">
                                        {r.comment}
                                    </Typography>
                                )}
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    {new Date(
                                        r.createdTimestamp,
                                    ).toLocaleDateString()}
                                    {r.modifiedTimestamp !==
                                        r.createdTimestamp &&
                                        ` (edited ${new Date(r.modifiedTimestamp).toLocaleDateString()})`}
                                </Typography>
                            </Box>
                            <IconButton
                                size="small"
                                onClick={() => openEdit(r)}
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(r.id)}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </CardContent>
                    </Card>
                ))
            )}

            {/* Edit Dialog */}
            <Dialog
                open={!!editingReview}
                onClose={() => setEditingReview(null)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Edit Review</DialogTitle>
                <DialogContent
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        pt: "16px !important",
                    }}
                >
                    <Rating
                        value={editScore}
                        onChange={(_, v) => setEditScore(v)}
                    />
                    <TextField
                        label="Comment (optional)"
                        multiline
                        minRows={2}
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditingReview(null)}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleUpdate}
                        disabled={!editScore || saving}
                    >
                        {saving ? "Saving…" : "Update"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
