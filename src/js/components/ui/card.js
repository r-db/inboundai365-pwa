import { cn } from "../../lib/utils";

export function createCard({ className = "", children }) {
  const card = document.createElement("div");
  card.className = cn(
    "rounded-lg border bg-card text-card-foreground shadow-sm",
    className
  );
  if (children) card.innerHTML = children;
  return card;
}

export function createCardHeader({ className = "", children }) {
  const header = document.createElement("div");
  header.className = cn("flex flex-col space-y-1.5 p-6", className);
  if (children) header.innerHTML = children;
  return header;
}

export function createCardTitle({ className = "", children }) {
  const title = document.createElement("h3");
  title.className = cn(
    "text-2xl font-semibold leading-none tracking-tight",
    className
  );
  if (children) title.textContent = children;
  return title;
}

export function createCardDescription({ className = "", children }) {
  const description = document.createElement("p");
  description.className = cn("text-sm text-muted-foreground", className);
  if (children) description.textContent = children;
  return description;
}

export function createCardContent({ className = "", children }) {
  const content = document.createElement("div");
  content.className = cn("p-6 pt-0", className);
  if (children) content.innerHTML = children;
  return content;
}

export function createCardFooter({ className = "", children }) {
  const footer = document.createElement("div");
  footer.className = cn("flex items-center p-6 pt-0", className);
  if (children) footer.innerHTML = children;
  return footer;
}
