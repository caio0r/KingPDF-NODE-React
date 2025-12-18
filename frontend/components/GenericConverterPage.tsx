"use client";

import { useState } from 'react';
import axios from 'axios';
import { ArrowRight, Download, Loader2, ArrowLeft, CheckCircle, Upload, LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ConversionProgress from '@/components/ConversionProgress';

interface GenericConverterPageProps {
    title: string;
    description: string;
    endpoint: string;
    acceptedFormats: string[]; // e.g., ['.pdf'] or ['.docx', '.doc']
    inputLabel: string;
    Icon: LucideIcon;
    color: 'blue' | 'green' | 'orange' | 'yellow' | 'red';
    downloadLabel: string;
    resultExtension: string; // ".docx"
    warningMessage?: string;
}

export default function GenericConverterPage({
    title,
    description,
    endpoint,
    acceptedFormats,
    inputLabel,
    Icon,
    color,
    downloadLabel,
    resultExtension,
    warningMessage = "Atenção ! Erros de conversão são possíveis. Verifique os documentos após termino do processo."
}: GenericConverterPageProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [resultFilename, setResultFilename] = useState<string>("");

    // Color maps
    const colorMap = {
        blue: {
            bg: 'bg-blue-600', hover: 'hover:bg-blue-700', text: 'text-blue-500',
            border: 'hover:border-blue-500', shadow: 'shadow-blue-500/30',
            groupHover: 'group-hover:text-blue-500'
        },
        green: {
            bg: 'bg-green-600', hover: 'hover:bg-green-700', text: 'text-green-500',
            border: 'hover:border-green-500', shadow: 'shadow-green-500/30',
            groupHover: 'group-hover:text-green-500'
        },
        orange: {
            bg: 'bg-orange-600', hover: 'hover:bg-orange-700', text: 'text-orange-500',
            border: 'hover:border-orange-500', shadow: 'shadow-orange-500/30',
            groupHover: 'group-hover:text-orange-500'
        },
        yellow: {
            bg: 'bg-yellow-600', hover: 'hover:bg-yellow-700', text: 'text-yellow-600',
            border: 'hover:border-yellow-500', shadow: 'shadow-yellow-500/30',
            groupHover: 'group-hover:text-yellow-500'
        },
        red: {
            bg: 'bg-red-600', hover: 'hover:bg-red-700', text: 'text-red-500',
            border: 'hover:border-red-500', shadow: 'shadow-red-500/30',
            groupHover: 'group-hover:text-red-500'
        },
    };

    const theme = colorMap[color];

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            const fileExtension = '.' + selectedFile.name.split('.').pop()?.toLowerCase();

            if (acceptedFormats.includes(fileExtension) || acceptedFormats.includes(fileExtension.replace('.', ''))) {
                setFile(selectedFile);
                setError(null);
            } else {
                setError(`Formato inválido. Por favor envie: ${acceptedFormats.join(', ')}`);
            }
        }
    };

    const handleConvert = async () => {
        if (!file) return;

        setIsConverting(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(`http://localhost:8000${endpoint}`, formData, {
                responseType: 'blob',
            });

            // Handle ZIP responses correctly if resultExtension is dynamic or checked from header, 
            // but for generic use we stick to props for now or detect zip.
            // Simplified for typical single-file conversion

            const isZip = response.headers['content-type']?.includes('zip');
            const finalExtension = isZip ? '.zip' : resultExtension;

            const url = window.URL.createObjectURL(new Blob([response.data]));
            setDownloadUrl(url);

            // Generate nice filename
            const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            setResultFilename(`${baseName}${finalExtension}`);

        } catch (err) {
            console.error(err);
            setError("Ocorreu um erro durante a conversão. Por favor, tente novamente.");
        } finally {
            setIsConverting(false);
        }
    };

    const reset = () => {
        setFile(null);
        setDownloadUrl(null);
        setError(null);
        setResultFilename("");
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
                        {title}
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        {description}
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100 dark:border-gray-700">
                    {!downloadUrl ? (
                        <div className="space-y-8">
                            {/* File Upload */}
                            {!file ? (
                                <label className="cursor-pointer group">
                                    <div className={`border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-12 text-center ${theme.border} transition-all`}>
                                        <Upload className={`w-16 h-16 mx-auto mb-4 text-gray-400 ${theme.groupHover} transition-colors`} />
                                        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            {inputLabel}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Aceita: {acceptedFormats.join(', ')}
                                        </p>
                                    </div>
                                    <input
                                        type="file"
                                        accept={acceptedFormats.join(',')}
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                </label>
                            ) : (
                                <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 bg-gray-50 dark:bg-gray-700/50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            {/* We render the Icon passed as prop */}
                                            <Icon className={theme.text} size={32} />
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                                                <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setFile(null)}
                                            className="text-gray-500 hover:text-red-500 transition-colors"
                                        >
                                            Remover
                                        </button>
                                    </div>
                                </div>
                            )}

                            {file && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex justify-center flex-col items-center"
                                >
                                    <button
                                        onClick={handleConvert}
                                        disabled={isConverting}
                                        className={`flex items-center px-8 py-4 ${theme.bg} ${theme.hover} text-white rounded-xl font-semibold text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg ${theme.shadow} mb-6`}
                                    >
                                        {isConverting ? (
                                            <>
                                                <Loader2 className="animate-spin mr-2" />
                                                Convertendo...
                                            </>
                                        ) : (
                                            <>
                                                Converter agora
                                                <ArrowRight className="ml-2" />
                                            </>
                                        )}
                                    </button>

                                    {/* Progress Bar */}
                                    {isConverting && (
                                        <div className="w-full mb-6">
                                            <ConversionProgress isConverting={isConverting} color={theme.bg} />
                                        </div>
                                    )}

                                    {/* Warning Message */}
                                    {warningMessage && (
                                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 text-yellow-700 dark:text-yellow-400 px-4 py-3 rounded-xl text-sm text-center max-w-md">
                                            <p className="font-semibold"> Atenção !</p>
                                            <p>{warningMessage}</p>
                                        </div>
                                    )}
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
                                    Conversão Concluída!
                                </h3>
                                <p className="text-gray-500">
                                    Seu arquivo está pronto para download.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <a
                                    href={downloadUrl}
                                    download={resultFilename}
                                    className="flex items-center px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-lg transition-all shadow-lg shadow-green-500/30"
                                >
                                    <Download className="mr-2" />
                                    {downloadLabel}
                                </a>
                                <button
                                    onClick={reset}
                                    className="px-8 py-4 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-semibold transition-colors"
                                >
                                    Converter Outro
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
