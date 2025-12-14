type HeaderProps = {
  subtitle: string;
  pillText?: string;
  pillTone?: "default" | "subtle";
};

export function Header({ subtitle, pillText, pillTone = "default" }: HeaderProps) {
  return (
    <div className="header">
      <div className="logo-block">
        <div>
          <div className="logo">라포</div>
          <div className="subtitle">{subtitle}</div>
        </div>
      </div>
      {pillText && <div className={`pill ${pillTone === "subtle" ? "subtle" : ""}`}>{pillText}</div>}
    </div>
  );
}
