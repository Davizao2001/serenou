/**
 * ACORDEÃO
 *
 * `<details>` nativo. Abre sem JavaScript, é focável pelo teclado, anuncia o
 * estado sozinho para o leitor de tela e continua funcionando se o pacote do
 * navegador falhar. O triângulo do sistema sai de cena em app/globals.css e
 * no lugar entra um chevron que gira meia volta ao abrir.
 *
 * Chevron e não "+ que vira ×": numa lista de seções, um × ao lado de um
 * título aberto lê como "fechar isto para sempre" ou "remover", que é o que
 * ele significa em todo o resto da web. O chevron só diz para onde a seção
 * vai — e é o mesmo gesto do menu do site.
 *
 * Servidor, não cliente: um acordeão que precisa de React para abrir é um
 * acordeão que não abre enquanto a página hidrata.
 */
export function Acordeao({
  titulo,
  aberto = false,
  children,
}: {
  titulo: string;
  /** O primeiro da coluna abre sozinho: dá a ver que a lista é abrível. */
  aberto?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details className="detalhe group border-b border-areia-forte/70 last:border-b-0" open={aberto}>
      <summary className="t-eyebrow flex cursor-pointer items-center justify-between gap-3 py-[1.125rem] text-[0.71875rem] text-carvao transition-colors duration-200 hover:text-carvao-medio focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oliva focus-visible:ring-offset-2 focus-visible:ring-offset-linho">
        {titulo}
        <svg
          viewBox="0 0 16 16"
          aria-hidden="true"
          className="h-3 w-3 shrink-0 fill-none stroke-carvao-fraco transition-transform duration-300 ease-out group-open:-rotate-180"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m3.5 6 4.5 4.5L12.5 6" />
        </svg>
      </summary>
      <div className="pb-6">{children}</div>
    </details>
  );
}
