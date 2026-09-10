import { srcset, largest, type MediaSlot } from "@/lib/media";

type FrameProps = {
  slot: MediaSlot;
  /** Classe do contêiner. Ele define a proporção; a mídia preenche. */
  className?: string;
  /** Classe da mídia em si — usada pelas animações de câmera. */
  mediaClassName?: string;
  /** Hero e primeira dobra apenas. */
  priority?: boolean;
  /** Marca decorativa: a fotografia não carrega informação própria. */
  decorative?: boolean;
  /** Lado onde a anotação de direção de arte pousa, quando não há arquivo. */
  noteSide?: "left" | "right";
};

/**
 * Renderiza o slot de mídia — vídeo original, fotografia ou, enquanto o
 * arquivo real não existe, uma placa tonal na proporção correta.
 *
 * A fotografia sai como <picture> com AVIF e WebP em quatro larguras. As
 * dimensões nativas vão no <img> para reservar o espaço antes do download:
 * nenhuma imagem empurra o layout ao carregar.
 *
 * O enquadramento é uma variável por breakpoint, não um valor único — cada
 * fotografia tem o seu corte no desktop e outro no mobile.
 */
export function Frame({
  slot,
  className = "",
  mediaClassName = "",
  priority = false,
  decorative = false,
  noteSide = "left",
}: FrameProps) {
  const alt = decorative ? "" : slot.alt;
  const foco = {
    "--focus": slot.focus,
    "--focus-mobile": slot.focusMobile,
  } as React.CSSProperties;

  if (slot.video) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <video
          className={`plate-media ${mediaClassName}`}
          style={foco}
          autoPlay
          muted
          loop
          playsInline
          preload={priority ? "auto" : "none"}
          poster={slot.poster ?? undefined}
          aria-label={alt || undefined}
          aria-hidden={decorative || undefined}
          width={slot.width}
          height={slot.height}
        >
          <source src={slot.video} type="video/mp4" />
        </video>
      </div>
    );
  }

  if (slot.base) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <picture>
          <source type="image/avif" srcSet={srcset(slot, "avif")} sizes={slot.sizes} />
          <source type="image/webp" srcSet={srcset(slot, "webp")} sizes={slot.sizes} />
          <img
            className={`plate-media ${mediaClassName}`}
            style={foco}
            src={largest(slot, "webp")}
            alt={alt}
            width={slot.width}
            height={slot.height}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding="async"
          />
        </picture>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : `Espaço reservado: ${slot.note}`}
    >
      <div
        className={`plate-media ${mediaClassName}`}
        style={{
          background: `linear-gradient(148deg, ${slot.tone[0]} 0%, ${slot.tone[1]} 100%)`,
        }}
        aria-hidden="true"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(12,10,8,0.42) 0%, rgba(12,10,8,0) 42%)",
        }}
      />
      <p
        aria-hidden="true"
        className={`pointer-events-none absolute bottom-5 max-w-[26ch] text-linho-alto/85 md:bottom-7 ${
          noteSide === "right" ? "right-5 text-right md:right-7" : "left-5 md:left-7"
        }`}
      >
        <span className="t-eyebrow block text-linho-alto/60">Fotografia Serenou</span>
        <span className="mt-2 block text-[0.8125rem] leading-snug">{slot.note}</span>
      </p>
    </div>
  );
}
