import type { MediaSlot } from "@/lib/media";
import { Frame } from "@/components/media/Frame";

type Props = {
  slot: MediaSlot;
  /** Proporção do recorte. O catálogo usa 4:5; a página de produto, 3:4. */
  proporcao?: "4/5" | "3/4";
  /** Primeira fila da vitrine — carrega sem esperar o scroll. */
  priority?: boolean;
  /** Escurece e dessatura: peça esgotada. */
  esmaecida?: boolean;
  className?: string;
};

/**
 * PRODUCT IMAGE
 *
 * Casca fina sobre o <Frame> que a home já usa — mesmo <picture> com AVIF e
 * WebP, mesmas dimensões nativas reservando o espaço, mesmo enquadramento por
 * breakpoint. O que ela acrescenta é o vocabulário do catálogo: a proporção
 * fixa, o fundo de areia sob a fotografia (sem foto o quadro não vira buraco
 * branco) e o gesto de aproximação no hover.
 *
 * Sem `base`, o Frame desenha a placa tonal anotada — o espaço da fotografia
 * que ainda não chegou continua ocupando o lugar certo.
 */
export function ProductImage({
  slot,
  proporcao = "4/5",
  priority = false,
  esmaecida = false,
  className = "",
}: Props) {
  return (
    <div
      className={`relative overflow-hidden bg-areia ${
        proporcao === "4/5" ? "aspect-[4/5]" : "aspect-[3/4]"
      } ${className}`}
    >
      <Frame
        slot={slot}
        priority={priority}
        className="h-full w-full"
        mediaClassName={`transition-[transform,filter] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none group-hover:scale-[1.03] ${
          esmaecida ? "opacity-70 saturate-[0.55]" : ""
        }`}
      />
    </div>
  );
}
