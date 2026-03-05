import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Box, Button, Chip, Link, Typography } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useSnackbar } from "notistack";

import { accommodationApi, reservationApi, usersApi } from "@/api";
import { LoadingScreen } from "@/components";
import { useAuth } from "@/contexts";
import type { ReservationResponse } from "@/types";
import { ReservationStatus, UserType } from "@/types";

const statusColors: Record<
    ReservationStatus,
    "warning" | "success" | "error" | "default"
> = {
    [ReservationStatus.Pending]: "warning",
    [ReservationStatus.Approved]: "success",
    [ReservationStatus.Denied]: "error",
    [ReservationStatus.Cancelled]: "default",
};

const statusLabels: Record<ReservationStatus, string> = {
    [ReservationStatus.Pending]: "Pending",
    [ReservationStatus.Approved]: "Approved",
    [ReservationStatus.Denied]: "Denied",
    [ReservationStatus.Cancelled]: "Cancelled",
};

export default function ReservationsPage() {
    const { user } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const [guestReservations, setGuestReservations] = useState<
        ReservationResponse[]
    >([]);
    const [hostReservations, setHostReservations] = useState<
        ReservationResponse[]
    >([]);
    const [loading, setLoading] = useState(true);
    // enrichment maps
    const [accommodationNames, setAccommodationNames] = useState<
        Record<string, string>
    >({});
    const [guestNames, setGuestNames] = useState<Record<string, string>>({});
    const [cancelCounts, setCancelCounts] = useState<Record<string, number>>(
        {},
    );

    const isHost = user?.userType === UserType.Host;

    const load = async () => {
        try {
            if (isHost) {
                const { data } = await reservationApi.getHostReservations();
                setHostReservations(data);

                // Enrich: unique accommodation IDs and guest user IDs
                const accIds = [...new Set(data.map((r) => r.accommodationId))];
                const userIds = [...new Set(data.map((r) => r.userId))];

                const [accResults, userResults] = await Promise.all([
                    Promise.allSettled(
                        accIds.map((id) => accommodationApi.getById(id)),
                    ),
                    Promise.allSettled(
                        userIds.map((id) => usersApi.getById(id)),
                    ),
                ]);

                const accMap: Record<string, string> = {};
                accResults.forEach((res, i) => {
                    if (res.status === "fulfilled")
                        accMap[accIds[i]] = res.value.data.name;
                });
                setAccommodationNames(accMap);

                const userMap: Record<string, string> = {};
                userResults.forEach((res, i) => {
                    if (res.status === "fulfilled")
                        userMap[userIds[i]] = res.value.data.username;
                });
                setGuestNames(userMap);

                // Cancellation history for guests with pending requests
                const pendingGuestIds = [
                    ...new Set(
                        data
                            .filter(
                                (r) => r.status === ReservationStatus.Pending,
                            )
                            .map((r) => r.userId),
                    ),
                ];
                const historyResults = await Promise.allSettled(
                    pendingGuestIds.map((id) =>
                        reservationApi.getGuestHistory(id),
                    ),
                );
                const countMap: Record<string, number> = {};
                historyResults.forEach((res, i) => {
                    if (res.status === "fulfilled")
                        countMap[pendingGuestIds[i]] =
                            res.value.data.cancelledReservations;
                });
                setCancelCounts(countMap);
            } else {
                const { data } = await reservationApi.getMyReservations();
                setGuestReservations(data);

                // Enrich accommodation names for guest view too
                const accIds = [...new Set(data.map((r) => r.accommodationId))];
                const accResults = await Promise.allSettled(
                    accIds.map((id) => accommodationApi.getById(id)),
                );
                const accMap: Record<string, string> = {};
                accResults.forEach((res, i) => {
                    if (res.status === "fulfilled")
                        accMap[accIds[i]] = res.value.data.name;
                });
                setAccommodationNames(accMap);
            }
        } catch {
            enqueueSnackbar("Failed to load reservations.", {
                variant: "error",
            });
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        load();
    }, [isHost]);

    const handleApprove = async (id: string) => {
        try {
            await reservationApi.approve(id);
            setHostReservations((prev) =>
                prev.map((r) =>
                    r.id === id
                        ? { ...r, status: ReservationStatus.Approved }
                        : r,
                ),
            );
            enqueueSnackbar("Reservation approved.", { variant: "success" });
            load();
        } catch {
            enqueueSnackbar("Failed to approve reservation.", {
                variant: "error",
            });
        }
    };

    const handleReject = async (id: string) => {
        try {
            await reservationApi.reject(id);
            setHostReservations((prev) =>
                prev.map((r) =>
                    r.id === id
                        ? { ...r, status: ReservationStatus.Denied }
                        : r,
                ),
            );
            enqueueSnackbar("Reservation rejected.", { variant: "success" });
            load();
        } catch {
            enqueueSnackbar("Failed to reject reservation.", {
                variant: "error",
            });
        }
    };

    const handleCancel = async (id: string) => {
        try {
            await reservationApi.cancel(id);
            setGuestReservations((prev) =>
                prev.map((r) =>
                    r.id === id
                        ? { ...r, status: ReservationStatus.Cancelled }
                        : r,
                ),
            );
            enqueueSnackbar("Reservation cancelled.", { variant: "success" });
        } catch {
            enqueueSnackbar(
                "Cannot cancel — the check-in date may be too close.",
                { variant: "error" },
            );
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await reservationApi.delete(id);
            setGuestReservations((prev) => prev.filter((r) => r.id !== id));
            enqueueSnackbar("Reservation deleted.", { variant: "success" });
        } catch {
            enqueueSnackbar("Failed to delete reservation.", {
                variant: "error",
            });
        }
    };

    // Shared columns
    const accommodationCol: GridColDef = {
        field: "accommodationId",
        headerName: "Accommodation",
        flex: 1,
        minWidth: 160,
        renderCell: ({ value }) => (
            <Link
                component="button"
                underline="hover"
                onClick={() => navigate(`/accommodations/${value}`)}
            >
                {accommodationNames[value] ?? value.slice(0, 8) + "…"}
            </Link>
        ),
    };

    const dateColumns: GridColDef[] = [
        {
            field: "fromDate",
            headerName: "Check-in",
            width: 110,
            valueFormatter: (value: string) =>
                new Date(value).toLocaleDateString(),
        },
        {
            field: "toDate",
            headerName: "Check-out",
            width: 110,
            valueFormatter: (value: string) =>
                new Date(value).toLocaleDateString(),
        },
        { field: "numOfGuests", headerName: "Guests", width: 70 },
    ];

    const statusCol: GridColDef = {
        field: "status",
        headerName: "Status",
        width: 120,
        renderCell: ({ value }) => (
            <Chip
                label={statusLabels[value as ReservationStatus]}
                color={statusColors[value as ReservationStatus]}
                size="small"
            />
        ),
    };

    const guestColumns: GridColDef[] = [
        accommodationCol,
        ...dateColumns,
        statusCol,
        {
            field: "actions",
            headerName: "",
            width: 120,
            sortable: false,
            renderCell: ({ row }) => {
                if (row.status === ReservationStatus.Pending) {
                    return (
                        <Button
                            size="small"
                            color="error"
                            onClick={() => handleDelete(row.id)}
                        >
                            Delete
                        </Button>
                    );
                }
                if (row.status === ReservationStatus.Approved) {
                    return (
                        <Button
                            size="small"
                            color="warning"
                            onClick={() => handleCancel(row.id)}
                        >
                            Cancel
                        </Button>
                    );
                }
                return null;
            },
        },
    ];

    const hostColumns: GridColDef[] = [
        accommodationCol,
        ...dateColumns,
        {
            field: "userId",
            headerName: "Guest",
            width: 180,
            renderCell: ({ row, value }) => {
                const name = guestNames[value];
                const cancels = cancelCounts[value];
                return (
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 0.25,
                            py: 0.5,
                        }}
                    >
                        <Typography variant="body2">
                            {(name ?? value == null)
                                ? "deleted user"
                                : value.slice(0, 8) + "…"}
                        </Typography>
                        {row.status === ReservationStatus.Pending &&
                            cancels != null &&
                            cancels > 0 && (
                                <Chip
                                    label={`${cancels} cancellation${
                                        cancels !== 1 ? "s" : ""
                                    }`}
                                    color="warning"
                                    size="small"
                                />
                            )}
                    </Box>
                );
            },
        },
        statusCol,
        {
            field: "actions",
            headerName: "",
            width: 200,
            sortable: false,
            renderCell: ({ row }) =>
                row.status === ReservationStatus.Pending ? (
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                            size="small"
                            color="success"
                            startIcon={<CheckCircleIcon />}
                            onClick={() => handleApprove(row.id)}
                        >
                            Approve
                        </Button>
                        <Button
                            size="small"
                            color="error"
                            startIcon={<CancelIcon />}
                            onClick={() => handleReject(row.id)}
                        >
                            Reject
                        </Button>
                    </Box>
                ) : null,
        },
    ];

    if (loading) return <LoadingScreen />;

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                {isHost ? "Guest Requests" : "My Reservations"}
            </Typography>

            <DataGrid
                rows={isHost ? hostReservations : guestReservations}
                columns={isHost ? hostColumns : guestColumns}
                pageSizeOptions={[10, 25]}
                initialState={{
                    pagination: { paginationModel: { pageSize: 10 } },
                }}
                disableRowSelectionOnClick
                autoHeight
                sx={{ bgcolor: "white" }}
            />
        </Box>
    );
}
