import NavbarClient from "./NavbarClient";

export default function Navbar({
  onOpenSidebar,
  currentPath,
}: {
  onOpenSidebar: () => void;
  currentPath: string;
}) {
  return (
    <nav className="w-full h-16 bg-white text-black md:bg-transparent">
      <NavbarClient onOpenSidebar={onOpenSidebar} currentPath={currentPath} />
    </nav>
  );
}
