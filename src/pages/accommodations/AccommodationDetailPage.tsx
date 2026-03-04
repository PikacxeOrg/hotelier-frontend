import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CloseIcon from "@mui/icons-material/Close";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogContent,
    Divider,
    Grid,
    IconButton,
    Rating,
    TextField,
    Typography,
} from "@mui/material";

import { accommodationApi, ratingApi, usersApi } from "@/api";
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
    const [guestNames, setGuestNames] = useState<Record<string, string>>({});

    // Review form state
    const [reviewScore, setReviewScore] = useState<number | null>(null);
    const [reviewComment, setReviewComment] = useState("");
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [reviewError, setReviewError] = useState("");

    // Gallery state
    const [activePhoto, setActivePhoto] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    };
    const lightboxPrev = () =>
        setLightboxIndex(
            (i) =>
                (i - 1 + (accommodation?.pictures.length ?? 1)) %
                (accommodation?.pictures.length ?? 1),
        );
    const lightboxNext = () =>
        setLightboxIndex(
            (i) => (i + 1) % (accommodation?.pictures.length ?? 1),
        );

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
            // Fetch reviewer names
            const ids = [...new Set(ratRes.data.map((r) => r.guestId))];
            const entries = await Promise.all(
                ids.map((gid) =>
                    usersApi
                        .getById(gid)
                        .then(({ data }) => [gid, data.username] as const)
                        .catch(() => [gid, gid.slice(0, 8)] as const),
                ),
            );
            setGuestNames(Object.fromEntries(entries));
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
                // Fetch reviewer names
                const ids = [...new Set(ratRes.data.map((r: RatingResponse) => r.guestId))];
                Promise.all(
                    ids.map((gid) =>
                        usersApi
                            .getById(gid)
                            .then(({ data }) => [gid, data.username] as const)
                            .catch(() => [gid, (gid as string).slice(0, 8)] as const),
                    ),
                ).then((entries) =>
                    setGuestNames(Object.fromEntries(entries)),
                );
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

            {/* Gallery */}
            {accommodation.pictures.length > 0 ? (
                <Box sx={{ mb: 3 }}>
                    {/* Main image */}
                    <Box
                        component="img"
                        src={accommodation.pictures[activePhoto]}
                        alt={`${accommodation.name} ${activePhoto + 1}`}
                        onClick={() => openLightbox(activePhoto)}
                        sx={{
                            width: "100%",
                            maxHeight: 480,
                            objectFit: "cover",
                            borderRadius: 2,
                            cursor: "zoom-in",
                            display: "block",
                        }}
                    />

                    {/* Thumbnail strip */}
                    {accommodation.pictures.length > 1 && (
                        <Box
                            sx={{
                                display: "flex",
                                gap: 1,
                                mt: 1,
                                overflowX: "auto",
                                pb: 0.5,
                            }}
                        >
                            {accommodation.pictures.map((pic, i) => (
                                <Box
                                    key={i}
                                    component="img"
                                    src={pic}
                                    alt={`${accommodation.name} thumbnail ${i + 1}`}
                                    onClick={() => setActivePhoto(i)}
                                    sx={{
                                        height: 72,
                                        width: 96,
                                        objectFit: "cover",
                                        borderRadius: 1,
                                        cursor: "pointer",
                                        flexShrink: 0,
                                        border: 2,
                                        borderColor:
                                            i === activePhoto
                                                ? "primary.main"
                                                : "transparent",
                                        opacity: i === activePhoto ? 1 : 0.65,
                                        transition:
                                            "opacity 0.2s, border-color 0.2s",
                                        "&:hover": { opacity: 1 },
                                    }}
                                />
                            ))}
                        </Box>
                    )}
                </Box>
            ) : (
                <Box
                    sx={{
                        mb: 3,
                        height: 240,
                        bgcolor: "action.hover",
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Typography color="text.secondary">No photos</Typography>
                </Box>
            )}

            {/* Lightbox */}
            <Dialog
                open={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                maxWidth={false}
                slotProps={{
                    paper: {
                        sx: {
                            bgcolor: "black",
                            m: 1,
                            maxWidth: "95vw",
                            maxHeight: "95vh",
                        },
                    },
                }}
            >
                <DialogContent
                    sx={{
                        p: 0,
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <IconButton
                        onClick={() => setLightboxOpen(false)}
                        sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            color: "white",
                            zIndex: 1,
                        }}
                    >
                        <CloseIcon />
                    </IconButton>

                    {accommodation.pictures.length > 1 && (
                        <IconButton
                            onClick={lightboxPrev}
                            sx={{
                                position: "absolute",
                                left: 8,
                                color: "white",
                                bgcolor: "rgba(0,0,0,0.4)",
                            }}
                        >
                            <ArrowBackIosNewIcon />
                        </IconButton>
                    )}

                    <Box
                        component="img"
                        src={accommodation.pictures[lightboxIndex]}
                        alt={`${accommodation.name} ${lightboxIndex + 1}`}
                        sx={{
                            maxWidth: "90vw",
                            maxHeight: "90vh",
                            objectFit: "contain",
                            display: "block",
                        }}
                    />

                    {accommodation.pictures.length > 1 && (
                        <IconButton
                            onClick={lightboxNext}
                            sx={{
                                position: "absolute",
                                right: 8,
                                color: "white",
                                bgcolor: "rgba(0,0,0,0.4)",
                            }}
                        >
                            <ArrowForwardIosIcon />
                        </IconButton>
                    )}

                    {accommodation.pictures.length > 1 && (
                        <Typography
                            sx={{
                                position: "absolute",
                                bottom: 12,
                                color: "white",
                                fontSize: 13,
                            }}
                        >
                            {lightboxIndex + 1} /{" "}
                            {accommodation.pictures.length}
                        </Typography>
                    )}
                </DialogContent>
            </Dialog>

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
                                                by{" "}
                                                {guestNames[r.guestId] ??
                                                    r.guestId.slice(0, 8)}
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
                            {!user && (
                                <>
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight={600}
                                    >
                                        Want to stay here?
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Sign in or create an account to reserve
                                        this accommodation and manage your
                                        bookings.
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        onClick={() => navigate("/login")}
                                    >
                                        Sign in to Reserve
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        onClick={() => navigate("/register")}
                                    >
                                        Create Account
                                    </Button>
                                </>
                            )}

                            {user && !isOwner && (
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

                            {user && isOwner && (
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
