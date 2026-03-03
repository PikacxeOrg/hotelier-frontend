import { useEffect, useState } from "react";

import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Box, Button, Chip, Tab, Tabs, Typography } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";

import { reservationApi } from "@/api";
import { LoadingScreen } from "@/components";
import { useAuth } from "@/contexts";
import type { ReservationResponse } from "@/types";
import { ReservationStatus, UserType } from "@/types";
import { useSnackbar } from "notistack";

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
    const [tab, setTab] = useState(0);
    const [guestReservations, setGuestReservations] = useState<
        ReservationResponse[]
    >([]);
    const [hostReservations, setHostReservations] = useState<
        ReservationResponse[]
    >([]);
    const [loading, setLoading] = useState(true);

    const isHost = user?.userType === UserType.Host;

    useEffect(() => {
        const load = async () => {
            try {
                const [guestRes, hostRes] = await Promise.allSettled([
                    reservationApi.getMyReservations(),
                    isHost
                        ? reservationApi.getHostReservations()
                        : Promise.resolve({
                              data: [] as ReservationResponse[],
                          }),
                ]);

                if (guestRes.status === "fulfilled")
                    setGuestReservations(guestRes.value.data);
                if (hostRes.status === "fulfilled")
                    setHostReservations(hostRes.value.data);
            } catch {
                enqueueSnackbar("Failed to load reservations.", {
                    variant: "error",
                });
            } finally {
                setLoading(false);
            }
        };
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

    const baseColumns: GridColDef[] = [
        {
            field: "fromDate",
            headerName: "Check-in",
            width: 120,
            valueFormatter: (value: string) =>
                new Date(value).toLocaleDateString(),
        },
        {
            field: "toDate",
            headerName: "Check-out",
            width: 120,
            valueFormatter: (value: string) =>
                new Date(value).toLocaleDateString(),
        },
        { field: "numOfGuests", headerName: "Guests", width: 80 },
        {
            field: "status",
            headerName: "Status",
            width: 130,
            renderCell: ({ value }) => (
                <Chip
                    label={statusLabels[value as ReservationStatus]}
                    color={statusColors[value as ReservationStatus]}
                    size="small"
                />
            ),
        },
    ];

    const guestColumns: GridColDef[] = [
        ...baseColumns,
        {
            field: "actions",
            headerName: "",
            width: 160,
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
        ...baseColumns,
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
                Reservations
            </Typography>

            {isHost && (
                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
                    <Tab label="My Reservations" />
                    <Tab label="Guest Requests" />
                </Tabs>
            )}

            {tab === 0 && (
                <DataGrid
                    rows={guestReservations}
                    columns={guestColumns}
                    pageSizeOptions={[10, 25]}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10 } },
                    }}
                    disableRowSelectionOnClick
                    autoHeight
                    sx={{ bgcolor: "white" }}
                />
            )}

            {tab === 1 && isHost && (
                <DataGrid
                    rows={hostReservations}
                    columns={hostColumns}
                    pageSizeOptions={[10, 25]}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10 } },
                    }}
                    disableRowSelectionOnClick
                    autoHeight
                    sx={{ bgcolor: "white" }}
                />
            )}
        </Box>
    );
}
