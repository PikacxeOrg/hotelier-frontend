import { Typography } from "@mui/material";

export default function NotFoundPage() {
    return (
        <>
            <Typography variant="h3" gutterBottom>
                404
            </Typography>
            <Typography color="text.secondary">
                The page you&apos;re looking for doesn&apos;t exist.
            </Typography>
        </>
    );
}
