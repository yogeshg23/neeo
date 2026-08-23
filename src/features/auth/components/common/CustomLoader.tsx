import {
	CircularProgress,
	type CircularProgressProps,
} from "@mui/material";
import { memo } from "react";

export const CustomLoader = memo(function CustomLoader({
	size = 24,
	color = "inherit",
	...props
}: CircularProgressProps) {
	return (
		<CircularProgress
			size={size}
			color={color}
			aria-label="Loading"
			{...props}
		/>
	);
	})
