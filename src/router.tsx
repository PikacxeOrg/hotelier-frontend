import { createBrowserRouter } from "react-router-dom";

import { MainLayout, ProtectedRoute } from "@/components";
import {
    AccommodationDetailPage,
    AvailabilityManagementPage,
    CreateAccommodationPage,
    CreateReservationPage,
    EditAccommodationPage,
    HomePage,
    LoginPage,
    MyAccommodationsPage,
    MyReviewsPage,
    NotificationsPage,
    NotFoundPage,
    ProfilePage,
    RegisterPage,
    ReservationsPage,
} from "@/pages";

const router = createBrowserRouter([
    {
        element: <MainLayout />,
        children: [
            // -- Public --------------------------------
            { index: true, element: <HomePage /> },
            { path: "login", element: <LoginPage /> },
            { path: "register", element: <RegisterPage /> },
            {
                path: "accommodations/:id",
                element: <AccommodationDetailPage />,
            },

            // -- Protected -----------------------------
            {
                path: "profile",
                element: (
                    <ProtectedRoute>
                        <ProfilePage />
                    </ProtectedRoute>
                ),
            },
            {
                path: "my-accommodations",
                element: (
                    <ProtectedRoute>
                        <MyAccommodationsPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: "accommodations/new",
                element: (
                    <ProtectedRoute>
                        <CreateAccommodationPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: "accommodations/:id/edit",
                element: (
                    <ProtectedRoute>
                        <EditAccommodationPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: "accommodations/:id/availability",
                element: (
                    <ProtectedRoute>
                        <AvailabilityManagementPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: "my-reservations",
                element: (
                    <ProtectedRoute>
                        <ReservationsPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: "reservations/new",
                element: (
                    <ProtectedRoute>
                        <CreateReservationPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: "my-reviews",
                element: (
                    <ProtectedRoute>
                        <MyReviewsPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: "notifications",
                element: (
                    <ProtectedRoute>
                        <NotificationsPage />
                    </ProtectedRoute>
                ),
            },

            // -- 404 -----------------------------------
            { path: "*", element: <NotFoundPage /> },
        ],
    },
]);

export default router;
