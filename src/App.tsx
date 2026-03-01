import { RouterProvider } from "react-router-dom";

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { SnackbarProvider } from "notistack";

import { AuthProvider } from "@/contexts";
import router from "@/router";
import theme from "@/theme";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

export default function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <SnackbarProvider maxSnack={3} autoHideDuration={4000}>
                <AuthProvider>
                    <RouterProvider router={router} />
                </AuthProvider>
            </SnackbarProvider>
        </ThemeProvider>
    );
}
