"use client";

import { useState } from 'react';
import FileUploader from '@/components/FileUploader';
import axios from 'axios';
import { ArrowRight, Download, Loader2, ArrowLeft, CheckCircle, Lock, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ProtectPdf() {
    const [file, setFile] = useState<File | null>(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleProtect = async () => {
        if (!file) return;

        // Validations
        if (!password) {
            setError("Por favor, insira uma senha.");
            return;
        }

        if (password.length < 4) {
            setError("A senha deve ter pelo menos 4 caracteres.");
            return;
        }

        if (password !== confirmPassword) {
            setError("As senhas não coincidem.");
            return;
        }

        setIsProcessing(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('password', password);

        try {
            const response = await axios.post('http://localhost:8000/protect/protect-pdf', formData, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            setDownloadUrl(url);
        } catch (err) {
            console.error(err);
            setError("Ocorreu um erro ao proteger o PDF. Por favor, tente novamente.");
        } finally {
            setIsProcessing(false);
        }
    };

    const reset = () => {
        setFile(null);
        setPassword('');
        setConfirmPassword('');
        setDownloadUrl(null);
        setError(null);
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
                        Proteger PDF com Senha
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Adicione uma senha ao seu PDF para proteger informações confidenciais.
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
                                    className="space-y-6"
                                >
                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-2xl space-y-4">
                                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">
                                            Defina uma senha de proteção
                                        </h3>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Senha
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="Digite uma senha (mínimo 4 caracteres)"
                                                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all text-gray-900 dark:text-white"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                                >
                                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Confirmar Senha
                                            </label>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Digite a senha novamente"
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all text-gray-900 dark:text-white"
                                            />
                                        </div>

                                        {password && (
                                            <div className="text-sm">
                                                <p className="text-gray-600 dark:text-gray-400">
                                                    Força da senha:
                                                    <span className={`ml-2 font-semibold ${password.length < 6 ? 'text-red-500' :
                                                            password.length < 10 ? 'text-yellow-500' :
                                                                'text-green-500'
                                                        }`}>
                                                        {password.length < 6 ? 'Fraca' :
                                                            password.length < 10 ? 'Média' :
                                                                'Forte'}
                                                    </span>
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-center">
                                        <button
                                            onClick={handleProtect}
                                            disabled={isProcessing || !password || !confirmPassword}
                                            className="flex items-center px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-purple-500/30"
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <Loader2 className="animate-spin mr-2" />
                                                    Protegendo...
                                                </>
                                            ) : (
                                                <>
                                                    Proteger PDF
                                                    <Lock className="ml-2" />
                                                </>
                                            )}
                                        </button>
                                    </div>
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
                                    PDF Protegido com Sucesso!
                                </h3>
                                <p className="text-gray-500">
                                    Seu PDF agora está protegido com senha e pronto para download.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <a
                                    href={downloadUrl}
                                    download={`${file?.name.replace('.pdf', '')}_protected.pdf`}
                                    className="flex items-center px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-lg transition-all shadow-lg shadow-green-500/30"
                                >
                                    <Download className="mr-2" />
                                    Baixar PDF Protegido
                                </a>
                                <button
                                    onClick={reset}
                                    className="px-8 py-4 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-semibold transition-colors"
                                >
                                    Proteger Outro
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
