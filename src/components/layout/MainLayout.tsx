import { Outlet } from "react-router-dom";

import { Box, Container } from "@mui/material";

import Footer from "./Footer";
import Navbar from "./Navbar";

/**
 * Root layout: navbar → main content → footer.
 */
export default function MainLayout() {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
            }}
        >
            <Navbar />
            <Container component="main" maxWidth="lg" sx={{ flex: 1, py: 4 }}>
                <Outlet />
            </Container>
            <Footer />
        </Box>
    );
}
