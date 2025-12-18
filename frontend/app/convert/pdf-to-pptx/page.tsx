"use client";

import GenericConverterPage from '@/components/GenericConverterPage';
import { Presentation } from 'lucide-react';

export default function PdfToPptx() {
    return (
        <GenericConverterPage
            title="Conversor PDF para PowerPoint"
            description="Converta apresentações PDF para PowerPoint (.pptx) facilmente."
            endpoint="/convert/pdf-to-pptx"
            acceptedFormats={['.pdf']}
            inputLabel="Selecione um documento PDF"
            Icon={Presentation}
            color="orange"
            downloadLabel="Baixar PowerPoint"
            resultExtension=".pptx"
        />
    );
}
