import { createClient } from "@/lib/supabase/server";
import { User } from "lucide-react";

interface HeaderProps {
  title: string;
  description?: string;
}

export async function Header({ title, description }: HeaderProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="h-14 sm:h-16 flex items-center justify-between px-4 sm:px-6 border-b border-[#1E1E2A] bg-[#0D0D14]/50 backdrop-blur-sm shrink-0">
      <div>
        <h1 className="text-sm sm:text-base font-semibold text-[#F0F0F5]">{title}</h1>
        {description && (
          <p className="text-xs text-[#6B7280] mt-0.5 hidden sm:block">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-[#20b2aa]/15 flex items-center justify-center shrink-0">
          <User className="w-4 h-4 text-[#20b2aa]" />
        </div>
        <span className="hidden sm:block text-sm text-[#9CA3AF] max-w-[160px] truncate">
          {user?.email}
        </span>
      </div>
    </header>
  );
}
