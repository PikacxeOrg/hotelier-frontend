import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    Rating,
    TextField,
    Typography,
} from "@mui/material";

import { accommodationApi, ratingApi } from "@/api";
import { LoadingScreen } from "@/components";
import { useAuth } from "@/contexts";
import { useSnackbar } from "notistack";
import type {
    AccommodationResponse,
    RatingResponse,
    RatingSummaryResponse,
} from "@/types";
import { RatingTargetType, UserType } from "@/types";

export default function AccommodationDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const [accommodation, setAccommodation] =
        useState<AccommodationResponse | null>(null);
    const [ratings, setRatings] = useState<RatingResponse[]>([]);
    const [summary, setSummary] = useState<RatingSummaryResponse | null>(null);
    const [loading, setLoading] = useState(true);

    // Review form state
    const [reviewScore, setReviewScore] = useState<number | null>(null);
    const [reviewComment, setReviewComment] = useState("");
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [reviewError, setReviewError] = useState("");

    const loadRatings = async () => {
        if (!id) return;
        try {
            const [ratRes, sumRes] = await Promise.all([
                ratingApi
                    .getByTarget(id)
                    .catch(() => ({ data: [] as RatingResponse[] })),
                ratingApi.getSummary(id).catch(() => ({ data: null })),
            ]);
            setRatings(ratRes.data);
            setSummary(sumRes.data);
        } catch {
            /* ignore */
        }
    };

    useEffect(() => {
        if (!id) return;

        Promise.all([
            accommodationApi.getById(id),
            ratingApi
                .getByTarget(id)
                .catch(() => ({ data: [] as RatingResponse[] })),
            ratingApi.getSummary(id).catch(() => ({ data: null })),
        ])
            .then(([accRes, ratRes, sumRes]) => {
                setAccommodation(accRes.data);
                setRatings(ratRes.data);
                setSummary(sumRes.data);
            })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <LoadingScreen />;
    if (!accommodation)
        return <Typography>Accommodation not found.</Typography>;

    const isOwner = user?.id === accommodation.hostId;
    const isGuest = user?.userType === UserType.Guest;
    const alreadyRated = ratings.some((r) => r.guestId === user?.id);

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reviewScore || !id) return;
        setReviewError("");
        setReviewSubmitting(true);
        try {
            await ratingApi.create({
                targetId: id,
                targetType: RatingTargetType.Accommodation,
                score: reviewScore,
                comment: reviewComment || undefined,
            });
            setReviewScore(null);
            setReviewComment("");
            await loadRatings();
            enqueueSnackbar("Review submitted. Thank you!", {
                variant: "success",
            });
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ??
                err?.response?.data ??
                "Failed to submit review.";
            setReviewError(
                typeof msg === "string"
                    ? msg
                    : "Failed to submit review. You may need a completed stay.",
            );
        } finally {
            setReviewSubmitting(false);
        }
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                {accommodation.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                {accommodation.location}
            </Typography>

            {/* Pictures placeholder */}
            {accommodation.pictures.length > 0 && (
                <Box sx={{ display: "flex", gap: 1, overflowX: "auto", mb: 3 }}>
                    {accommodation.pictures.map((pic, i) => (
                        <Box
                            key={i}
                            component="img"
                            src={pic}
                            alt={`${accommodation.name} ${i + 1}`}
                            sx={{
                                height: 200,
                                borderRadius: 2,
                                objectFit: "cover",
                            }}
                        />
                    ))}
                </Box>
            )}

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Details
                            </Typography>
                            <Typography>
                                Guests: {accommodation.minGuests}–
                                {accommodation.maxGuests}
                            </Typography>
                            <Typography>
                                Approval:{" "}
                                {accommodation.autoApproval
                                    ? "Automatic"
                                    : "Manual"}
                            </Typography>

                            <Box
                                sx={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 0.5,
                                    mt: 2,
                                }}
                            >
                                {accommodation.amenities.map((a) => (
                                    <Chip key={a} label={a} />
                                ))}
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Ratings */}
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Reviews
                                {summary && ` (${summary.totalRatings})`}
                            </Typography>

                            {summary && (
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        mb: 2,
                                    }}
                                >
                                    <Rating
                                        value={summary.averageScore}
                                        precision={0.1}
                                        readOnly
                                    />
                                    <Typography>
                                        {summary.averageScore.toFixed(1)}
                                    </Typography>
                                </Box>
                            )}

                            <Divider sx={{ mb: 2 }} />

                            {ratings.length === 0 ? (
                                <Typography color="text.secondary">
                                    No reviews yet.
                                </Typography>
                            ) : (
                                ratings.map((r) => (
                                    <Box key={r.id} sx={{ mb: 2 }}>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1,
                                            }}
                                        >
                                            <Rating
                                                value={r.score}
                                                size="small"
                                                readOnly
                                            />
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                by {r.guestId.slice(0, 8)}
                                            </Typography>
                                        </Box>
                                        {r.comment && (
                                            <Typography
                                                variant="body2"
                                                sx={{ mt: 0.5 }}
                                            >
                                                {r.comment}
                                            </Typography>
                                        )}
                                    </Box>
                                ))
                            )}

                            {/* Write a review */}
                            {isGuest && !isOwner && !alreadyRated && (
                                <>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography
                                        variant="subtitle2"
                                        gutterBottom
                                    >
                                        Leave a Review
                                    </Typography>
                                    {reviewError && (
                                        <Alert severity="error" sx={{ mb: 1 }}>
                                            {reviewError}
                                        </Alert>
                                    )}
                                    <Box
                                        component="form"
                                        onSubmit={handleSubmitReview}
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 1,
                                        }}
                                    >
                                        <Rating
                                            value={reviewScore}
                                            onChange={(_, v) =>
                                                setReviewScore(v)
                                            }
                                        />
                                        <TextField
                                            label="Comment (optional)"
                                            multiline
                                            minRows={2}
                                            value={reviewComment}
                                            onChange={(e) =>
                                                setReviewComment(e.target.value)
                                            }
                                            size="small"
                                        />
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            size="small"
                                            disabled={
                                                !reviewScore || reviewSubmitting
                                            }
                                            sx={{ alignSelf: "flex-start" }}
                                        >
                                            {reviewSubmitting
                                                ? "Submitting…"
                                                : "Submit Review"}
                                        </Button>
                                    </Box>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Side panel */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card>
                        <CardContent
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                            }}
                        >
                            {!isOwner && user && (
                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={() =>
                                        navigate(
                                            `/reservations/new?accommodationId=${accommodation.id}`,
                                        )
                                    }
                                >
                                    Reserve
                                </Button>
                            )}

                            {isOwner && (
                                <>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        onClick={() =>
                                            navigate(
                                                `/accommodations/${accommodation.id}/edit`,
                                            )
                                        }
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        onClick={() =>
                                            navigate(
                                                `/accommodations/${accommodation.id}/availability`,
                                            )
                                        }
                                    >
                                        Manage Availability
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
