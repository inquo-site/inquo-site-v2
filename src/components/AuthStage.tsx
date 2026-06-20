import { ReactNode, useMemo } from "react";

interface AuthStageProps {
  children: ReactNode;
}

/**
 * Cinematic "drop & land" stage for the Auth card.
 * - Ambient glowing blobs + dot grid backdrop
 * - The card falls in with squash/stretch
 * - A contact-shadow squashes under it on impact
 * - Red sparks scatter upward at the moment of landing
 */
export function AuthStage({ children }: AuthStageProps) {
  const sparks = useMemo(
    () =>
      Array.from({ length: 10 }).map((_, i) => ({
        left: 10 + Math.random() * 80,
        sx: (Math.random() - 0.5) * 80,
        delay: 0.55 + Math.random() * 0.15,
        size: 4 + Math.random() * 4,
        key: i,
      })),
    []
  );

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center px-4 py-12 bg-background">
      {/* Ambient stage */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-accent/40 mix-blend-screen auth-glow" />
        <div className="absolute -bottom-24 -right-16 w-96 h-96 rounded-full bg-primary/40 mix-blend-screen auth-glow delay" />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle at center, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "38px 38px",
          }}
        />
      </div>

      {/* Floating wrapper keeps gentle ambient motion after landing */}
      <div className="relative w-full max-w-md auth-float">
        {/* Sparks at impact */}
        <div className="pointer-events-none absolute left-0 right-0 -bottom-2 h-0">
          {sparks.map((s) => (
            <span
              key={s.key}
              className="auth-spark absolute block rounded-full bg-accent shadow-[0_0_10px_2px_hsl(var(--accent)/0.7)]"
              style={
                {
                  left: `${s.left}%`,
                  width: `${s.size}px`,
                  height: `${s.size}px`,
                  animationDelay: `${s.delay}s`,
                  ["--sx" as never]: `${s.sx}px`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>

        {/* Contact shadow */}
        <div
          className="auth-shadow absolute left-1/2 -bottom-3 h-3 w-3/4 rounded-[100%] bg-black/60 blur-xl"
          style={{ transformOrigin: "center" }}
        />

        {/* The card itself drops in */}
        <div className="auth-drop will-change-transform">{children}</div>
      </div>
    </div>
  );
}
