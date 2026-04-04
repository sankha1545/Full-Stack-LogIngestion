export default function SettingSection({ title, description, children }) {
  return (
    <section className="space-y-4 rounded-[24px] border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-950/60">
      <div>
        <h3 className="text-sm font-semibold text-slate-950 dark:text-slate-100">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div>{children}</div>
    </section>
  );
}
