"use client";

import GenericConverterPage from '@/components/GenericConverterPage';
import { FileText } from 'lucide-react';

export default function PdfToWord() {
    return (
        <GenericConverterPage
            title="Conversor PDF para Word"
            description="Converta documentos PDF para Word (.docx) mantendo o layout."
            endpoint="/convert/pdf-to-word"
            acceptedFormats={['.pdf']}
            inputLabel="Selecione um documento PDF"
            Icon={FileText}
            color="blue"
            downloadLabel="Baixar Word"
            resultExtension=".docx"
        />
    );
}
