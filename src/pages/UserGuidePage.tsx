import { useState } from 'react';
import { Card } from '../app/components/ui/card';
import { 
  BookOpen, FileText, CheckCircle2, AlertCircle, Download, 
  Play, Search, RefreshCw, ChevronDown, Check, AlertTriangle 
} from 'lucide-react';
import { motion } from 'motion/react';

// 21 financial fields extracted from ValidationService.java for client reference
const CSV_FIELDS = [
  {
    index: 0,
    name: 'transactionId',
    required: true,
    type: 'Alphanumeric',
    format: 'TXN...',
    constraints: 'Must start with "TXN", contain only alphanumeric characters, and be 20 characters or less.',
    category: 'Identity Keys',
    description: 'Unique reference identifier for each individual trade in the system.'
  },
  {
    index: 1,
    name: 'fileHeaderDate',
    required: true,
    type: 'Date',
    format: 'yyyyMMdd',
    constraints: 'Must be in yyyyMMdd date format (e.g. 20251104). Cannot be empty.',
    category: 'Ingestion Ledgers',
    description: 'The primary trading ledger date recorded on the file header.'
  },
  {
    index: 2,
    name: 'accountNumber',
    required: true,
    type: 'Alphanumeric',
    format: 'ACC...',
    constraints: 'Must start with "ACC" and contain only alphanumeric characters.',
    category: 'Ledger Mapping',
    description: 'The target institutional account reference code.'
  },
  {
    index: 3,
    name: 'transactionType',
    required: true,
    type: 'Numeric',
    format: 'Number Code',
    constraints: 'Must be a numeric integer value (e.g. 74).',
    category: 'Ledger Mapping',
    description: 'Internal categorization code defining the trade direction or type.'
  },
  {
    index: 4,
    name: 'batchLocation',
    required: true,
    type: 'String',
    format: 'Branch Code',
    constraints: 'Mandatory field, e.g. MUM, CHE, PUN, DEL.',
    category: 'Ingestion Ledgers',
    description: 'Geographic server branch location where trade was registered.'
  },
  {
    index: 5,
    name: 'batchNumber',
    required: true,
    type: 'Numeric',
    format: 'Number Code',
    constraints: 'Must be a numeric integer value.',
    category: 'Ingestion Ledgers',
    description: 'Numerical tracking reference for the specific batch run.'
  },
  {
    index: 6,
    name: 'updateBatchDate',
    required: true,
    type: 'Numeric',
    format: 'yyyyMMdd',
    constraints: 'Must be in numeric date format (e.g. 20260225).',
    category: 'Ingestion Ledgers',
    description: 'The execution date recorded for the batch update run.'
  },
  {
    index: 7,
    name: 'relatedFileNumber',
    required: false,
    type: 'Numeric',
    format: 'Number Code',
    constraints: 'Optional, but if provided must be numeric.',
    category: 'Ledger Mapping',
    description: 'Reference key connecting to secondary external regulatory filings.'
  },
  {
    index: 8,
    name: 'actionName',
    required: true,
    type: 'String',
    format: 'Code (e.g. REV)',
    constraints: 'Mandatory action identifier: REV, POST, ADJ.',
    category: 'Transaction Properties',
    description: 'Accounting action code associated with the ledger update.'
  },
  {
    index: 9,
    name: 'relatedFileKey',
    required: true,
    type: 'Numeric',
    format: 'Number Code',
    constraints: 'Must be a numeric integer value.',
    category: 'Ledger Mapping',
    description: 'Primary record key referencing associated items in related databases.'
  },
  {
    index: 10,
    name: 'doNotReportFlag',
    required: true,
    type: 'Character',
    format: 'Y / N',
    constraints: 'Must be exactly 1 character in length (typically Y or N).',
    category: 'Transaction Properties',
    description: 'Audit flag marking if trade should be omitted from regulatory reports.'
  },
  {
    index: 11,
    name: 'explanation',
    required: false,
    type: 'String',
    format: 'Text Description',
    constraints: 'Optional, maximum length of 255 characters.',
    category: 'Transaction Properties',
    description: 'Written description detailing special notes or audit explanations.'
  },
  {
    index: 12,
    name: 'minorAssetsClass',
    required: false,
    type: 'Numeric',
    format: 'Number Code',
    constraints: 'Optional, but if provided must be numeric.',
    category: 'Financial Attributes',
    description: 'Asset sub-class classification code.'
  },
  {
    index: 13,
    name: 'owningPortfolio',
    required: true,
    type: 'Numeric',
    format: 'Number Code',
    constraints: 'Must be numeric and not empty.',
    category: 'Ledger Mapping',
    description: 'Responsible portfolio code managing this financial asset.'
  },
  {
    index: 14,
    name: 'posterInitials',
    required: true,
    type: 'String',
    format: 'Initials (e.g. RS)',
    constraints: 'Mandatory field. Initials of the posting compliance operator.',
    category: 'Ingestion Ledgers',
    description: 'The operator initials responsible for committing the entry.'
  },
  {
    index: 15,
    name: 'transactionSubtype',
    required: true,
    type: 'Numeric',
    format: 'Number Code',
    constraints: 'Must be numeric.',
    category: 'Transaction Properties',
    description: 'Subtype mapping for secondary ledger classification.'
  },
  {
    index: 16,
    name: 'cashEffect',
    required: true,
    type: 'Decimal',
    format: 'Amount (scale <= 2)',
    constraints: 'Must be a valid decimal number. Scale cannot exceed 2 decimal digits.',
    category: 'Financial Attributes',
    description: 'Total financial cash impact committed to the account.'
  },
  {
    index: 17,
    name: 'cashPaidOut',
    required: false,
    type: 'Decimal',
    format: 'Amount (scale <= 2)',
    constraints: 'Optional. If present, must be decimal with scale <= 2.',
    category: 'Financial Attributes',
    description: 'Disbursed settlement outflow amount.'
  },
  {
    index: 18,
    name: 'brokerNumber',
    required: false,
    type: 'Numeric',
    format: 'Number Code',
    constraints: 'Optional, but if provided must be numeric.',
    category: 'Ledger Mapping',
    description: 'License code of the external executing broker agent.'
  },
  {
    index: 19,
    name: 'oldBalance',
    required: true,
    type: 'Decimal',
    format: 'Precision <= 17, Scale <= 2',
    constraints: 'Must be a decimal. Digits cannot exceed 17. Scale cannot exceed 2.',
    category: 'Financial Attributes',
    description: 'Account balance immediately prior to trade execution.'
  },
  {
    index: 20,
    name: 'newBalance',
    required: true,
    type: 'Decimal',
    format: 'Precision <= 17, Scale <= 2',
    constraints: 'Must be a decimal. Digits cannot exceed 17. Scale cannot exceed 2.',
    category: 'Financial Attributes',
    description: 'Account balance immediately following trade execution.'
  }
];

const SAMPLE_ROWS = [
  'TXN002048,20251104,ACC000002048,74,MUM,606032,20260225,810106,REV,48000174,Y,AUTO-GENERATED TRANSACTION,75,556513,VP,20,45473.65,0.00,45638,2231543,2228081.64',
  'TXN002230,20250609,ACC000002230,25,CHE,241055,20260225,810296,POST,48000767,N,AUTO-GENERATED TRANSACTION,86,556584,RS,31,48081.97,0.00,45404,2858915,2831066.18',
  'TXN002685,20250923,ACC000002685,75,PUN,480818,20260225,810396,ADJ,48000569,Y,AUTO-GENERATED TRANSACTION,53,556546,MT,40,-34460.70,0.00,45731,2328021,2294355.07'
];

export default function UserGuidePage() {
  const [searchField, setSearchField] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [requiredFilter, setRequiredFilter] = useState('All');
  
  // Simulator State
  const [simulatorInput, setSimulatorInput] = useState(SAMPLE_ROWS[0]);
  const [simulatorResult, setSimulatorResult] = useState<{
    success: boolean;
    rowNumber: number;
    parsedFields?: Record<string, string>;
    errors?: Array<{
      errorField: string;
      errorMessage: string;
      status: string;
    }>;
  } | null>(null);

  const downloadSampleCsv = () => {
    const headers = CSV_FIELDS.map(f => f.name).join(',');
    const content = [headers, ...SAMPLE_ROWS].join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'tse_ingestion_format.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const runSimulatorValidation = () => {
    const rowStr = simulatorInput.trim();
    if (!rowStr) {
      setSimulatorResult({
        success: false,
        rowNumber: 1,
        errors: [{ errorField: 'file', errorMessage: 'File row is empty', status: 'FAILED' }]
      });
      return;
    }

    const fields = rowStr.split(',');
    if (fields.length !== 21) {
      setSimulatorResult({
        success: false,
        rowNumber: 1,
        errors: [{ 
          errorField: 'rowLength', 
          errorMessage: `Invalid CSV format. Row must contain exactly 21 fields (Found: ${fields.length}).`, 
          status: 'FAILED' 
        }]
      });
      return;
    }

    const parsedFields: Record<string, string> = {};
    CSV_FIELDS.forEach((f, idx) => {
      parsedFields[f.name] = fields[idx] || '';
    });

    const errors: Array<{ errorField: string; errorMessage: string; status: string }> = [];

    // Helper functions matching Java validators
    const isNumeric = (val: string) => /^-?\d+$/.test(val.trim());
    const isDecimal = (val: string) => !isNaN(Number(val.trim())) && val.trim() !== '';
    const getScale = (val: string) => {
      const parts = val.trim().split('.');
      return parts.length > 1 ? parts[1].length : 0;
    };
    const getPrecision = (val: string) => {
      const cleaned = val.trim().replace('.', '').replace('-', '');
      return cleaned.replace(/^0+/, '').length;
    };

    // 1. Transaction ID validation (TradeRecordProcessor.java)
    const txId = parsedFields['transactionId'] || '';
    const isTxnIdInvalid = !txId.trim() || txId.length > 20 || !/^TXN[a-zA-Z0-9]+$/.test(txId);
    if (isTxnIdInvalid) {
      errors.push({
        errorField: 'transactionId',
        errorMessage: 'Invalid Transaction ID: must start with TXN, be alphanumeric and length <= 20',
        status: 'INVALID_TRANSACTION_ID'
      });
    }

    // 2. File Header Date Validation
    const fhDate = parsedFields['fileHeaderDate'] || '';
    if (!fhDate.trim()) {
      errors.push({ errorField: 'fileHeaderDate', errorMessage: 'Mandatory field missing', status: 'FAILED' });
    } else if (!/^\d{8}$/.test(fhDate)) {
      errors.push({ errorField: 'fileHeaderDate', errorMessage: 'Invalid date format', status: 'FAILED' });
    }

    // 3. Account Number Validation
    const accNum = parsedFields['accountNumber'] || '';
    if (!accNum.trim()) {
      errors.push({ errorField: 'accountNumber', errorMessage: 'Mandatory field missing', status: 'FAILED' });
    } else if (!/^ACC[a-zA-Z0-9]+$/.test(accNum)) {
      errors.push({ errorField: 'accountNumber', errorMessage: 'Must start with ACC', status: 'FAILED' });
    }

    // 4. Transaction Type Validation
    const txType = parsedFields['transactionType'] || '';
    if (!txType.trim()) {
      errors.push({ errorField: 'transactionType', errorMessage: 'Mandatory field missing', status: 'FAILED' });
    } else if (!isNumeric(txType)) {
      errors.push({ errorField: 'transactionType', errorMessage: 'Must be numeric', status: 'FAILED' });
    }

    // 5. Batch Location Validation
    if (!parsedFields['batchLocation']?.trim()) {
      errors.push({ errorField: 'batchLocation', errorMessage: 'Mandatory field missing', status: 'FAILED' });
    }

    // 6. Batch Number Validation
    const batchNum = parsedFields['batchNumber'] || '';
    if (!batchNum.trim()) {
      errors.push({ errorField: 'batchNumber', errorMessage: 'Mandatory field missing', status: 'FAILED' });
    } else if (!isNumeric(batchNum)) {
      errors.push({ errorField: 'batchNumber', errorMessage: 'Must be numeric', status: 'FAILED' });
    }

    // 7. Update Batch Date Validation
    const updBDate = parsedFields['updateBatchDate'] || '';
    if (!updBDate.trim()) {
      errors.push({ errorField: 'updateBatchDate', errorMessage: 'Mandatory field missing', status: 'FAILED' });
    } else if (!isNumeric(updBDate)) {
      errors.push({ errorField: 'updateBatchDate', errorMessage: 'Must be numeric', status: 'FAILED' });
    }

    // 8. Related File Number Validation
    const relFileNum = parsedFields['relatedFileNumber'] || '';
    if (relFileNum.trim() && !isNumeric(relFileNum)) {
      errors.push({ errorField: 'relatedFileNumber', errorMessage: 'Must be numeric', status: 'FAILED' });
    }

    // 9. Action Name Validation
    if (!parsedFields['actionName']?.trim()) {
      errors.push({ errorField: 'actionName', errorMessage: 'Mandatory field missing', status: 'FAILED' });
    }

    // 10. Related File Key Validation
    const relFileKey = parsedFields['relatedFileKey'] || '';
    if (!relFileKey.trim()) {
      errors.push({ errorField: 'relatedFileKey', errorMessage: 'Mandatory field missing', status: 'FAILED' });
    } else if (!isNumeric(relFileKey)) {
      errors.push({ errorField: 'relatedFileKey', errorMessage: 'Must be numeric', status: 'FAILED' });
    }

    // 11. Do Not Report Flag Validation
    const dnrFlag = parsedFields['doNotReportFlag'] || '';
    if (!dnrFlag.trim()) {
      errors.push({ errorField: 'doNotReportFlag', errorMessage: 'Mandatory field missing', status: 'FAILED' });
    } else if (dnrFlag.length !== 1) {
      errors.push({ errorField: 'doNotReportFlag', errorMessage: 'Invalid field length', status: 'FAILED' });
    }

    // 12. Explanation Validation
    const expl = parsedFields['explanation'] || '';
    if (expl.length > 255) {
      errors.push({ errorField: 'explanation', errorMessage: 'Invalid field length', status: 'FAILED' });
    }

    // 13. Minor Assets Class Validation
    const minAsset = parsedFields['minorAssetsClass'] || '';
    if (minAsset.trim() && !isNumeric(minAsset)) {
      errors.push({ errorField: 'minorAssetsClass', errorMessage: 'Must be numeric', status: 'FAILED' });
    }

    // 14. Owning Portfolio Validation
    const ownPort = parsedFields['owningPortfolio'] || '';
    if (!ownPort.trim()) {
      errors.push({ errorField: 'owningPortfolio', errorMessage: 'Mandatory field missing', status: 'FAILED' });
    } else if (!isNumeric(ownPort)) {
      errors.push({ errorField: 'owningPortfolio', errorMessage: 'Must be numeric', status: 'FAILED' });
    }

    // 15. Poster Initials Validation
    if (!parsedFields['posterInitials']?.trim()) {
      errors.push({ errorField: 'posterInitials', errorMessage: 'Mandatory field missing', status: 'FAILED' });
    }

    // 16. Transaction Subtype Validation
    const txSubtype = parsedFields['transactionSubtype'] || '';
    if (!txSubtype.trim()) {
      errors.push({ errorField: 'transactionSubtype', errorMessage: 'Mandatory field missing', status: 'FAILED' });
    } else if (!isNumeric(txSubtype)) {
      errors.push({ errorField: 'transactionSubtype', errorMessage: 'Must be numeric', status: 'FAILED' });
    }

    // 17. Cash Effect Validation
    const cashEff = parsedFields['cashEffect'] || '';
    if (!cashEff.trim()) {
      errors.push({ errorField: 'cashEffect', errorMessage: 'Mandatory field missing', status: 'FAILED' });
    } else if (!isDecimal(cashEff)) {
      errors.push({ errorField: 'cashEffect', errorMessage: 'Invalid decimal value', status: 'FAILED' });
    } else if (getScale(cashEff) > 2) {
      errors.push({ errorField: 'cashEffect', errorMessage: 'Invalid decimal scale', status: 'FAILED' });
    }

    // 18. Cash Paid Out Validation
    const cashPaid = parsedFields['cashPaidOut'] || '';
    if (cashPaid.trim()) {
      if (!isDecimal(cashPaid)) {
        errors.push({ errorField: 'cashPaidOut', errorMessage: 'Invalid decimal value', status: 'FAILED' });
      } else if (getScale(cashPaid) > 2) {
        errors.push({ errorField: 'cashPaidOut', errorMessage: 'Invalid decimal scale', status: 'FAILED' });
      }
    }

    // 19. Broker Number Validation
    const brokerNum = parsedFields['brokerNumber'] || '';
    if (brokerNum.trim() && !isNumeric(brokerNum)) {
      errors.push({ errorField: 'brokerNumber', errorMessage: 'Must be numeric', status: 'FAILED' });
    }

    // 20. Old Balance Validation
    const oldBal = parsedFields['oldBalance'] || '';
    if (!oldBal.trim()) {
      errors.push({ errorField: 'oldBalance', errorMessage: 'Mandatory field missing', status: 'FAILED' });
    } else if (!isDecimal(oldBal)) {
      errors.push({ errorField: 'oldBalance', errorMessage: 'Invalid decimal value', status: 'FAILED' });
    } else if (getPrecision(oldBal) > 17 || getScale(oldBal) > 2) {
      errors.push({ errorField: 'oldBalance', errorMessage: 'Precision exceeds allowed limit', status: 'FAILED' });
    }

    // 21. New Balance Validation
    const newBal = parsedFields['newBalance'] || '';
    if (!newBal.trim()) {
      errors.push({ errorField: 'newBalance', errorMessage: 'Mandatory field missing', status: 'FAILED' });
    } else if (!isDecimal(newBal)) {
      errors.push({ errorField: 'newBalance', errorMessage: 'Invalid decimal value', status: 'FAILED' });
    } else if (getPrecision(newBal) > 17 || getScale(newBal) > 2) {
      errors.push({ errorField: 'newBalance', errorMessage: 'Precision exceeds allowed limit', status: 'FAILED' });
    }

    setSimulatorResult({
      success: errors.length === 0,
      rowNumber: 1,
      parsedFields,
      errors: errors.length > 0 ? errors : undefined
    });
  };

  const filteredFields = CSV_FIELDS.filter(field => {
    const matchesSearch = field.name.toLowerCase().includes(searchField.toLowerCase()) || 
                          field.description.toLowerCase().includes(searchField.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || field.category === categoryFilter;
    const matchesRequired = requiredFilter === 'All' || 
                            (requiredFilter === 'Required' && field.required) || 
                            (requiredFilter === 'Optional' && !field.required);
    return matchesSearch && matchesCategory && matchesRequired;
  });

  const categories = Array.from(new Set(CSV_FIELDS.map(f => f.category)));

  return (
    <div className="max-w-6xl mx-auto pb-16 space-y-8 px-4 sm:px-6 pt-6">
      
      {/* Banner - Using standard dark gradient for flawless high-contrast text rendering */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 p-8 md:p-10 overflow-hidden shadow-2xl text-left">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 space-y-3.5">
          <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/45 text-primary-foreground px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <BookOpen className="h-3.5 w-3.5" />
            Operations Guide
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Client File Preparation Guide
          </h1>
          <p className="text-slate-200 text-sm max-w-2xl leading-relaxed">
            Welcome to the Trade Ingestion Client portal. Follow this reference guide to format your financial transaction sheets, download sample templates, and test row records.
          </p>
        </div>
      </div>

      {/* Grid of Sections */}
      <div className="space-y-8">
        
        {/* Section 1: Ingestion workflow */}
        <Card className="p-6 md:p-8 rounded-2xl border border-border">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <ChevronDown className="h-5 w-5 text-primary rotate-270" />
            How the Upload Workflow Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs leading-relaxed text-muted-foreground">
            <div className="space-y-1.5 p-4 bg-accent/30 rounded-xl border border-border/60">
              <span className="font-extrabold text-primary text-base">01.</span>
              <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">CSV Upload</h4>
              <p>Drag your data sheet (up to 1GB) into the upload area. The system saves the file immediately and returns an immediate confirmation.</p>
            </div>
            <div className="space-y-1.5 p-4 bg-accent/30 rounded-xl border border-border/60">
              <span className="font-extrabold text-primary text-base">02.</span>
              <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">Queueing</h4>
              <p>Your file stands in the queue. Background batch threads pick it up automatically within 5 seconds for processing.</p>
            </div>
            <div className="space-y-1.5 p-4 bg-accent/30 rounded-xl border border-border/60">
              <span className="font-extrabold text-primary text-base">03.</span>
              <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">Validation</h4>
              <p>Rows are scanned one-by-one against 21 exact business logic compliance and precision validations.</p>
            </div>
            <div className="space-y-1.5 p-4 bg-accent/30 rounded-xl border border-border/60">
              <span className="font-extrabold text-primary text-base">04.</span>
              <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">Isolation</h4>
              <p>Compliant rows are recorded inside the main trade database. Erroneous fields are quarantined instantly for audit reviews.</p>
            </div>
          </div>
        </Card>

        {/* Section 2: Interactive simulator */}
        <Card className="p-6 md:p-8 rounded-2xl border border-border space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold flex items-center gap-2.5">
              <Play className="h-5 w-5 text-primary" />
              Ingestion Row Tester
            </h2>
            <p className="text-muted-foreground text-xs">
              Test your custom formatted transaction lines here! Paste a raw CSV row to verify columns, regular expressions, and scale criteria before uploading.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-muted-foreground uppercase tracking-wider">Comma Separated Fields (21 Columns):</span>
              <button
                onClick={() => setSimulatorInput(SAMPLE_ROWS[Math.floor(Math.random() * SAMPLE_ROWS.length)])}
                className="text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5 animate-pulse" />
                Fill Sample Row
              </button>
            </div>
            <textarea
              rows={3}
              value={simulatorInput}
              onChange={(e) => setSimulatorInput(e.target.value)}
              className="w-full bg-slate-950 font-mono text-xs text-slate-100 p-4 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-slate-700 leading-relaxed"
            />
            <button
              onClick={runSimulatorValidation}
              className="w-full bg-primary hover:bg-primary/95 text-primary-foreground py-2.5 rounded-xl font-bold shadow-md transition-all cursor-pointer text-xs"
            >
              Verify Row Compliance
            </button>
          </div>

          {simulatorResult && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              {simulatorResult.success ? (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-2.5">
                  <Check className="h-4.5 w-4.5" />
                  This row is compliant! It will import successfully.
                </div>
              ) : (
                <div className="p-4 bg-red-50 dark:bg-rose-500/10 border border-red-200 dark:border-rose-500/20 rounded-xl space-y-2">
                  <div className="text-red-700 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Ingestion errors found. This row would be isolated and quarantined:
                  </div>
                  <div className="divide-y divide-red-200 dark:divide-rose-500/20 bg-red-950 rounded-lg p-1.5 border border-red-800">
                    {simulatorResult.errors?.map((err, i) => (
                      <div key={i} className="p-2.5 text-xs font-mono text-red-100">
                        <span className="text-red-300 font-bold">[{err.errorField}]:</span> <span className="text-white">{err.errorMessage}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {simulatorResult.parsedFields && (
                <div className="p-4 bg-accent/20 rounded-xl border border-border space-y-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">Parsed Attribute Preview</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {CSV_FIELDS.map(f => {
                      const val = simulatorResult.parsedFields?.[f.name] || '';
                      const err = simulatorResult.errors?.some(e => e.errorField === f.name);
                      return (
                        <div key={f.name} className={`p-2 rounded-lg border font-mono text-xs ${
                          err ? 'border-rose-500/35 bg-rose-500/5' : 'border-border/40 bg-accent/40'
                        }`}>
                          <span className="block text-[8px] text-muted-foreground uppercase font-bold tracking-wider">{f.name}</span>
                          <span className="block text-foreground font-bold truncate" title={val}>{val || '-'}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </Card>

        {/* Section 3: Field reference */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              Columns & Validation Rules
            </h2>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter columns..."
                  value={searchField}
                  onChange={(e) => setSearchField(e.target.value)}
                  className="bg-accent/40 border border-border rounded-xl pl-9 pr-4 py-1.5 text-xs focus:outline-none placeholder-muted-foreground/60 w-44"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-accent/40 border border-border rounded-xl px-2 py-1.5 text-xs focus:outline-none cursor-pointer"
              >
                <option value="All">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <select
                value={requiredFilter}
                onChange={(e) => setRequiredFilter(e.target.value)}
                className="bg-accent/40 border border-border rounded-xl px-2 py-1.5 text-xs focus:outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Required">Required Only</option>
                <option value="Optional">Optional Only</option>
              </select>
            </div>
          </div>

          <Card className="rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-accent/40 border-b border-border">
                    <th className="p-3.5 font-bold text-muted-foreground uppercase text-center w-14">Col</th>
                    <th className="p-3.5 font-bold text-muted-foreground uppercase">Column Name</th>
                    <th className="p-3.5 font-bold text-muted-foreground uppercase">Required?</th>
                    <th className="p-3.5 font-bold text-muted-foreground uppercase">Expected Format</th>
                    <th className="p-3.5 font-bold text-muted-foreground uppercase">Category / Constraints</th>
                    <th className="p-3.5 font-bold text-muted-foreground uppercase">Field Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredFields.map(f => (
                    <tr key={f.name} className="hover:bg-accent/20 transition-colors">
                      <td className="p-3.5 font-mono text-center font-bold text-primary">{f.index}</td>
                      <td className="p-3.5 font-mono font-bold text-foreground">{f.name}</td>
                      <td className="p-3.5">
                        <span className={`inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          f.required ? 'bg-rose-500/10 text-rose-500' : 'bg-muted text-muted-foreground'
                        }`}>
                          {f.required ? 'Required' : 'Optional'}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono">
                        <span className="bg-muted px-1.5 py-0.5 rounded text-primary text-[10px] border border-border/40 font-semibold">{f.format}</span>
                      </td>
                      <td className="p-3.5">
                        <div className="text-[10px] text-muted-foreground uppercase font-bold mb-0.5">{f.category}</div>
                        <div className="text-[11px] text-foreground/80">{f.constraints}</div>
                      </td>
                      <td className="p-3.5 text-muted-foreground max-w-xs">{f.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Section 4: Sample format & download */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-base font-bold flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-primary" />
              Standard CSV Live Grid
            </h3>
            <Card className="rounded-2xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-accent/40 border-b border-border">
                      <th className="p-3 font-bold text-muted-foreground font-mono">transactionId</th>
                      <th className="p-3 font-bold text-muted-foreground font-mono">fileHeaderDate</th>
                      <th className="p-3 font-bold text-muted-foreground font-mono">accountNumber</th>
                      <th className="p-3 font-bold text-muted-foreground font-mono">batchLocation</th>
                      <th className="p-3 font-bold text-muted-foreground font-mono">actionName</th>
                      <th className="p-3 font-bold text-muted-foreground font-mono">cashEffect</th>
                      <th className="p-3 font-bold text-muted-foreground font-mono">oldBalance</th>
                      <th className="p-3 font-bold text-muted-foreground font-mono">newBalance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 font-mono text-[11px]">
                    <tr className="hover:bg-accent/20">
                      <td className="p-3 font-bold">TXN002048</td>
                      <td className="p-3">20251104</td>
                      <td className="p-3">ACC000002048</td>
                      <td className="p-3">MUM</td>
                      <td className="p-3 font-bold text-indigo-400">REV</td>
                      <td className="p-3 text-emerald-500 font-semibold">45473.65</td>
                      <td className="p-3">2231543.00</td>
                      <td className="p-3">2228081.64</td>
                    </tr>
                    <tr className="hover:bg-accent/20">
                      <td className="p-3 font-bold">TXN002230</td>
                      <td className="p-3">20250609</td>
                      <td className="p-3">ACC000002230</td>
                      <td className="p-3">CHE</td>
                      <td className="p-3 font-bold text-emerald-400">POST</td>
                      <td className="p-3 text-emerald-500 font-semibold">48081.97</td>
                      <td className="p-3">2858915.00</td>
                      <td className="p-3">2831066.18</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-bold flex items-center gap-2">
              <AlertCircle className="h-4.5 w-4.5 text-rose-500" />
              Common Row Errors
            </h3>
            <Card className="p-5 rounded-2xl border border-border bg-gradient-to-b from-card to-accent/10 h-full">
              <ul className="space-y-3 text-xs text-muted-foreground">
                <li>
                  <strong>Missing Column:</strong> Leaving out commas or values (e.g. omitting batchNumber) triggers `Mandatory field missing` quarantine.
                </li>
                <li>
                  <strong>Incorrect Formats:</strong> Dates not complying with `yyyyMMdd` or IDs lacking `TXN` will trigger `Invalid date format` or `Invalid Transaction ID`.
                </li>
                <li>
                  <strong>Decimal Scaling:</strong> Decimal amounts carrying more than 2 numbers past the dot (e.g. `45.678`) will fail with `Invalid decimal scale`.
                </li>
                <li>
                  <strong>Uniqueness Violation:</strong> Re-uploading an identical `transactionId` already in the database isolates that row as a quarantined `DUPLICATE`.
                </li>
              </ul>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
