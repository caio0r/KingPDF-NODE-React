"use client";

import GenericConverterPage from '@/components/GenericConverterPage';
import { Image as ImageIcon } from 'lucide-react';

export default function PdfToJpg() {
    return (
        <GenericConverterPage
            title="Conversor PDF para JPG"
            description="Converta páginas de PDF em imagens JPG de alta qualidade."
            endpoint="/convert/pdf-to-jpg"
            acceptedFormats={['.pdf']}
            inputLabel="Selecione um documento PDF"
            Icon={ImageIcon}
            color="yellow"
            downloadLabel="Baixar JPG"
            resultExtension=".jpg"  // The component handles .zip automatically if headers say so
        />
    );
}
