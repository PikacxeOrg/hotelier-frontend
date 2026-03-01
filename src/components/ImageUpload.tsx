import { useRef, useState } from "react";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import {
    Alert,
    Box,
    CircularProgress,
    IconButton,
    Typography,
} from "@mui/material";

import { cdnApi } from "@/api";

interface Props {
    entityId: string;
    pictures: string[];
    onPicturesChange: (pics: string[]) => void;
}

export default function ImageUpload({
    entityId,
    pictures,
    onPicturesChange,
}: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files?.length) return;

        setUploading(true);
        setError("");

        try {
            const newUrls: string[] = [];
            for (const file of Array.from(files)) {
                const { data } = await cdnApi.upload(file, entityId);
                newUrls.push(...data.map((r) => r.url));
            }
            onPicturesChange([...pictures, ...newUrls]);
        } catch {
            setError("Failed to upload one or more images.");
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    };

    const handleRemove = (index: number) => {
        onPicturesChange(pictures.filter((_, i) => i !== index));
    };

    return (
        <Box>
            <Typography variant="subtitle2" gutterBottom>
                Photos
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 1 }}>
                    {error}
                </Alert>
            )}

            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
                {pictures.map((pic, i) => (
                    <Box key={i} sx={{ position: "relative" }}>
                        <Box
                            component="img"
                            src={pic}
                            alt={`Photo ${i + 1}`}
                            sx={{
                                width: 120,
                                height: 90,
                                objectFit: "cover",
                                borderRadius: 1,
                            }}
                        />
                        <IconButton
                            size="small"
                            onClick={() => handleRemove(i)}
                            sx={{
                                position: "absolute",
                                top: -8,
                                right: -8,
                                bgcolor: "background.paper",
                            }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Box>
                ))}

                <Box
                    onClick={() => inputRef.current?.click()}
                    sx={{
                        width: 120,
                        height: 90,
                        border: "2px dashed",
                        borderColor: "divider",
                        borderRadius: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        "&:hover": { borderColor: "primary.main" },
                    }}
                >
                    {uploading ? (
                        <CircularProgress size={24} />
                    ) : (
                        <>
                            <CloudUploadIcon color="action" />
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Upload
                            </Typography>
                        </>
                    )}
                </Box>
            </Box>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={handleUpload}
            />
        </Box>
    );
}
