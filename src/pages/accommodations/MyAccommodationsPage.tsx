import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AddIcon from "@mui/icons-material/Add";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Grid,
    Typography,
} from "@mui/material";

import { accommodationApi } from "@/api";
import { LoadingScreen } from "@/components";
import { useAuth } from "@/contexts";
import type { AccommodationResponse } from "@/types";

export default function MyAccommodationsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [accommodations, setAccommodations] = useState<
        AccommodationResponse[]
    >([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        accommodationApi
            .getMine()
            .then(({ data }) => setAccommodations(data))
            .finally(() => setLoading(false));
    }, [user]);

    if (loading) return <LoadingScreen />;

    return (
        <Box>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                }}
            >
                <Typography variant="h4">My Accommodations</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate("/accommodations/new")}
                >
                    Add Accommodation
                </Button>
            </Box>

            {accommodations.length === 0 ? (
                <Typography color="text.secondary">
                    You haven&apos;t listed any accommodations yet.
                </Typography>
            ) : (
                <Grid container spacing={3}>
                    {accommodations.map((acc) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={acc.id}>
                            <Card
                                sx={{ cursor: "pointer" }}
                                onClick={() =>
                                    navigate(`/accommodations/${acc.id}`)
                                }
                            >
                                <CardContent>
                                    <Typography variant="h6">
                                        {acc.name}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        gutterBottom
                                    >
                                        {acc.location}
                                    </Typography>
                                    <Typography variant="body2">
                                        Guests: {acc.minGuests}–{acc.maxGuests}
                                    </Typography>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexWrap: "wrap",
                                            gap: 0.5,
                                            mt: 1,
                                        }}
                                    >
                                        {acc.amenities.map((a) => (
                                            <Chip
                                                key={a}
                                                label={a}
                                                size="small"
                                                variant="outlined"
                                            />
                                        ))}
                                    </Box>
                                    <Chip
                                        label={
                                            acc.autoApproval
                                                ? "Auto-approve"
                                                : "Manual approval"
                                        }
                                        color={
                                            acc.autoApproval
                                                ? "success"
                                                : "default"
                                        }
                                        size="small"
                                        sx={{ mt: 1 }}
                                    />
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
}
