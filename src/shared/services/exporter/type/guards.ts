import { ExporterParamFilter, ExporterParamExact } from './exporter-definition.type';

export function isExporterParamExact(data: ExporterParamFilter): data is ExporterParamExact {
  return (
    (data as ExporterParamExact).node !== undefined ||
    (data as ExporterParamExact).param !== undefined
  );
}
