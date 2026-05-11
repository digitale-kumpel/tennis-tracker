interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b bg-background sticky top-0 z-40">
      <h1 className="text-lg font-semibold">{title}</h1>
      {children}
    </div>
  );
}
