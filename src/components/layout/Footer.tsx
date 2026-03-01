import { Box, Container, Typography } from "@mui/material";

export default function Footer() {
    return (
        <Box
            component="footer"
            sx={{ py: 3, mt: "auto", bgcolor: "grey.100", textAlign: "center" }}
        >
            <Container maxWidth="lg">
                <Typography variant="body2" color="text.secondary">
                    &copy; {new Date().getFullYear()} Hotelier — Hotel Booking
                    Platform | Developed as University course project
                </Typography>
            </Container>
        </Box>
    );
}
