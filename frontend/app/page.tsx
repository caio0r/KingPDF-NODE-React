import Link from 'next/link';
import Image from 'next/image';
import {
  FileText,
  Minimize2,
  Edit,
  Merge,
  Scissors,
  FileSpreadsheet,
  Presentation,
  Image as ImageIcon,
  Lock,
  Unlock
} from 'lucide-react';

export default function Home() {
  const features = [
    {
      title: "Agrupar PDF",
      description: "Mescle PDFs na ordem que você quiser com o juntador de PDF mais fácil disponível.",
      icon: <Merge className="w-10 h-10 text-white" />,
      href: "/merge-pdf",
      active: true,
      color: "bg-red-500",
    },
    {
      title: "Desagrupar PDF",
      description: "Separe uma página ou um conjunto inteiro para conversão fácil em arquivos PDF independentes.",
      icon: <Scissors className="w-10 h-10 text-white" />,
      href: "/split-pdf",
      active: true,
      color: "bg-red-500",
    },
    {
      title: "Comprimir PDF",
      description: "Diminua o tamanho do seu arquivo PDF, mantendo a melhor qualidade possível.",
      icon: <Minimize2 className="w-10 h-10 text-white" />,
      href: "/compress-pdf",
      active: true,
      color: "bg-red-500",
    },
    {
      title: "PDF para Word",
      description: "Converta facilmente seus arquivos PDF para documentos DOCX editáveis.",
      icon: <FileText className="w-10 h-10 text-white" />,
      href: "/convert/pdf-to-word",
      active: true,
      color: "bg-blue-500",
    },
    {
      title: "PDF para PowerPoint",
      description: "Transforme seus arquivos PDF em apresentações PPT e PPTX fáceis de editar.",
      icon: <Presentation className="w-10 h-10 text-white" />,
      href: "/convert/pdf-to-pptx",
      active: true,
      color: "bg-orange-500",
    },
    {
      title: "PDF para Excel",
      description: "Extraia dados diretamente de PDFs para planilhas Excel em poucos segundos.",
      icon: <FileSpreadsheet className="w-10 h-10 text-white" />,
      href: "/convert/pdf-to-excel",
      active: true,
      color: "bg-green-500",
    },
    {
      title: "Word para PDF",
      description: "Torne arquivos DOC e DOCX fáceis de ler convertendo-os para PDF.",
      icon: <FileText className="w-10 h-10 text-white" />,
      href: "/convert/word-to-pdf",
      active: true,
      color: "bg-blue-700",
    },
    {
      title: "PowerPoint para PDF",
      description: "Torne apresentações PPT e PPTX fáceis de visualizar convertendo-as para PDF.",
      icon: <Presentation className="w-10 h-10 text-white" />,
      href: "/convert/pptx-to-pdf",
      active: true,
      color: "bg-orange-700",
    },
    {
      title: "Excel para PDF",
      description: "Torne planilhas EXCEL fáceis de ler convertendo-as para PDF.",
      icon: <FileSpreadsheet className="w-10 h-10 text-white" />,
      href: "/convert/excel-to-pdf",
      active: true,
      color: "bg-green-700",
    },
    {
      title: "Editar PDF",
      description: "Adicione texto, imagens, formas ou anotações à mão livre em um documento PDF.",
      icon: <Edit className="w-10 h-10 text-white" />,
      href: "/edit-pdf",
      active: true,
      color: "bg-purple-500",
    },
    {
      title: "PDF para JPG",
      description: "Converta cada página do PDF em um JPG ou extraia todas as imagens contidas em um PDF.",
      icon: <ImageIcon className="w-10 h-10 text-white" />,
      href: "/convert/pdf-to-jpg",
      active: true,
      color: "bg-yellow-500",
    },
    {
      title: "Proteger PDF",
      description: "Proteja arquivos PDF com uma senha. Criptografe documentos PDF para impedir acesso não autorizado.",
      icon: <Lock className="w-10 h-10 text-white" />,
      href: "/protect-pdf",
      active: true,
      color: "bg-gray-700",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-6">
            Todas as ferramentas que você precisa para trabalhar com PDFs em um só lugar
          </h1>
          <div className="flex justify-center mt-8">
            <Image
              src="/sirio-logo.png"
              alt="Sírio-Libanês"
              width={400}
              height={120}
              className="object-contain opacity-90 hover:opacity-100 transition-opacity"
            />
          </div>
        </div>
      </div>

      {/* Grid Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Link
              href={feature.href}
              key={index}
              className={`group relative p-8 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-start h-full ${!feature.active ? 'opacity-75' : ''}`}
            >
              <div className={`p-3 rounded-xl mb-6 ${feature.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3 group-hover:text-red-500 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
              {!feature.active && (
                <div className="absolute top-4 right-4">
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs font-bold px-2 py-1 rounded-full">
                    EM BREVE
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
