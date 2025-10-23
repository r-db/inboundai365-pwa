import { cn } from "../../lib/utils";

const buttonVariants = {
  variant: {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
  },
  size: {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  },
};

export function createButton({
  variant = "default",
  size = "default",
  className = "",
  ...props
}) {
  const button = document.createElement("button");

  button.className = cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    buttonVariants.variant[variant],
    buttonVariants.size[size],
    className
  );

  Object.entries(props).forEach(([key, value]) => {
    if (key.startsWith('on')) {
      const eventName = key.substring(2).toLowerCase();
      button.addEventListener(eventName, value);
    } else if (key === 'children' || key === 'text') {
      button.textContent = value;
    } else {
      button.setAttribute(key, value);
    }
  });

  return button;
}
