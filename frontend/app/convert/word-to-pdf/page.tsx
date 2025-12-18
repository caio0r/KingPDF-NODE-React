"use client";

import GenericConverterPage from '@/components/GenericConverterPage';
import { FileText } from 'lucide-react';

export default function WordToPdf() {
    return (
        <GenericConverterPage
            title="Conversor Word para PDF"
            description="Converta documentos Word (.docx, .doc) para PDF facilmente."
            endpoint="/convert/word-to-pdf"
            acceptedFormats={['.docx', '.doc']}
            inputLabel="Selecione um documento Word"
            Icon={FileText}
            color="blue"
            downloadLabel="Baixar PDF"
            resultExtension=".pdf"
        />
    );
}
