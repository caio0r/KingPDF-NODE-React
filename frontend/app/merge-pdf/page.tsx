"use client";

import { useState } from 'react';
import axios from 'axios';
import { ArrowRight, Download, Loader2, ArrowLeft, CheckCircle, Merge, Plus, X, FileText, GripVertical } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
    rectSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Item Component
function SortableItem({ id, file, onRemove }: { id: string, file: File, onRemove: (id: string) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="relative group bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center gap-2 h-48 w-full cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
        >
            <button
                onClick={(e) => {
                    e.stopPropagation(); // Prevent drag start
                    onRemove(id);
                }}
                className="absolute top-2 right-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors z-10"
            >
                <X size={16} />
            </button>

            <div className="w-16 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-2">
                <FileText className="text-gray-400" size={32} />
            </div>

            <p className="text-xs text-center text-gray-600 dark:text-gray-300 font-medium truncate w-full px-2">
                {file.name}
            </p>
            <p className="text-[10px] text-gray-400">
                {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
        </div>
    );
}

export default function MergePdf() {
    const [files, setFiles] = useState<{ id: string, file: File }[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files).map(file => ({
                id: Math.random().toString(36).substr(2, 9),
                file
            }));
            setFiles(prev => [...prev, ...newFiles]);
            setError(null);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setFiles((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const removeFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const handleMerge = async () => {
        if (files.length < 2) {
            setError("Por favor, selecione pelo menos 2 arquivos PDF para agrupar.");
            return;
        }

        setIsProcessing(true);
        setError(null);

        const formData = new FormData();
        files.forEach(item => {
            formData.append('files', item.file);
        });

        try {
            const response = await axios.post('http://localhost:8000/merge/merge-pdf', formData, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            setDownloadUrl(url);
        } catch (err) {
            console.error(err);
            setError("Ocorreu um erro durante a juncão. Por favor, tente novamente.");
        } finally {
            setIsProcessing(false);
        }
    };

    const reset = () => {
        setFiles([]);
        setDownloadUrl(null);
        setError(null);
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
                        Agrupar PDF
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Combine PDFs na ordem que você quiser com o agrupador de PDF mais fácil disponível.
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100 dark:border-gray-700 min-h-[500px]">
                    {!downloadUrl ? (
                        <div className="flex flex-col h-full">
                            {/* File Grid */}
                            <div className="flex-1 mb-8">
                                {files.length === 0 ? (
                                    <div className="h-64 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center text-gray-500">
                                        <Merge size={48} className="mb-4 text-gray-400" />
                                        <p className="text-lg font-medium">Nenhum arquivo selecionado</p>
                                        <p className="text-sm">Adicione arquivos PDF para começar a agrupar</p>
                                    </div>
                                ) : (
                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <SortableContext
                                            items={files.map(f => f.id)}
                                            strategy={rectSortingStrategy}
                                        >
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                                {files.map((item) => (
                                                    <SortableItem key={item.id} id={item.id} file={item.file} onRemove={removeFile} />
                                                ))}

                                                {/* Add More Button in Grid */}
                                                <label className="cursor-pointer bg-gray-50 dark:bg-gray-700/50 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center h-48 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                                    <div className="bg-red-500 rounded-full p-2 mb-2 text-white">
                                                        <Plus size={24} />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Adicionar outro PDF</span>
                                                    <input
                                                        type="file"
                                                        accept=".pdf"
                                                        multiple
                                                        onChange={handleFileSelect}
                                                        className="hidden"
                                                    />
                                                </label>
                                            </div>
                                        </SortableContext>
                                    </DndContext>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col items-center space-y-4">
                                {files.length === 0 && (
                                    <label className="cursor-pointer px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-lg transition-all shadow-lg shadow-red-500/30 flex items-center">
                                        <Plus className="mr-2" />
                                        Selecionar Arquivos PDF
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            multiple
                                            onChange={handleFileSelect}
                                            className="hidden"
                                        />
                                    </label>
                                )}

                                {files.length > 0 && (
                                    <button
                                        onClick={handleMerge}
                                        disabled={isProcessing || files.length < 2}
                                        className="px-12 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-xl shadow-red-500/30 flex items-center"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="animate-spin mr-2" />
                                                Agrupando PDFs...
                                            </>
                                        ) : (
                                            <>
                                                Agrupar PDFs
                                                <ArrowRight className="ml-2" />
                                            </>
                                        )}
                                    </button>
                                )}

                                {error && (
                                    <div className="text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg">
                                        {error}
                                    </div>
                                )}
                            </div>
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
                                    Junção Concluída!
                                </h3>
                                <p className="text-gray-500">
                                    Seus PDFs foram combinados com sucesso.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <a
                                    href={downloadUrl}
                                    download="merged_document.pdf"
                                    className="flex items-center px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-lg transition-all shadow-lg shadow-green-500/30"
                                >
                                    <Download className="mr-2" />
                                    Baixar PDF Mesclado
                                </a>
                                <button
                                    onClick={reset}
                                    className="px-8 py-4 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-semibold transition-colors"
                                >
                                    Agrupar outro PDF
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
