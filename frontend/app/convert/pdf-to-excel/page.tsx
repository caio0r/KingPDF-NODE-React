"use client";

import GenericConverterPage from '@/components/GenericConverterPage';
import { FileSpreadsheet } from 'lucide-react';

export default function PdfToExcel() {
    return (
        <GenericConverterPage
            title="Conversor PDF para Excel"
            description="Converta tabelas de documentos PDF para planilhas Excel (.xlsx)."
            endpoint="/convert/pdf-to-excel"
            acceptedFormats={['.pdf']}
            inputLabel="Selecione um documento PDF"
            Icon={FileSpreadsheet}
            color="green"
            downloadLabel="Baixar Excel"
            resultExtension=".xlsx"
        />
    );
}
