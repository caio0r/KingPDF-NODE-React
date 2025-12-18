"use client";

import GenericConverterPage from '@/components/GenericConverterPage';
import { Presentation } from 'lucide-react';

export default function PptxToPdf() {
    return (
        <GenericConverterPage
            title="Conversor PowerPoint para PDF"
            description="Converta apresentações PowerPoint (.pptx) para PDF facilmente."
            endpoint="/convert/pptx-to-pdf"
            acceptedFormats={['.pptx']}
            inputLabel="Selecione uma apresentação PowerPoint"
            Icon={Presentation}
            color="orange"
            downloadLabel="Baixar PDF"
            resultExtension=".pdf"
        />
    );
}
