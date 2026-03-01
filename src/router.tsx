import { createBrowserRouter } from "react-router-dom";

import { MainLayout } from "@/components";

const router = createBrowserRouter([
    {
        element: <MainLayout />,
        children: [
            // -- 404 -----------------------------------
            { path: "*", element: <NotFoundPage /> },
        ],
    },
]);

export default router;
