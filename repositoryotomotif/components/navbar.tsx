import Link from "next/link";

const links = [
	["Beranda", "/"],
	["Repository", "/users"],
	["Dosen", "/lecturers"],
	["Statistik", "/statistics"],
] as const;

export function Navbar() {
	return (
		<header className="site-header">
			<div className="site-header-inner">
				<Link href="/" className="brand">
					<span className="brand-mark">R</span>
					<span><strong>Repository JTO</strong><small>Uninversitas Negeri Padang</small></span>
				</Link>
				<nav className="main-nav" aria-label="Navigasi utama">
					{links.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}
				</nav>
				<Link href="/users/create" className="login-button">Tambah User</Link>
			</div>
		</header>
	);
}
