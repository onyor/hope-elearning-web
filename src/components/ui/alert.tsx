import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const alertVariants = cva("rounded p-3 border", {
  variants: {
    variant: {
      primary: "bg-primary/15 border-primary/15 text-primary",
      success: "bg-success/15 border-success/15 text-success",
      destructive: "bg-destructive/15 border-destructive/15 text-danger",
    },
  },
  defaultVariants: {
    variant: "primary",
  },
});

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

function Alert({ variant, className, ...props }: AlertProps) {
  return (
    <div
      className={cn(alertVariants({ variant, className }))}
      role="alert"
      {...props}
    ></div>
  );
}

export { Alert };