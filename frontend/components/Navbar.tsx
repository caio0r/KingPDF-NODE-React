import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
    return (
        <nav className="bg-white border-b border-gray-100 dark:bg-gray-900 dark:border-gray-800 sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-3">
                    <div className="relative w-10 h-10">
                        <Image
                            src="/leao.png"
                            alt="KingPDF Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                        King<span className="text-red-500">PDF</span>
                    </span>
                </Link>

                <div className="hidden md:flex items-center space-x-8">
                    <Link href="/merge-pdf" className="text-gray-600 hover:text-red-500 font-medium transition-colors">Juntar PDF</Link>
                    <Link href="/split-pdf" className="text-gray-600 hover:text-red-500 font-medium transition-colors">Dividir PDF</Link>
                    <Link href="/compress-pdf" className="text-gray-600 hover:text-red-500 font-medium transition-colors">Comprimir PDF</Link>
                    <Link href="/convert/pdf-to-word" className="text-gray-600 hover:text-red-500 font-medium transition-colors">Converter PDF</Link>
                </div>

                <div className="flex items-center space-x-4">
                    {/* Login/Signup removed as requested */}
                </div>
            </div>
        </nav>
    );
}
