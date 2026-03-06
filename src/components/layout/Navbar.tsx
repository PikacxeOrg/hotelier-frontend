import { useState } from "react";
import { useNavigate } from "react-router-dom";

import HotelIcon from "@mui/icons-material/Hotel";
import {
    AppBar,
    Avatar,
    Box,
    Button,
    IconButton,
    Menu,
    MenuItem,
    Toolbar,
    Typography,
} from "@mui/material";

import { useAuth } from "@/contexts";
import { UserType } from "@/types";

import NotificationBell from "./NotificationBell";

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleMenu = (e: React.MouseEvent<HTMLElement>) =>
        setAnchorEl(e.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const isHost = user?.userType === UserType.Host;
    const isGuest = user?.userType === UserType.Guest;

    return (
        <AppBar position="sticky" color="primary">
            <Toolbar>
                <IconButton
                    edge="start"
                    color="inherit"
                    sx={{ mr: 1 }}
                    onClick={() => navigate("/")}
                >
                    <HotelIcon />
                </IconButton>

                <Typography
                    variant="h6"
                    component="div"
                    sx={{ cursor: "pointer" }}
                    onClick={() => navigate("/")}
                >
                    Hotelier
                </Typography>

                <Box sx={{ flexGrow: 1 }} />

                {isAuthenticated ? (
                    <>
                        <NotificationBell />

                        <IconButton color="inherit" onClick={handleMenu}>
                            <Avatar
                                sx={{
                                    width: 32,
                                    height: 32,
                                    bgcolor: "secondary.main",
                                }}
                            >
                                {user?.name?.[0]?.toUpperCase() ?? "U"}
                            </Avatar>
                        </IconButton>

                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            <MenuItem
                                onClick={() => {
                                    handleClose();
                                    navigate("/profile");
                                }}
                            >
                                Profile
                            </MenuItem>
                            <MenuItem
                                onClick={() => {
                                    handleClose();
                                    navigate("/my-reservations");
                                }}
                            >
                                My Reservations
                            </MenuItem>
                            {isHost && (
                                <MenuItem
                                    onClick={() => {
                                        handleClose();
                                        navigate("/my-accommodations");
                                    }}
                                >
                                    My Accommodations
                                </MenuItem>
                            )}
                            {isGuest && (
                                <MenuItem
                                    onClick={() => {
                                        handleClose();
                                        navigate("/my-reviews");
                                    }}
                                >
                                    My Reviews
                                </MenuItem>
                            )}
                            <MenuItem
                                onClick={() => {
                                    handleClose();
                                    navigate("/notifications");
                                }}
                            >
                                Notifications
                            </MenuItem>
                            <MenuItem
                                onClick={() => {
                                    handleClose();
                                    logout();
                                    navigate("/");
                                }}
                            >
                                Logout
                            </MenuItem>
                        </Menu>
                    </>
                ) : (
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                            color="inherit"
                            onClick={() => navigate("/login")}
                        >
                            Login
                        </Button>
                        <Button
                            color="inherit"
                            variant="outlined"
                            onClick={() => navigate("/register")}
                        >
                            Register
                        </Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
}
