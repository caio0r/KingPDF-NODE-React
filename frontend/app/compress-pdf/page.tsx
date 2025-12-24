"use client";

import { useState } from 'react';
import FileUploader from '@/components/FileUploader';
import axios from 'axios';
import { ArrowRight, Download, Loader2, ArrowLeft, CheckCircle, Minimize2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CompressPdf() {
    const [file, setFile] = useState<File | null>(null);
    const [isCompressing, setIsCompressing] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<{ original: number; compressed: number } | null>(null);

    const handleCompress = async () => {
        if (!file) return;

        setIsCompressing(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:8999/compress/compress-pdf', formData, {
                responseType: 'blob',
            });

            const compressedSize = response.data.size;
            setStats({
                original: file.size,
                compressed: compressedSize
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            setDownloadUrl(url);
        } catch (err) {
            console.error(err);
            setError("Ocorreu um erro durante a compressão. Por favor, tente novamente.");
        } finally {
            setIsCompressing(false);
        }
    };

    const reset = () => {
        setFile(null);
        setDownloadUrl(null);
        setError(null);
        setStats(null);
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <Link
                    href="/"
                    className="inline-flex items-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Voltar ao Início
                </Link>

                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Comprimir PDF
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Reduza o tamanho do seu arquivo PDF mantendo a qualidade.
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100 dark:border-gray-700">
                    {!downloadUrl ? (
                        <div className="space-y-8">
                            <FileUploader
                                onFileSelect={setFile}
                                selectedFile={file}
                                onClear={() => setFile(null)}
                            />

                            {file && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex justify-center"
                                >
                                    <button
                                        onClick={handleCompress}
                                        disabled={isCompressing}
                                        className="flex items-center px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-red-500/30"
                                    >
                                        {isCompressing ? (
                                            <>
                                                <Loader2 className="animate-spin mr-2" />
                                                Comprimindo...
                                            </>
                                        ) : (
                                            <>
                                                Comprimir PDF
                                                <Minimize2 className="ml-2" />
                                            </>
                                        )}
                                    </button>
                                </motion.div>
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
                                    Compressão Concluída!
                                </h3>
                                {stats && (
                                    <div className="flex justify-center items-center space-x-4 mt-4 text-sm">
                                        <span className="text-gray-500 line-through">{formatSize(stats.original)}</span>
                                        <ArrowRight size={16} className="text-gray-400" />
                                        <span className="text-green-600 font-bold">{formatSize(stats.compressed)}</span>
                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                                            -{Math.round((1 - stats.compressed / stats.original) * 100)}%
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <a
                                    href={downloadUrl}
                                    download={`compressed_${file?.name}`}
                                    className="flex items-center px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-lg transition-all shadow-lg shadow-green-500/30"
                                >
                                    <Download className="mr-2" />
                                    Baixar PDF Comprimido
                                </a>
                                <button
                                    onClick={reset}
                                    className="px-8 py-4 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-semibold transition-colors"
                                >
                                    Comprimir Outro
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
