import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import SearchIcon from "@mui/icons-material/Search";
import {
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Chip,
    Grid,
    Rating,
    TextField,
    Typography,
    Pagination,
} from "@mui/material";

import { useSnackbar } from "notistack";

import { searchApi } from "@/api";
import type { SearchRequest, SearchResponse } from "@/types";

export default function HomePage() {
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const [results, setResults] = useState<SearchResponse[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState<SearchRequest>({
        location: "",
        numberOfGuests: 1,
        checkIn: "",
        checkOut: "",
        page: 1,
        pageSize: 12,
    });

    const pageCount = Math.ceil(totalCount / filters.pageSize);

    const handleSearch = async () => {
        setLoading(true);

        try {
            const { data } = await searchApi.search(filters);
            setResults(data.items);
            setTotalCount(data.totalCount);
        } catch {
            enqueueSnackbar("Failed to load accommodations.", {
                variant: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
        setFilters((prev) => ({
            ...prev,
            page,
        }));
    };

    useEffect(() => {
        handleSearch();
    }, [filters.page]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <Box>
            {/* -- Search bar --------------------------- */}
            <Card sx={{ mb: 4, p: 2 }}>
                <Typography variant="h5" gutterBottom>
                    Find your perfect stay
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        gap: 2,
                        flexWrap: "wrap",
                        alignItems: "center",
                    }}
                >
                    <TextField
                        label="Location"
                        value={filters.location}
                        onChange={(e) =>
                            setFilters({
                                ...filters,
                                location: e.target.value,
                                page: 1,
                            })
                        }
                        sx={{ flex: 1, minWidth: 200 }}
                    />

                    <TextField
                        label="Guests"
                        type="number"
                        value={filters.numberOfGuests}
                        onChange={(e) =>
                            setFilters({
                                ...filters,
                                numberOfGuests: +e.target.value,
                                page: 1,
                            })
                        }
                        sx={{ width: 100 }}
                        slotProps={{ htmlInput: { min: 1 } }}
                    />

                    <TextField
                        label="Check-in"
                        type="date"
                        value={filters.checkIn}
                        onChange={(e) =>
                            setFilters({
                                ...filters,
                                checkIn: e.target.value,
                                page: 1,
                            })
                        }
                        slotProps={{ inputLabel: { shrink: true } }}
                    />

                    <TextField
                        label="Check-out"
                        type="date"
                        value={filters.checkOut}
                        onChange={(e) =>
                            setFilters({
                                ...filters,
                                checkOut: e.target.value,
                                page: 1,
                            })
                        }
                        slotProps={{ inputLabel: { shrink: true } }}
                    />

                    <Button
                        variant="contained"
                        startIcon={<SearchIcon />}
                        onClick={handleSearch}
                        disabled={loading}
                    >
                        Search
                    </Button>
                </Box>
            </Card>

            {/* -- Results ------------------------------ */}
            {totalCount > 0 && (
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                >
                    {totalCount} accommodation{totalCount !== 1 ? "s" : ""}{" "}
                    found
                </Typography>
            )}

            <Grid container spacing={3}>
                {results &&
                    results.map((item) => (
                        <Grid
                            size={{ xs: 12, sm: 6, md: 4 }}
                            key={item.accommodationId}
                        >
                            <Card
                                sx={{
                                    cursor: "pointer",
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                                onClick={() =>
                                    navigate(
                                        `/accommodations/${item.accommodationId}`,
                                    )
                                }
                            >
                                <CardMedia
                                    component="img"
                                    height="180"
                                    image={
                                        item.pictures[0] ?? "/placeholder.jpg"
                                    }
                                    alt={item.name}
                                    sx={{ objectFit: "cover" }}
                                />

                                <CardContent sx={{ flex: 1 }}>
                                    <Typography variant="h6" noWrap>
                                        {item.name}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        gutterBottom
                                    >
                                        {item.location}
                                    </Typography>

                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 0.5,
                                            mb: 1,
                                        }}
                                    >
                                        <Rating
                                            value={item.averageRating}
                                            precision={0.5}
                                            size="small"
                                            readOnly
                                        />
                                        <Typography variant="caption">
                                            ({item.totalRatings})
                                        </Typography>
                                    </Box>

                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexWrap: "wrap",
                                            gap: 0.5,
                                            mb: 1,
                                        }}
                                    >
                                        {item.amenities.slice(0, 3).map((a) => (
                                            <Chip
                                                key={a}
                                                label={a}
                                                size="small"
                                                variant="outlined"
                                            />
                                        ))}
                                    </Box>

                                    {item.totalPrice != null && (
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight="bold"
                                        >
                                            €{item.totalPrice.toFixed(2)} total
                                        </Typography>
                                    )}

                                    {item.unitPrice != null && (
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            €{item.unitPrice.toFixed(2)} / night
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
            </Grid>

            {/* -- Pagination --------------------------- */}
            {pageCount > 1 && (
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        mt: 4,
                    }}
                >
                    <Pagination
                        count={pageCount}
                        page={filters.page}
                        onChange={handlePageChange}
                        color="primary"
                        disabled={loading}
                    />
                </Box>
            )}
        </Box>
    );
}
