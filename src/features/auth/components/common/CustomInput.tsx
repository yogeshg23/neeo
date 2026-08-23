import { TextField, type TextFieldProps } from "@mui/material";
import { memo } from "react";

export const CustomInput = memo(function CustomInput({
	...props
}: TextFieldProps) {
	return <TextField  {...props} />;
})