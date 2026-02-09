export default function SettingSection({ title, description, children }) {
  return (
    <section className="p-4 space-y-2 border rounded-lg">
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div>{children}</div>
    </section>
  );
}
