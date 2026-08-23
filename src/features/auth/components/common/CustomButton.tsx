import { Button, type ButtonProps } from '@mui/material'
import { memo } from "react"

interface CustomButtonProps extends ButtonProps {
  children: React.ReactNode
}

export const CustomButton = memo(function CustomButton({
  children,
  ...props
}: CustomButtonProps) {
  return (
    <Button {...props}>
      {children}
    </Button>
  )
})