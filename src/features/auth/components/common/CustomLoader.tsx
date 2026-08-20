import {
	CircularProgress,
	type CircularProgressProps,
} from "@mui/material";

export function CustomLoader({
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
}
