interface RoleCardProps {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
  selected?: boolean;
}

export function RoleCard({ icon, title, description, onClick, selected = false }: RoleCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full min-h-[140px] bg-white rounded-2xl shadow-md p-6
        flex flex-col items-center justify-center gap-3
        transition-all duration-200 ease-in-out
        hover:scale-105 hover:shadow-xl
        active:scale-95
        ${selected ? 'ring-4 ring-piano-purple shadow-xl' : 'ring-1 ring-gray-200'}
      `}
    >
      <div className="text-5xl" role="img" aria-label={title}>
        {icon}
      </div>
      <h3 className="font-heading text-xl font-bold text-gray-900">{title}</h3>
      <p className="text-sm text-muted-foreground text-center">{description}</p>
    </button>
  );
}
