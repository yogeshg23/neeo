import { Button, type ButtonProps } from '@mui/material'

interface CustomButtonProps extends ButtonProps {
  children: React.ReactNode
}

export function CustomButton({
  children,
  ...props
}: CustomButtonProps) {
  return (
    <Button {...props}>
      {children}
    </Button>
  )
}