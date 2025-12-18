"use client";

import GenericConverterPage from '@/components/GenericConverterPage';
import { FileSpreadsheet } from 'lucide-react';

export default function ExcelToPdf() {
    return (
        <GenericConverterPage
            title="Conversor Excel para PDF"
            description="Converta planilhas Excel (.xlsx) para PDF facilmente."
            endpoint="/convert/excel-to-pdf"
            acceptedFormats={['.xlsx', '.xls']}
            inputLabel="Selecione uma planilha Excel"
            Icon={FileSpreadsheet}
            color="green"
            downloadLabel="Baixar PDF"
            resultExtension=".pdf"
        />
    );
}
