import React, { useState, useCallback, useRef } from 'react';
import { Download, Upload, X, FileText, Code, Globe, AlertCircle, CheckCircle } from 'lucide-react';
import { 
  exportToJSON, 
  exportToMarkdown, 
  exportToHTML, 
  importFromJSON, 
  importFromMarkdown,
  type ExportOptions,
  type ImportResult 
} from '../../../../utils/exportUtils';
import type { CharacterNote } from '../../../../types/characterSheet';
import Button from '../../../../../../shared/components/atoms/Button';
import Card, { CardHeader, CardContent } from '../../../../../../shared/components/molecules/Card';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: CharacterNote[];
  onImportNotes: (notes: CharacterNote[]) => void;
  mode: 'export' | 'import';
}

const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  notes,
  onImportNotes,
  mode,
}) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'markdown',
    includePrivateNotes: false,
    includeMetadata: true,
    groupByCategory: true,
    sortBy: 'date',
  });
  
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importData, setImportData] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = useCallback(() => {
    let exportData: string;
    let filename: string;
    let mimeType: string;

    switch (exportOptions.format) {
      case 'json':
        exportData = exportToJSON(notes, exportOptions);
        filename = `character-notes-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
        break;
      case 'html':
        exportData = exportToHTML(notes, exportOptions);
        filename = `character-notes-${new Date().toISOString().split('T')[0]}.html`;
        mimeType = 'text/html';
        break;
      case 'markdown':
      default:
        exportData = exportToMarkdown(notes, exportOptions);
        filename = `character-notes-${new Date().toISOString().split('T')[0]}.md`;
        mimeType = 'text/markdown';
        break;
    }

    // Create and download file
    const blob = new Blob([exportData], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    onClose();
  }, [notes, exportOptions, onClose]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportData(content);
      
      // Auto-detect format and parse
      let result: ImportResult;
      if (file.name.endsWith('.json')) {
        result = importFromJSON(content, notes);
      } else {
        result = importFromMarkdown(content, notes);
      }
      
      setImportResult(result);
    };
    
    reader.readAsText(file);
  }, [notes]);

  const handleImport = useCallback(() => {
    if (!importResult || !importResult.success) return;
    
    onImportNotes(importResult.notes);
    setImportResult(null);
    setImportData('');
    onClose();
  }, [importResult, onImportNotes, onClose]);

  const handleTextImport = useCallback(() => {
    if (!importData.trim()) return;
    
    // Try to determine format
    let result: ImportResult;
    try {
      JSON.parse(importData);
      result = importFromJSON(importData, notes);
    } catch {
      result = importFromMarkdown(importData, notes);
    }
    
    setImportResult(result);
  }, [importData, notes]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {mode === 'export' ? 'Export Notes' : 'Import Notes'}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={16} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {mode === 'export' ? (
            // Export mode
            <>
              <div>
                <h3 className="font-medium mb-3">Export Format</h3>
                <div className="grid grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 p-3 border border-border rounded-md cursor-pointer hover:bg-muted/50">
                    <input
                      type="radio"
                      name="format"
                      value="markdown"
                      checked={exportOptions.format === 'markdown'}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as any }))}
                      className="rounded border-border focus:ring-blue-500"
                    />
                    <FileText size={16} />
                    <div>
                      <div className="font-medium">Markdown</div>
                      <div className="text-xs text-muted-foreground">Universal format</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-3 border border-border rounded-md cursor-pointer hover:bg-muted/50">
                    <input
                      type="radio"
                      name="format"
                      value="json"
                      checked={exportOptions.format === 'json'}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as any }))}
                      className="rounded border-border focus:ring-blue-500"
                    />
                    <Code size={16} />
                    <div>
                      <div className="font-medium">JSON</div>
                      <div className="text-xs text-muted-foreground">For re-import</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-3 border border-border rounded-md cursor-pointer hover:bg-muted/50">
                    <input
                      type="radio"
                      name="format"
                      value="html"
                      checked={exportOptions.format === 'html'}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as any }))}
                      className="rounded border-border focus:ring-blue-500"
                    />
                    <Globe size={16} />
                    <div>
                      <div className="font-medium">HTML</div>
                      <div className="text-xs text-muted-foreground">For viewing</div>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Export Options</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={exportOptions.includePrivateNotes}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includePrivateNotes: e.target.checked }))}
                      className="rounded border-border focus:ring-blue-500"
                    />
                    <span className="text-sm">Include private notes</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeMetadata}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includeMetadata: e.target.checked }))}
                      className="rounded border-border focus:ring-blue-500"
                    />
                    <span className="text-sm">Include metadata (dates, tags, categories)</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={exportOptions.groupByCategory}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, groupByCategory: e.target.checked }))}
                      className="rounded border-border focus:ring-blue-500"
                    />
                    <span className="text-sm">Group by category</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Sort Order</label>
                <select
                  value={exportOptions.sortBy}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, sortBy: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date">Date created (newest first)</option>
                  <option value="title">Title (A-Z)</option>
                  <option value="category">Category</option>
                </select>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {notes.filter(note => exportOptions.includePrivateNotes || !note.isPrivate).length} notes will be exported
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button variant="primary" onClick={handleExport}>
                      <Download size={16} className="mr-1" />
                      Export
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // Import mode
            <>
              <div>
                <h3 className="font-medium mb-3">Import Method</h3>
                <div className="space-y-4">
                  {/* File upload */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Upload File</label>
                    <div className="border-2 border-dashed border-border rounded-md p-6 text-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json,.md,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Upload size={32} className="mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Drop a file here or click to select
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Choose File
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        Supports JSON and Markdown files
                      </p>
                    </div>
                  </div>

                  {/* Text input */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Paste Text</label>
                    <textarea
                      value={importData}
                      onChange={(e) => setImportData(e.target.value)}
                      placeholder="Paste JSON or Markdown content here..."
                      className="w-full h-32 px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                    />
                    {importData && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleTextImport}
                        className="mt-2"
                      >
                        Parse Content
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Import results */}
              {importResult && (
                <div className="space-y-4">
                  <div className="p-4 border border-border rounded-md">
                    <div className="flex items-center gap-2 mb-3">
                      {importResult.success ? (
                        <CheckCircle size={16} className="text-green-600" />
                      ) : (
                        <AlertCircle size={16} className="text-red-600" />
                      )}
                      <h4 className="font-medium">
                        {importResult.success ? 'Import Ready' : 'Import Failed'}
                      </h4>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                      <div className="text-center">
                        <div className="font-medium text-green-600">{importResult.imported}</div>
                        <div className="text-muted-foreground">Imported</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-yellow-600">{importResult.skipped}</div>
                        <div className="text-muted-foreground">Skipped</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-red-600">{importResult.errors.length}</div>
                        <div className="text-muted-foreground">Errors</div>
                      </div>
                    </div>

                    {/* Warnings */}
                    {importResult.warnings.length > 0 && (
                      <div className="mb-3">
                        <h5 className="text-sm font-medium text-yellow-600 mb-1">Warnings:</h5>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {importResult.warnings.map((warning, index) => (
                            <li key={index}>• {warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Errors */}
                    {importResult.errors.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-red-600 mb-1">Errors:</h5>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {importResult.errors.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setImportResult(null);
                        setImportData('');
                      }}
                    >
                      Clear
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={onClose}>
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleImport}
                        disabled={!importResult.success || importResult.imported === 0}
                      >
                        Import {importResult.imported} Notes
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportExportModal;