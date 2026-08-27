import Link from "next/link";

const links = [
	["Beranda", "/"],
	["Repository", "/admin/users"],
	["Dosen", "/lecturers"],
	["Statistik", "/statistics"],
] as const;

export function Navbar() {
	return (
		<header className="site-header">
			<div className="site-header-inner">
				
				<nav className="main-nav" aria-label="Navigasi utama">
					{links.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}
				</nav>
				<Link href="/admin/users/create" className="login-button">Tambah User</Link>
			</div>
		</header>
	);
}
