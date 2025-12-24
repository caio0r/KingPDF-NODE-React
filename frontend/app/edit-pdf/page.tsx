"use client";

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
    ArrowLeft, Save, Type, Image as ImageIcon, ZoomIn, ZoomOut,
    ChevronLeft, ChevronRight, X, Upload, Hand, PenTool, MousePointer2, Eraser
} from 'lucide-react';
import Link from 'next/link';
import { pdfjs, Document, Page } from 'react-pdf';
import { Rnd } from 'react-rnd';
import SignatureCanvas from 'react-signature-canvas';

// Setup PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

interface TextEdit {
    id: string;
    pageIndex: number;
    text: string;
    x: number; // percentage 0-1
    y: number; // percentage 0-1
    fontSize: number;
    color: string;
}

interface ImageEdit {
    id: string;
    pageIndex: number;
    file: File;
    previewUrl: string;
    x: number; // percentage 0-1
    y: number; // percentage 0-1
    width: number; // percentage 0-1
    height: number; // percentage 0-1
    aspectRatio: number;
}

interface RectEdit {
    id: string;
    pageIndex: number;
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
}

export default function EditPdfPage() {
    const [file, setFile] = useState<File | null>(null);
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);

    // Tools: 'select' (cursor), 'text', 'image', 'draw', 'eraser'
    const [activeTool, setActiveTool] = useState<'select' | 'text' | 'image' | 'draw' | 'eraser'>('select');

    // Edits state
    const [edits, setEdits] = useState<{ texts: TextEdit[], images: ImageEdit[], rects: RectEdit[] }>({ texts: [], images: [], rects: [] });
    const [isSaving, setIsSaving] = useState(false);

    // Drawing state
    const sigCanvasRef = useRef<SignatureCanvas>(null);
    const [isDrawingOpen, setIsDrawingOpen] = useState(false);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 }); // Explicit size for canvas

    // Refs
    const pageRef = useRef<HTMLDivElement>(null);
    const [pageSize, setPageSize] = useState({ width: 0, height: 0 });

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files[0]) {
            setFile(files[0]);
            setEdits({ texts: [], images: [], rects: [] });
            setCurrentPage(1);
        }
    };

    // --- Helper to switch tools cleanly ---
    const switchTool = (tool: 'select' | 'text' | 'image' | 'draw' | 'eraser') => {
        if (tool === 'draw') {
            setIsDrawingOpen(true);
            // When switching to draw, we need to ensure the container size is updated
            if (pageRef.current) {
                setContainerSize({
                    width: pageRef.current.offsetWidth,
                    height: pageRef.current.offsetHeight
                });
            }
        } else {
            setIsDrawingOpen(false);
        }

        setActiveTool(tool);
    };

    // --- Actions ---

    const addText = () => {
        const id = Date.now().toString();
        const newText: TextEdit = {
            id,
            pageIndex: currentPage - 1,
            text: "Texto",
            x: 0.45,
            y: 0.45,
            fontSize: 24,
            color: "#000000"
        };
        setEdits(prev => ({ ...prev, texts: [...prev.texts, newText] }));
        switchTool('select');
    };

    const addEraser = () => {
        const id = Date.now().toString();
        // Adds a white rectangle center screen
        const newRect: RectEdit = {
            id,
            pageIndex: currentPage - 1,
            x: 0.4,
            y: 0.4,
            width: 0.2,
            height: 0.05,
            color: "#FFFFFF"
        };
        setEdits(prev => ({ ...prev, rects: [...prev.rects, newRect] }));
        switchTool('select');
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const imgFile = e.target.files[0];
            createImageEdit(imgFile);
        }
        e.target.value = '';
    };

    const createImageEdit = (imgFile: File) => {
        const url = URL.createObjectURL(imgFile);
        const img = new Image();
        img.src = url;
        img.onload = () => {
            const aspectRatio = img.width / img.height;
            const defaultWidth = 0.25;
            const defaultHeight = (defaultWidth * pageSize.width / aspectRatio) / pageSize.height;

            const newImage: ImageEdit = {
                id: Date.now().toString(),
                pageIndex: currentPage - 1,
                file: imgFile,
                previewUrl: url,
                x: 0.35,
                y: 0.35,
                width: defaultWidth,
                height: defaultHeight,
                aspectRatio
            };
            setEdits(prev => ({ ...prev, images: [...prev.images, newImage] }));
            switchTool('select');
        };
    };

    const confirmDrawing = () => {
        if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
            const canvas = sigCanvasRef.current.getCanvas();
            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], "drawing.png", { type: "image/png" });
                    createImageEdit(file);
                }
            });
            sigCanvasRef.current.clear();
        }
        switchTool('select');
    };

    const cancelDrawing = () => {
        switchTool('select');
    };

    // --- Updates ---

    const updateText = (id: string, updates: Partial<TextEdit>) => {
        setEdits(prev => ({
            ...prev,
            texts: prev.texts.map(t => t.id === id ? { ...t, ...updates } : t)
        }));
    };

    const updateImage = (id: string, updates: Partial<ImageEdit>) => {
        setEdits(prev => ({
            ...prev,
            images: prev.images.map(img => img.id === id ? { ...img, ...updates } : img)
        }));
    };

    const updateRect = (id: string, updates: Partial<RectEdit>) => {
        setEdits(prev => ({
            ...prev,
            rects: prev.rects.map(r => r.id === id ? { ...r, ...updates } : r)
        }));
    };

    const removeElement = (type: 'text' | 'image' | 'rect', id: string) => {
        if (type === 'text') {
            setEdits(prev => ({ ...prev, texts: prev.texts.filter(t => t.id !== id) }));
        } else if (type === 'image') {
            setEdits(prev => ({ ...prev, images: prev.images.filter(t => t.id !== id) }));
        } else {
            setEdits(prev => ({ ...prev, rects: prev.rects.filter(t => t.id !== id) }));
        }
    };

    const handleSave = async () => {
        if (!file) return;
        setIsSaving(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const editsMetadata = {
                texts: edits.texts.map(t => ({
                    id: t.id,
                    pageIndex: t.pageIndex,
                    text: t.text,
                    x: t.x,
                    y: t.y,
                    fontSize: t.fontSize,
                    color: t.color,
                    fontFamily: 'helv'
                })),
                images: edits.images.map((img, index) => ({
                    id: img.id,
                    pageIndex: img.pageIndex,
                    fileIndex: index,
                    x: img.x,
                    y: img.y,
                    width: img.width,
                    height: img.height
                })),
                rectangles: edits.rects.map(r => ({
                    id: r.id,
                    pageIndex: r.pageIndex,
                    x: r.x,
                    y: r.y,
                    width: r.width,
                    height: r.height,
                    color: r.color
                }))
            };

            formData.append('edits', JSON.stringify(editsMetadata));

            edits.images.forEach(img => {
                formData.append('image_files', img.file);
            });

            const response = await axios.post('http://localhost:8080/convert/edit-pdf', formData, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `edited_${file.name}`);
            document.body.appendChild(link);
            link.click();
            link.remove();

        } catch (error) {
            console.error("Save failed", error);
            alert("Erro ao salvar PDF. Tente novamente.");
        } finally {
            setIsSaving(false);
        }
    };

    const onPageLoadSuccess = (page: any) => {
        setPageSize({ width: page.originalWidth, height: page.originalHeight });
        // Update container size if we are already in drawing mode (unlikely but good safety)
        if (isDrawingOpen) {
            setContainerSize({ width: page.originalWidth, height: page.originalHeight });
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col font-sans overflow-hidden">
            {/* --- Top Navbar --- */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-4 fixed top-0 w-full z-[60] shadow-sm">

                <div className="flex items-center space-x-4 w-1/4">
                    <Link href="/" className="flex items-center text-gray-600 hover:text-red-500 transition-colors">
                        <ArrowLeft size={20} className="mr-2" />
                        <span className="font-semibold hidden sm:inline">Voltar</span>
                    </Link>
                </div>

                {file && (
                    <div className="flex items-center justify-center space-x-2 flex-1">
                        <button
                            onClick={() => switchTool('select')}
                            className={`p-2 rounded-lg flex flex-col items-center justify-center w-16 transition-all ${activeTool === 'select' ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-100'}`}
                            title="Mover (V)"
                        >
                            <MousePointer2 size={20} />
                            <span className="text-[10px] mt-1 font-medium">Mover</span>
                        </button>

                        <button
                            onClick={addText}
                            className={`p-2 rounded-lg flex flex-col items-center justify-center w-16 transition-all text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700`}
                            title="Adicionar Texto"
                        >
                            <Type size={20} />
                            <span className="text-[10px] mt-1 font-medium">Texto</span>
                        </button>

                        <label className={`p-2 rounded-lg flex flex-col items-center justify-center w-16 transition-all cursor-pointer text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700`} title="Adicionar Imagem">
                            <ImageIcon size={20} />
                            <span className="text-[10px] mt-1 font-medium">Imagem</span>
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>

                        <button
                            onClick={addEraser}
                            className={`p-2 rounded-lg flex flex-col items-center justify-center w-16 transition-all text-gray-600 hover:bg-gray-100`}
                            title="Borracha (Cria retângulo branco)"
                        >
                            <Eraser size={20} />
                            <span className="text-[10px] mt-1 font-medium">Borracha</span>
                        </button>

                        <button
                            onClick={() => switchTool('draw')}
                            className={`p-2 rounded-lg flex flex-col items-center justify-center w-16 transition-all ${activeTool === 'draw' ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-100'}`}
                            title="Desenhar"
                        >
                            <PenTool size={20} />
                            <span className="text-[10px] mt-1 font-medium">Desenhar</span>
                        </button>
                    </div>
                )}

                <div className="flex items-center justify-end w-1/4 space-x-3">
                    {file && (
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-md transition-transform hover:scale-105 disabled:opacity-70 disabled:hover:scale-100 text-sm"
                        >
                            {isSaving ? "Salvando..." : "Editar PDF"}
                            {!isSaving && <ArrowLeft className="ml-2 rotate-180" size={16} />}
                        </button>
                    )}
                </div>
            </div>

            {/* --- Main Workspace (Centered) --- */}
            <div className="flex-1 pt-20 pb-24 overflow-auto flex items-center justify-center bg-gray-200/50 dark:bg-gray-900/50 relative">
                {!file ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <label className="cursor-pointer group flex flex-col items-center justify-center">
                            <div className="w-64 h-64 bg-white dark:bg-gray-800 rounded-full shadow-xl flex items-center justify-center mb-8 border-4 border-transparent group-hover:border-red-500 transition-all group-hover:scale-105">
                                <Upload className="w-24 h-24 text-red-500" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Editor de PDF Online</h2>
                            <p className="text-gray-500 mb-8">Edite seus arquivos PDF de forma fácil e rápida</p>
                            <div className="px-8 py-4 bg-red-600 text-white rounded-xl font-bold text-xl shadow-lg group-hover:bg-red-700 transition-colors">
                                Selecionar arquivo PDF
                            </div>
                            <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                        </label>
                    </div>
                ) : (
                    <div className="relative my-8 shadow-2xl transition-transform duration-200 ease-out" style={{ transform: `scale(${scale})`, transformOrigin: 'center top' }}>
                        <Document
                            file={file}
                            onLoadSuccess={onDocumentLoadSuccess}
                            className="bg-white"
                        >
                            <div className="relative" ref={pageRef}>
                                <Page
                                    pageNumber={currentPage}
                                    scale={1}
                                    onLoadSuccess={onPageLoadSuccess}
                                    className="shadow-sm"
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                />

                                {/* Overlay Layers */}
                                <div className="absolute top-0 left-0 w-full h-full">
                                    {/* Text Elements */}
                                    {edits.texts.filter(t => t.pageIndex === currentPage - 1).map(textEdit => (
                                        <Rnd
                                            key={textEdit.id}
                                            default={{
                                                x: textEdit.x * (pageRef.current?.offsetWidth || 0),
                                                y: textEdit.y * (pageRef.current?.offsetHeight || 0),
                                                width: 'auto',
                                                height: 'auto'
                                            }}
                                            onDragStop={(e, d) => {
                                                if (!pageRef.current) return;
                                                updateText(textEdit.id, {
                                                    x: d.x / pageRef.current.offsetWidth,
                                                    y: d.y / pageRef.current.offsetHeight
                                                });
                                            }}
                                            bounds="parent"
                                            enableResizing={false}
                                            className="pointer-events-auto group border border-transparent hover:border-blue-400 border-dashed z-20"
                                        >
                                            <div className="relative group">
                                                <button
                                                    onClick={() => removeElement('text', textEdit.id)}
                                                    className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-sm"
                                                >
                                                    <X size={10} />
                                                </button>
                                                <textarea
                                                    value={textEdit.text}
                                                    onChange={(e) => updateText(textEdit.id, { text: e.target.value })}
                                                    style={{
                                                        color: textEdit.color,
                                                        fontSize: `${textEdit.fontSize}px`,
                                                        lineHeight: 1.2
                                                    }}
                                                    className="bg-transparent border-none outline-none resize-none overflow-hidden whitespace-nowrap w-auto min-w-[50px] font-sans"
                                                />
                                            </div>
                                        </Rnd>
                                    ))}

                                    {/* Rect Edits (Eraser or Shapes) */}
                                    {edits.rects.filter(r => r.pageIndex === currentPage - 1).map(rectEdit => (
                                        <Rnd
                                            key={rectEdit.id}
                                            default={{
                                                x: rectEdit.x * (pageRef.current?.offsetWidth || 0),
                                                y: rectEdit.y * (pageRef.current?.offsetHeight || 0),
                                                width: rectEdit.width * (pageRef.current?.offsetWidth || 0),
                                                height: rectEdit.height * (pageRef.current?.offsetHeight || 0)
                                            }}
                                            onDragStop={(e, d) => {
                                                if (!pageRef.current) return;
                                                updateRect(rectEdit.id, {
                                                    x: d.x / pageRef.current.offsetWidth,
                                                    y: d.y / pageRef.current.offsetHeight
                                                });
                                            }}
                                            onResizeStop={(e, direction, ref, delta, position) => {
                                                if (!pageRef.current) return;
                                                updateRect(rectEdit.id, {
                                                    width: parseFloat(ref.style.width) / pageRef.current.offsetWidth,
                                                    height: parseFloat(ref.style.height) / pageRef.current.offsetHeight,
                                                    ...position
                                                });
                                            }}
                                            bounds="parent"
                                            className="pointer-events-auto group border border-gray-300 hover:border-red-400 border-dashed z-20"
                                            style={{ backgroundColor: rectEdit.color }}
                                        >
                                            <div
                                                className="relative w-full h-full group"
                                                style={{ backgroundColor: rectEdit.color, opacity: 1 }}
                                            >
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-50 text-xs text-gray-400 font-bold pointer-events-none mix-blend-difference">
                                                    Borracha
                                                </div>
                                                <button
                                                    onClick={() => removeElement('rect', rectEdit.id)}
                                                    className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-sm"
                                                >
                                                    <X size={10} />
                                                </button>
                                            </div>
                                        </Rnd>
                                    ))}

                                    {/* Image Elements */}
                                    {edits.images.filter(img => img.pageIndex === currentPage - 1).map(imgEdit => (
                                        <Rnd
                                            key={imgEdit.id}
                                            default={{
                                                x: imgEdit.x * (pageRef.current?.offsetWidth || 0),
                                                y: imgEdit.y * (pageRef.current?.offsetHeight || 0),
                                                width: imgEdit.width * (pageRef.current?.offsetWidth || 0),
                                                height: imgEdit.height * (pageRef.current?.offsetHeight || 0)
                                            }}
                                            lockAspectRatio={imgEdit.aspectRatio}
                                            onDragStop={(e, d) => {
                                                if (!pageRef.current) return;
                                                updateImage(imgEdit.id, {
                                                    x: d.x / pageRef.current.offsetWidth,
                                                    y: d.y / pageRef.current.offsetHeight
                                                });
                                            }}
                                            onResizeStop={(e, direction, ref, delta, position) => {
                                                if (!pageRef.current) return;
                                                updateImage(imgEdit.id, {
                                                    width: parseFloat(ref.style.width) / pageRef.current.offsetWidth,
                                                    height: parseFloat(ref.style.height) / pageRef.current.offsetHeight,
                                                    ...position
                                                });
                                            }}
                                            bounds="parent"
                                            className="pointer-events-auto group border border-transparent hover:border-blue-400 border-dashed z-20"
                                        >
                                            <div className="relative w-full h-full group">
                                                <button
                                                    onClick={() => removeElement('image', imgEdit.id)}
                                                    className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-sm"
                                                >
                                                    <X size={10} />
                                                </button>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={imgEdit.previewUrl} alt="" className="w-full h-full object-contain pointer-events-none" />
                                            </div>
                                        </Rnd>
                                    ))}

                                    {/* Drawing Canvas Overlay */}
                                    {isDrawingOpen && (
                                        <div className="absolute inset-0 bg-black/5 cursor-crosshair z-30 flex items-center justify-center pointer-events-auto">
                                            {/* We render a full-size invisible div for the canvas to attach to */}
                                            <div className="absolute inset-0">
                                                <SignatureCanvas
                                                    ref={sigCanvasRef}
                                                    canvasProps={{
                                                        className: 'w-full h-full',
                                                        style: { width: '100%', height: '100%' },
                                                        width: pageRef.current?.offsetWidth || 800,
                                                        height: pageRef.current?.offsetHeight || 600
                                                    }}
                                                    minWidth={2}
                                                    maxWidth={4}
                                                    penColor="black"
                                                />
                                            </div>

                                            {/* Done/Cancel Drawing Buttons (Floating) */}
                                            <div className="absolute top-4 bg-white rounded-full shadow-lg p-2 flex space-x-2 z-40">
                                                <button onClick={cancelDrawing} className="px-4 py-1 bg-gray-200 rounded-full text-sm font-bold hover:bg-gray-300">
                                                    Cancelar
                                                </button>
                                                <button onClick={confirmDrawing} className="px-4 py-1 bg-red-600 text-white rounded-full text-sm font-bold hover:bg-red-700">
                                                    Adicionar Desenho
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Document>
                    </div>
                )}
            </div>

            {/* --- Bottom Navigation Pill --- */}
            {file && (
                <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[60]">
                    <div className="bg-gray-800 text-white rounded-full px-6 py-3 shadow-2xl flex items-center space-x-6 backdrop-blur-md bg-opacity-90">
                        {/* Zoom Controls */}
                        <div className="flex items-center space-x-2 border-r border-gray-600 pr-4">
                            <button onClick={() => setScale(s => Math.max(0.5, s - 0.2))} className="hover:text-red-400">
                                <ZoomOut size={18} />
                            </button>
                            <span className="text-sm font-mono w-12 text-center">{Math.round(scale * 100)}%</span>
                            <button onClick={() => setScale(s => Math.min(3, s + 0.2))} className="hover:text-red-400">
                                <ZoomIn size={18} />
                            </button>
                        </div>

                        {/* Page Navigation */}
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage <= 1}
                                className="hover:text-red-400 disabled:opacity-30 transition-colors"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <span className="text-sm font-medium whitespace-nowrap">
                                {currentPage} <span className="text-gray-400">/</span> {numPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(numPages, prev + 1))}
                                disabled={currentPage >= numPages}
                                className="hover:text-red-400 disabled:opacity-30 transition-colors"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
