import { TextField, type TextFieldProps } from "@mui/material";

export function CustomInput({
	...props
}: TextFieldProps) {
	return <TextField  {...props} />;
} 