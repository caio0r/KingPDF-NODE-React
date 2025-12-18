"use client";

import { useState, useEffect } from 'react';
import FileUploader from '@/components/FileUploader';
import axios from 'axios';
import { ArrowRight, Download, Loader2, ArrowLeft, CheckCircle, Scissors, Check } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Document, Page, pdfjs } from 'react-pdf';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function SplitPdf() {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [numPages, setNumPages] = useState<number>(0);
    const [selectedPages, setSelectedPages] = useState<number[]>([]);
    const [mergePages, setMergePages] = useState(true);
    const [rangeInput, setRangeInput] = useState("");

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        // Default select all? Or none? Let's select none initially or maybe all.
        // iLovePDF selects all by default usually or lets you click.
        // Let's start with none selected to encourage interaction.
        setSelectedPages([]);
    };

    const togglePageSelection = (pageNum: number) => {
        setSelectedPages(prev => {
            if (prev.includes(pageNum)) {
                return prev.filter(p => p !== pageNum);
            } else {
                return [...prev, pageNum].sort((a, b) => a - b);
            }
        });
    };

    // Update range input when selection changes via clicks
    useEffect(() => {
        // Simple representation: comma separated
        setRangeInput(selectedPages.join(", "));
    }, [selectedPages]);

    const handleRangeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setRangeInput(val);

        // Try to parse and update selectedPages visually
        // This is a basic parser, might need more robustness
        try {
            const parts = val.split(',');
            const newSelection = new Set<number>();
            parts.forEach(part => {
                part = part.trim();
                if (part.includes('-')) {
                    const [start, end] = part.split('-').map(Number);
                    if (!isNaN(start) && !isNaN(end)) {
                        for (let i = start; i <= end; i++) {
                            if (i >= 1 && i <= numPages) newSelection.add(i);
                        }
                    }
                } else {
                    const p = Number(part);
                    if (!isNaN(p) && p >= 1 && p <= numPages) newSelection.add(p);
                }
            });
            setSelectedPages(Array.from(newSelection).sort((a, b) => a - b));
        } catch (e) {
            // Ignore parse errors while typing
        }
    };

    const handleSplit = async () => {
        if (!file || selectedPages.length === 0) return;

        setIsProcessing(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);
        // Convert array [1, 2, 3] to string "1-3" or "1,2,3"
        // For simplicity, sending "1,2,3"
        formData.append('pages', selectedPages.join(','));
        formData.append('merge', mergePages.toString());

        try {
            const response = await axios.post('http://localhost:8000/split/split-pdf', formData, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            setDownloadUrl(url);
        } catch (err) {
            console.error(err);
            setError("Ocorreu um erro durante a divisão. Por favor, tente novamente.");
        } finally {
            setIsProcessing(false);
        }
    };

    const reset = () => {
        setFile(null);
        setDownloadUrl(null);
        setError(null);
        setNumPages(0);
        setSelectedPages([]);
        setRangeInput("");
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <Link
                    href="/"
                    className="inline-flex items-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Voltar ao Início
                </Link>

                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Dividir PDF
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Selecione intervalos de páginas ou extraia todas as páginas do seu PDF.
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100 dark:border-gray-700">
                    {!downloadUrl ? (
                        <div className="space-y-8">
                            {!file ? (
                                <FileUploader
                                    onFileSelect={setFile}
                                    selectedFile={file}
                                    onClear={() => setFile(null)}
                                />
                            ) : (
                                <div className="flex flex-col lg:flex-row gap-8">
                                    {/* Left: Thumbnails */}
                                    <div className="flex-1 bg-gray-100 dark:bg-gray-900 rounded-2xl p-6 max-h-[600px] overflow-y-auto">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-semibold text-gray-700 dark:text-gray-300">Selecionar Páginas</h3>
                                            <button
                                                onClick={() => setFile(null)}
                                                className="text-sm text-red-500 hover:text-red-600"
                                            >
                                                Mudar Arquivo
                                            </button>
                                        </div>

                                        <Document
                                            file={file}
                                            onLoadSuccess={onDocumentLoadSuccess}
                                            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
                                        >
                                            {Array.from(new Array(numPages), (el, index) => (
                                                <div
                                                    key={`page_${index + 1}`}
                                                    onClick={() => togglePageSelection(index + 1)}
                                                    className={`relative cursor-pointer group transition-all duration-200 ${selectedPages.includes(index + 1) ? 'ring-4 ring-red-500 rounded-lg transform scale-95' : 'hover:opacity-80'}`}
                                                >
                                                    <Page
                                                        pageNumber={index + 1}
                                                        width={150}
                                                        renderTextLayer={false}
                                                        renderAnnotationLayer={false}
                                                        className="rounded-lg shadow-sm overflow-hidden"
                                                    />
                                                    <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                                                        {index + 1}
                                                    </div>
                                                    {selectedPages.includes(index + 1) && (
                                                        <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1">
                                                            <Check size={12} />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </Document>
                                    </div>

                                    {/* Right: Controls */}
                                    <div className="w-full lg:w-80 space-y-6">
                                        <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
                                            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Opções de Divisão</h3>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        Páginas para Extrair
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={rangeInput}
                                                        onChange={handleRangeInputChange}
                                                        placeholder="ex: 1-5, 8, 11-13"
                                                        className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                                                    />
                                                </div>

                                                <div className="flex items-center space-x-3">
                                                    <input
                                                        type="checkbox"
                                                        id="merge"
                                                        checked={mergePages}
                                                        onChange={(e) => setMergePages(e.target.checked)}
                                                        className="w-5 h-5 text-red-600 rounded focus:ring-red-500 border-gray-300"
                                                    />
                                                    <label htmlFor="merge" className="text-sm text-gray-700 dark:text-gray-300">
                                                        Mesclar páginas extraídas em um PDF
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleSplit}
                                            disabled={isProcessing || selectedPages.length === 0}
                                            className="w-full flex items-center justify-center px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-red-500/30"
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <Loader2 className="animate-spin mr-2" />
                                                    Dividindo...
                                                </>
                                            ) : (
                                                <>
                                                    Dividir PDF
                                                    <Scissors className="ml-2" />
                                                </>
                                            )}
                                        </button>

                                        {selectedPages.length === 0 && (
                                            <p className="text-sm text-center text-gray-500">
                                                Por favor, selecione pelo menos uma página para dividir.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="text-center text-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl">
                                    {error}
                                </div>
                            )}
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center space-y-8 py-8"
                        >
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle size={40} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    Divisão Concluída!
                                </h3>
                                <p className="text-gray-500">
                                    Seu PDF foi processado com sucesso.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <a
                                    href={downloadUrl}
                                    download={mergePages ? `split_${file?.name}` : `split_${file?.name?.replace('.pdf', '')}.zip`}
                                    className="flex items-center px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-lg transition-all shadow-lg shadow-green-500/30"
                                >
                                    <Download className="mr-2" />
                                    Baixar {mergePages ? 'PDF' : 'ZIP'}
                                </a>
                                <button
                                    onClick={reset}
                                    className="px-8 py-4 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-semibold transition-colors"
                                >
                                    Dividir Outro
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
