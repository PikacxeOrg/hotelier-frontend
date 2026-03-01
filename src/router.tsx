import { createBrowserRouter } from "react-router-dom";

import { MainLayout, ProtectedRoute } from "@/components";
import {
    HomePage,
    LoginPage,
    NotFoundPage,
    ProfilePage,
    RegisterPage,
} from "@/pages";

const router = createBrowserRouter([
    {
        element: <MainLayout />,
        children: [
            // -- Public --------------------------------
            { index: true, element: <HomePage /> },
            { path: "login", element: <LoginPage /> },
            { path: "register", element: <RegisterPage /> },

            // -- Protected -----------------------------
            {
                path: "profile",
                element: (
                    <ProtectedRoute>
                        <ProfilePage />
                    </ProtectedRoute>
                ),
            },

            // -- 404 -----------------------------------
            { path: "*", element: <NotFoundPage /> },
        ],
    },
]);

export default router;
