import MaterialIcon from "./MaterialIcon.jsx";

/**
 * Barra fixa do topo.
 *
 * Contém apenas a identificação do projeto. Busca, notificações e perfil foram
 * removidos: o backend não expõe nada que os alimente.
 */
export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.6)]">
      <div className="h-20 w-full px-gutter flex items-center gap-space-sm">
        <MaterialIcon name="emoji_events" className="text-secondary text-[30px]" filled />
        <div className="flex flex-col">
          <span className="font-headline-sm text-headline-sm uppercase tracking-widest text-primary leading-tight">
            Oscars
          </span>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-outline">
            Premiações da Academia
          </span>
        </div>
      </div>
    </header>
  );
}
