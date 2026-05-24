import { useState } from 'react';
import { Card } from '../app/components/ui/card';
import { 
  Code, Search, Filter, Layers, ShieldCheck, 
  Terminal, Activity, ExternalLink, Info, Copy, Check 
} from 'lucide-react';
import { motion } from 'motion/react';

const API_ENDPOINTS = [
  // 1. Authentication & TOTP 2FA
  {
    group: 'Authentication & 2FA',
    method: 'POST',
    path: '/auth/login',
    summary: 'Standard JSON Credentials Login',
    description: 'Authenticates credentials against the database and returns a stateless Bearer JWT session token.',
    parameters: [
      { name: 'email', in: 'body', required: true, type: 'string', desc: 'Registered user email address.' },
      { name: 'password', in: 'body', required: true, type: 'string', desc: 'Secure plain-text account password.' }
    ],
    curl: `curl -X 'POST' \\\n  'http://localhost:8080/auth/login' \\\n  -H 'Content-Type: application/json' \\\n  -d '{\n  "email": "user@example.com",\n  "password": "SecurePassword123"\n}'`,
    responses: `200 OK:\n{\n  "status": "OK",\n  "statusCode": 200,\n  "message": "Login successful",\n  "data": {\n    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."\n  }\n}`
  },
  {
    group: 'Authentication & 2FA',
    method: 'GET',
    path: '/oauth2/authorization/google',
    summary: 'Google OAuth2 SSO Auth Bridge',
    description: 'Redirects the client application to Google secure authentication servers for Identity and Profile federation.',
    parameters: [],
    curl: `curl -I 'http://localhost:8080/oauth2/authorization/google'`,
    responses: '302 Found (Redirects user to frontend redirect callback handler carrying Bearer JWT)'
  },
  {
    group: 'Authentication & 2FA',
    method: 'POST',
    path: '/auth/totp/setup',
    summary: 'Initialize TOTP 2FA Setup',
    description: 'Generates a secure encrypted 2FA secret and exports a Base64 QR Code to register inside authenticator apps (e.g. Google Authenticator).',
    headers: [{ name: 'Authorization', required: true, desc: 'Bearer <JWT_TOKEN>' }],
    parameters: [],
    curl: `curl -X 'POST' \\\n  'http://localhost:8080/auth/totp/setup' \\\n  -H 'Authorization: Bearer <JWT_TOKEN>'`,
    responses: `200 OK:\n{\n  "status": "OK",\n  "statusCode": 200,\n  "message": "TOTP secret generated successfully",\n  "data": {\n    "qrCodeUrl": "data:image/png;base64,iVBORw0KG...",\n    "secret": "JBSWY3DPEHPK3PXP"\n  }\n}`
  },
  {
    group: 'Authentication & 2FA',
    method: 'POST',
    path: '/auth/totp/enable',
    summary: 'Activate TOTP 2FA Protection',
    description: 'Verifies the initial 6-digit authenticator code to activate 2FA protection for subsequent sensitive actions.',
    headers: [{ name: 'Authorization', required: true, desc: 'Bearer <JWT_TOKEN>' }],
    parameters: [{ name: 'code', in: 'body', required: true, type: 'string', desc: '6-digit verification code.' }],
    curl: `curl -X 'POST' \\\n  'http://localhost:8080/auth/totp/enable' \\\n  -H 'Authorization: Bearer <JWT_TOKEN>' \\\n  -H 'Content-Type: application/json' \\\n  -d '{\n  "code": "123456"\n}'`,
    responses: `200 OK:\n{\n  "status": "OK",\n  "statusCode": 200,\n  "message": "TOTP 2FA has been successfully enabled on your account.",\n  "data": null\n}`
  },
  {
    group: 'Authentication & 2FA',
    method: 'POST',
    path: '/auth/totp/verify',
    summary: 'Verify 2FA Code for Export Token',
    description: 'Verifies 6-digit TOTP code and returns a secure, transient 5-minute Export Token required for streamed file downloads.',
    headers: [{ name: 'Authorization', required: true, desc: 'Bearer <JWT_TOKEN>' }],
    parameters: [{ name: 'code', in: 'body', required: true, type: 'string', desc: '6-digit verification code.' }],
    curl: `curl -X 'POST' \\\n  'http://localhost:8080/auth/totp/verify' \\\n  -H 'Authorization: Bearer <JWT_TOKEN>' \\\n  -H 'Content-Type: application/json' \\\n  -d '{\n  "code": "123456"\n}'`,
    responses: `200 OK:\n{\n  "status": "OK",\n  "statusCode": 200,\n  "message": "TOTP code verified.",\n  "data": "EXP_TOK_eyJhbGciOiJI..."\n}`
  },
  {
    group: 'Authentication & 2FA',
    method: 'GET',
    path: '/auth/totp/status',
    summary: 'Check TOTP Enablement Status',
    description: 'Retrieves whether 2FA protection is enabled for the authenticated profile.',
    headers: [{ name: 'Authorization', required: true, desc: 'Bearer <JWT_TOKEN>' }],
    parameters: [],
    curl: `curl -X 'GET' \\\n  'http://localhost:8080/auth/totp/status' \\\n  -H 'Authorization: Bearer <JWT_TOKEN>'`,
    responses: `200 OK:\n{\n  "status": "OK",\n  "statusCode": 200,\n  "message": "TOTP status retrieved.",\n  "data": {\n    "enabled": true\n  }\n}`
  },
  {
    group: 'Authentication & 2FA',
    method: 'DELETE',
    path: '/auth/totp/disable',
    summary: 'Deactivate TOTP 2FA Protection',
    description: 'Disables TOTP 2FA protection by verifying a final 6-digit authenticator code.',
    headers: [{ name: 'Authorization', required: true, desc: 'Bearer <JWT_TOKEN>' }],
    parameters: [{ name: 'code', in: 'query', required: true, type: 'string', desc: '6-digit verification code.' }],
    curl: `curl -X 'DELETE' \\\n  'http://localhost:8080/auth/totp/disable?code=123456' \\\n  -H 'Authorization: Bearer <JWT_TOKEN>'`,
    responses: `200 OK:\n{\n  "status": "OK",\n  "statusCode": 200,\n  "message": "TOTP 2FA has been disabled on your account.",\n  "data": null\n}`
  },

  // 2. File Ingestion & Queue
  {
    group: 'File Ingestion & Queue',
    method: 'POST',
    path: '/file/upload',
    summary: 'Upload & Queue CSV File',
    description: 'Uploads a trade CSV file of up to 1GB. Direct disk buffering makes uploads instantaneous; counting and processing run in background batch execution.',
    headers: [{ name: 'Authorization', required: true, desc: 'Bearer <JWT_TOKEN>' }],
    parameters: [{ name: 'file', in: 'formData', required: true, type: 'file', desc: 'The target CSV dataset file.' }],
    curl: `curl -X 'POST' \\\n  'http://localhost:8080/file/upload' \\\n  -H 'Authorization: Bearer <JWT_TOKEN>' \\\n  -H 'Content-Type: multipart/form-data' \\\n  -F 'file=@trades_100.csv'`,
    responses: `202 Accepted:\n{\n  "status": "ACCEPTED",\n  "statusCode": 202,\n  "message": "File uploaded and queued for validation.",\n  "data": {\n    "fileId": 142,\n    "fileName": "trades_100.csv",\n    "status": "PENDING"\n  }\n}`
  },
  {
    group: 'File Ingestion & Queue',
    method: 'GET',
    path: '/file/getAll',
    summary: 'Get All Active File Records',
    description: 'Retrieves metadata list of all active non-deleted, non-archived file loads committed by the authenticated user.',
    headers: [{ name: 'Authorization', required: true, desc: 'Bearer <JWT_TOKEN>' }],
    parameters: [],
    curl: `curl -X 'GET' \\\n  'http://localhost:8080/file/getAll' \\\n  -H 'Authorization: Bearer <JWT_TOKEN>'`,
    responses: `200 OK:\n{\n  "status": "OK",\n  "statusCode": 200,\n  "message": "Files retrieved successfully",\n  "data": [\n    {\n      "fileId": 142,\n      "fileName": "trades_100.csv",\n      "totalRecords": 1000,\n      "status": "COMPLETED"\n    }\n  ]\n}`
  },
  {
    group: 'File Ingestion & Queue',
    method: 'GET',
    path: '/file/getAll/page',
    summary: 'Get Active File Records (Paginated)',
    description: 'Retrieves a paginated list of active non-deleted, non-archived file loads uploaded by the user.',
    headers: [{ name: 'Authorization', required: true, desc: 'Bearer <JWT_TOKEN>' }],
    parameters: [
      { name: 'page', in: 'query', required: false, type: 'integer', desc: 'Zero-based page index.' },
      { name: 'size', in: 'query', required: false, type: 'integer', desc: 'Records size limit (default 20).' }
    ],
    curl: `curl -X 'GET' \\\n  'http://localhost:8080/file/getAll/page?page=0&size=5' \\\n  -H 'Authorization: Bearer <JWT_TOKEN>'`,
    responses: `200 OK (Paginated file load metadata list envelope)`
  },
  {
    group: 'File Ingestion & Queue',
    method: 'POST',
    path: '/file/search',
    summary: 'Search and Filter Files',
    description: 'Queries and filters file metadata records uploaded by the user matching the search parameters.',
    headers: [{ name: 'Authorization', required: true, desc: 'Bearer <JWT_TOKEN>' }],
    parameters: [{ name: 'request', in: 'body', required: true, type: 'FileSearchRequest', desc: 'Filter criteria object.' }],
    curl: `curl -X 'POST' \\\n  'http://localhost:8080/file/search' \\\n  -H 'Authorization: Bearer <JWT_TOKEN>' \\\n  -H 'Content-Type: application/json' \\\n  -d '{\n  "fileName": "trades"\n}'`,
    responses: `200 OK (List of matching file metadata)`
  },
  {
    group: 'File Ingestion & Queue',
    method: 'POST',
    path: '/file/search/page',
    summary: 'Search and Filter Files (Paginated)',
    description: 'Queries and filters file metadata records matching search parameters, paginated.',
    headers: [{ name: 'Authorization', required: true, desc: 'Bearer <JWT_TOKEN>' }],
    parameters: [{ name: 'request', in: 'body', required: true, type: 'FileSearchRequest', desc: 'Search criteria.' }],
    curl: `curl -X 'POST' \\\n  'http://localhost:8080/file/search/page?page=0&size=5' \\\n  -H 'Authorization: Bearer <JWT_TOKEN>' \\\n  -H 'Content-Type: application/json' \\\n  -d '{\n  "status": "COMPLETED"\n}'`,
    responses: `200 OK (Paginated matching file metadata list)`
  },
  {
    group: 'File Ingestion & Queue',
    method: 'PUT',
    path: '/file/modify',
    summary: 'Modify File Load Metadata',
    description: 'Updates target file metadata fields and status properties manually inside the system configuration.',
    headers: [{ name: 'Authorization', required: true, desc: 'Bearer <JWT_TOKEN>' }],
    parameters: [{ name: 'request', in: 'body', required: true, type: 'FileLoadMetaData', desc: 'Updated metadata properties.' }],
    curl: `curl -X 'PUT' \\\n  'http://localhost:8080/file/modify' \\\n  -H 'Authorization: Bearer <JWT_TOKEN>' \\\n  -H 'Content-Type: application/json' \\\n  -d '{\n  "fileId": 142,\n  "status": "FAILED"\n}'`,
    responses: `200 OK (Updated metadata record)`
  },
  {
    group: 'File Ingestion & Queue',
    method: 'POST',
    path: '/file/archive/{id}',
    summary: 'Archive Ingestion Records',
    description: 'Moves all successfully committed trade ledger records belonging to target file ID from primary active tables into partition archive history.',
    headers: [{ name: 'Authorization', required: true, desc: 'Bearer <JWT_TOKEN>' }],
    parameters: [{ name: 'id', in: 'path', required: true, type: 'integer', desc: 'Metadata File ID.' }],
    curl: `curl -X 'POST' \\\n  'http://localhost:8080/file/archive/142' \\\n  -H 'Authorization: Bearer <JWT_TOKEN>'`,
    responses: `200 OK:\n{\n  "status": "OK",\n  "statusCode": 200,\n  "message": "File load successfully archived.",\n  "data": null\n}`
  },
  {
    group: 'File Ingestion & Queue',
    method: 'DELETE',
    path: '/file/delete/{id}',
    summary: 'Cascade Soft Delete File Load',
    description: 'Performs full cascade soft delete moving active/archived trades and errors of target file ID into backup history and marks status to DELETED.',
    headers: [{ name: 'Authorization', required: true, desc: 'Bearer <JWT_TOKEN>' }],
    parameters: [{ name: 'id', in: 'path', required: true, type: 'integer', desc: 'Metadata File ID.' }],
    curl: `curl -X 'DELETE' \\\n  'http://localhost:8080/file/delete/142' \\\n  -H 'Authorization: Bearer <JWT_TOKEN>'`,
    responses: `200 OK:\n{\n  "status": "OK",\n  "statusCode": 200,\n  "message": "File cascade deleted successfully.",\n  "data": null\n}`
  },

  // 3. Error Management
  {
    group: 'Error Management',
    method: 'GET',
    path: '/file/errors',
    summary: 'Get All Quarantined Errors',
    description: 'Retrieves complete list of all quarantined row validation errors logged under user account.',
    headers: [{ name: 'Authorization', required: true, desc: 'Bearer <JWT_TOKEN>' }],
    parameters: [],
    curl: `curl -X 'GET' \\\n  'http://localhost:8080/file/errors' \\\n  -H 'Authorization: Bearer <JWT_TOKEN>'`,
    responses: `200 OK:\n{\n  "status": "OK",\n  "statusCode": 200,\n  "message": "Errors retrieved successfully",\n  "data": [\n    {\n      "id": 855,\n      "transactionId": "TXN002048",\n      "errorField": "cashEffect",\n      "errorMessage": "Invalid decimal scale",\n      "status": "FAILED",\n      "rowNumber": 14\n    }\n  ]\n}`
  },
  {
    group: 'Error Management',
    method: 'GET',
    path: '/file/errors/page',
    summary: 'Get Quarantined Errors (Paginated)',
    description: 'Retrieves a paginated list of all validation errors quarantined under this user account.',
    headers: [{ name: 'Authorization', required: true, desc: 'Bearer <JWT_TOKEN>' }],
    parameters: [
      { name: 'page', in: 'query', required: false, type: 'integer', desc: 'Zero-based page index.' },
      { name: 'size', in: 'query', required: false, type: 'integer', desc: 'Page record size limit (default 20).' }
    ],
    curl: `curl -X 'GET' \\\n  'http://localhost:8080/file/errors/page?page=0&size=5' \\\n  -H 'Authorization: Bearer <JWT_TOKEN>'`,
    responses: `200 OK (Paginated error list details)`
  },
  {
    group: 'Error Management',
    method: 'POST',
    path: '/file/search-errors',
    summary: 'Search Quarantined Validation Errors',
    description: 'Queries and filters quarantined validation errors matching search parameters.',
    headers: [{ name: 'Authorization', required: true, desc: 'Bearer <JWT_TOKEN>' }],
    parameters: [{ name: 'request', in: 'body', required: true, type: 'TransactionErrorSearchRequest', desc: 'Search criteria.' }],
    curl: `curl -X 'POST' \\\n  'http://localhost:8080/file/search-errors' \\\n  -H 'Authorization: Bearer <JWT_TOKEN>' \\\n  -H 'Content-Type: application/json' \\\n  -d '{\n  "errorField": "cashEffect"\n}'`,
    responses: `200 OK (List of matching validation errors)`
  },
  {
    group: 'Error Management',
    method: 'POST',
    path: '/file/search-errors/page',
    summary: 'Search Validation Errors (Paginated)',
    description: 'Queries and filters quarantined validation errors matching search parameters, paginated.',
    headers: [{ name: 'Authorization', required: true, desc: 'Bearer <JWT_TOKEN>' }],
    parameters: [{ name: 'request', in: 'body', required: true, type: 'TransactionErrorSearchRequest', desc: 'Paginated filter parameters.' }],
    curl: `curl -X 'POST' \\\n  'http://localhost:8080/file/search-errors/page?page=0&size=5' \\\n  -H 'Authorization: Bearer <JWT_TOKEN>' \\\n  -H 'Content-Type: application/json' \\\n  -d '{\n  "status": "FAILED"\n}'`,
    responses: `200 OK (Paginated matching error list)`
  },
  {
    group: 'Error Management',
    method: 'POST',
    path: '/file/errors/{id}/resolve',
    summary: 'Resolve Quarantined Ingestion Error',
    description: 'Sets a quarantined validation error status to RESOLVED and triggers a re-calculation of file load attributes.',
    headers: [{ name: 'Authorization', required: true, desc: 'Bearer <JWT_TOKEN>' }],
    parameters: [{ name: 'id', in: 'path', required: true, type: 'integer', desc: 'Error record primary key.' }],
    curl: `curl -X 'POST' \\\n  'http://localhost:8080/file/errors/855/resolve' \\\n  -H 'Authorization: Bearer <JWT_TOKEN>'`,
    responses: `200 OK:\n{\n  "status": "OK",\n  "statusCode": 200,\n  "message": "Quarantined record resolved.",\n  "data": null\n}`
  },
  {
    group: 'Error Management',
    method: 'POST',
    path: '/file/errors/{id}/ignore',
    summary: 'Ignore Quarantined Ingestion Error',
    description: 'Ignores a quarantined INVALID_TRANSACTION_ID formatting error.',
    headers: [{ name: 'Authorization', required: true, desc: 'Bearer <JWT_TOKEN>' }],
    parameters: [{ name: 'id', in: 'path', required: true, type: 'integer', desc: 'Error record primary key.' }],
    curl: `curl -X 'POST' \\\n  'http://localhost:8080/file/errors/855/ignore' \\\n  -H 'Authorization: Bearer <JWT_TOKEN>'`,
    responses: `200 OK:\n{\n  "status": "OK",\n  "statusCode": 200,\n  "message": "Quarantined record marked as ignored.",\n  "data": null\n}`
  },

  // 4. Dashboard Metrics
  {
    group: 'Dashboard Metrics',
    method: 'GET',
    path: '/file/metrics',
    summary: 'Retrieve User Dashboard Metrics',
    description: 'Returns real-time analytics including active file loads count, success trade counts, and cumulative unresolved quarantined errors.',
    headers: [{ name: 'Authorization', required: true, desc: 'Bearer <JWT_TOKEN>' }],
    parameters: [],
    curl: `curl -X 'GET' \\\n  'http://localhost:8080/file/metrics' \\\n  -H 'Authorization: Bearer <JWT_TOKEN>'`,
    responses: `200 OK:\n{\n  "status": "OK",\n  "statusCode": 200,\n  "message": "Metrics compiled successfully.",\n  "data": {\n    "activeFileCount": 12,\n    "successTradeCount": 124500,\n    "quarantinedErrorCount": 142\n  }\n}`
  },

  // 5. Streamed Data Exports
  {
    group: 'Streamed Data Exports',
    method: 'GET',
    path: '/transactions/export',
    summary: 'Stream Active Trade Ledger to CSV',
    description: 'Streams fully parsed successful active trades back to CSV. Requires standard Bearer token AND a valid Export Token if 2FA is active.',
    headers: [
      { name: 'Authorization', required: true, desc: 'Bearer <JWT_TOKEN>' },
      { name: 'X-Export-Token', required: false, desc: 'Transient 5-minute export token (required if TOTP 2FA is enabled)' }
    ],
    parameters: [
      { name: 'startDate', in: 'query', required: false, type: 'string', desc: 'Filter date start (yyyyMMdd).' },
      { name: 'endDate', in: 'query', required: false, type: 'string', desc: 'Filter date end (yyyyMMdd).' },
      { name: 'fileId', in: 'query', required: false, type: 'integer', desc: 'Filter by file metadata ID.' }
    ],
    curl: `curl -X 'GET' \\\n  'http://localhost:8080/transactions/export?fileId=142' \\\n  -H 'Authorization: Bearer <JWT_TOKEN>' \\\n  -H 'X-Export-Token: EXPORT_TOKEN_ABC123'`,
    responses: '200 OK (CSV file stream attachment containing active trades)'
  },
  {
    group: 'Streamed Data Exports',
    method: 'GET',
    path: '/transactions/archive/export',
    summary: 'Stream Archived Trade Ledger to CSV',
    description: 'Streams archived trade transactions under the target parameters back to a downloadable CSV attachment.',
    headers: [
      { name: 'Authorization', required: true, desc: 'Bearer <JWT_TOKEN>' },
      { name: 'X-Export-Token', required: false, desc: 'Transient 5-minute export token' }
    ],
    parameters: [
      { name: 'startDate', in: 'query', required: false, type: 'string', desc: 'Filter date start.' },
      { name: 'endDate', in: 'query', required: false, type: 'string', desc: 'Filter date end.' },
      { name: 'fileId', in: 'query', required: false, type: 'integer', desc: 'Filter by file ID.' }
    ],
    curl: `curl -X 'GET' \\\n  'http://localhost:8080/transactions/archive/export?fileId=142' \\\n  -H 'Authorization: Bearer <JWT_TOKEN>' \\\n  -H 'X-Export-Token: EXPORT_TOKEN_ABC123'`,
    responses: '200 OK (CSV file stream attachment containing archived trades)'
  },
  {
    group: 'Streamed Data Exports',
    method: 'GET',
    path: '/file/errors/export',
    summary: 'Stream All Isolated Errors to CSV',
    description: 'Streams every quarantined validation error matching this user account back as a CSV file attachment.',
    headers: [{ name: 'Authorization', required: true, desc: 'Bearer <JWT_TOKEN>' }],
    parameters: [],
    curl: `curl -X 'GET' \\\n  'http://localhost:8080/file/errors/export' \\\n  -H 'Authorization: Bearer <JWT_TOKEN>'`,
    responses: '200 OK (CSV file stream attachment containing validation errors)'
  },
  {
    group: 'Streamed Data Exports',
    method: 'POST',
    path: '/file/search-errors/export',
    summary: 'Stream Filtered Quarantined Errors to CSV',
    description: 'Queries and streams quarantined validation errors matching search parameters back to CSV.',
    headers: [{ name: 'Authorization', required: true, desc: 'Bearer <JWT_TOKEN>' }],
    parameters: [{ name: 'request', in: 'body', required: true, type: 'TransactionErrorSearchRequest', desc: 'Search criteria.' }],
    curl: `curl -X 'POST' \\\n  'http://localhost:8080/file/search-errors/export' \\\n  -H 'Authorization: Bearer <JWT_TOKEN>' \\\n  -H 'Content-Type: application/json' \\\n  -d '{\n  "errorField": "cashEffect"\n}'`,
    responses: '200 OK (CSV file stream containing filtered errors)'
  },

  // 6. User Profile Management
  {
    group: 'User Profile Management',
    method: 'GET',
    path: '/user/profile',
    summary: "Get Authenticated User's Profile Details",
    description: "Retrieves email, full name, 2FA status, and file metadata history overview for the active session.",
    headers: [{ name: 'Authorization', required: true, desc: 'Bearer <JWT_TOKEN>' }],
    parameters: [],
    curl: `curl -X 'GET' \\\n  'http://localhost:8080/user/profile' \\\n  -H 'Authorization: Bearer <JWT_TOKEN>'`,
    responses: `200 OK:\n{\n  "status": "OK",\n  "statusCode": 200,\n  "message": "Profile details retrieved successfully.",\n  "data": {\n    "email": "user@example.com",\n    "name": "John Doe",\n    "totpEnabled": true\n  }\n}`
  },
  {
    group: 'User Profile Management',
    method: 'PUT',
    path: '/user/profile',
    summary: "Update Authenticated User's Profile Name",
    description: "Modifies the display name associated with this authenticated user account.",
    headers: [{ name: 'Authorization', required: true, desc: 'Bearer <JWT_TOKEN>' }],
    parameters: [{ name: 'name', in: 'body', required: true, type: 'string', desc: 'Updated account display name.' }],
    curl: `curl -X 'PUT' \\\n  'http://localhost:8080/user/profile' \\\n  -H 'Authorization: Bearer <JWT_TOKEN>' \\\n  -H 'Content-Type: application/json' \\\n  -d '{\n  "name": "Jane Doe"\n}'`,
    responses: `200 OK:\n{\n  "status": "OK",\n  "statusCode": 200,\n  "message": "Profile name updated successfully.",\n  "data": null\n}`
  }
];

export default function ApiDocsPage() {
  const [searchApi, setSearchApi] = useState('');
  const [apiGroupFilter, setApiGroupFilter] = useState('All');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const getBaseUrl = () => {
    const { hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8080';
    }
    return 'https://tradestreamengine.duckdns.org';
  };

  const getSwaggerUrl = () => {
    return `${getBaseUrl()}/swagger-ui/index.html`;
  };

  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  const filteredApis = API_ENDPOINTS.filter(api => {
    const matchesSearch = api.path.toLowerCase().includes(searchApi.toLowerCase()) ||
                          api.summary.toLowerCase().includes(searchApi.toLowerCase()) ||
                          api.description.toLowerCase().includes(searchApi.toLowerCase());
    const matchesGroup = apiGroupFilter === 'All' || api.group === apiGroupFilter;
    return matchesSearch && matchesGroup;
  });

  const apiGroups = Array.from(new Set(API_ENDPOINTS.map(a => a.group)));

  const handleCopy = (text: string, index: number) => {
    const dynamicText = text.replace('http://localhost:8080', getBaseUrl());
    navigator.clipboard.writeText(dynamicText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto pb-16 space-y-8 px-4 sm:px-6 pt-6">
      
      {/* Banner - Using a robust, high-contrast dark gradient always readable in both light and dark mode */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 p-8 md:p-10 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 space-y-4 max-w-3xl text-left">
          <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/40 text-primary-foreground px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Terminal className="h-3.5 w-3.5" />
            Developer Center
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Developer API Portal
          </h1>
          <p className="text-slate-200 text-sm leading-relaxed max-w-2xl">
            Technical reference documentation, schemas, and endpoint definitions for backend integrations. Connect directly using stateless JWT and streamed exports.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href={getSwaggerUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/95 text-primary-foreground px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-primary/25 cursor-pointer"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {isLocal ? 'Open Swagger Interactive UI (Port 8080)' : 'Open Swagger Interactive UI'}
            </a>
          </div>
        </div>
      </div>

      {/* Grid: Tech overview & Auth */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Technical Architecture */}
        <Card className="p-6 md:p-8 rounded-2xl border border-border space-y-4 bg-card">
          <h2 className="text-base font-bold flex items-center gap-2 text-foreground">
            <Layers className="h-4.5 w-4.5 text-primary" />
            Spring Batch Architecture
          </h2>
          <div className="text-xs md:text-sm text-muted-foreground space-y-3 leading-relaxed">
            <p>
              TSE operates a multi-threaded batch ingestion queue executing Spring Batch chunk operations:
            </p>
            <ul className="list-disc pl-4 space-y-1.5">
              <li><strong>Concurrent Isolation:</strong> Files upload instantly, returning <code>202 Accepted</code>. An asynchronous worker parses rows concurrently.</li>
              <li><strong>Chunk Commits:</strong> Commits trade lines in transaction chunk sizes of <strong>250 records</strong>.</li>
              <li><strong>Dual-State DB Write:</strong> Compliant trade transactions are written to active portfolios; non-compliant trades write immediately to quarantine tables.</li>
            </ul>
          </div>
        </Card>

        {/* Authentication Flow */}
        <Card className="p-6 md:p-8 rounded-2xl border border-border space-y-4 bg-card">
          <h2 className="text-base font-bold flex items-center gap-2 text-foreground">
            <ShieldCheck className="h-4.5 w-4.5 text-primary" />
            Core Authentication Mechanics
          </h2>
          <div className="text-xs md:text-sm text-muted-foreground space-y-3 leading-relaxed">
            <p>
              Security enforcement uses bulletproof, tokenized access filters:
            </p>
            <ul className="list-disc pl-4 space-y-1.5">
              <li><strong>Stateless JWT:</strong> Pass a Bearer Token in the <code>Authorization</code> header for core endpoints.</li>
              <li><strong>Google OAuth2 Bridge:</strong> Initiated at <code>/oauth2/authorization/google</code> for federated SSO.</li>
              <li><strong>Dual-Factor Export Token (2FA):</strong> Exports stream requires a <code>X-Export-Token</code> header retrieved by verifying a 6-digit TOTP code.</li>
            </ul>
          </div>
        </Card>

      </div>

      {/* API Reference catalog */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
            <Activity className="h-5 w-5 text-primary" />
            Rest API Catalog
          </h2>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search endpoints..."
                value={searchApi}
                onChange={(e) => setSearchApi(e.target.value)}
                className="bg-accent/40 border border-border rounded-xl pl-9 pr-4 py-1.5 text-xs focus:outline-none placeholder-muted-foreground/60 w-44"
              />
            </div>

            <select
              value={apiGroupFilter}
              onChange={(e) => setApiGroupFilter(e.target.value)}
              className="bg-accent/40 border border-border rounded-xl px-2 py-1.5 text-xs focus:outline-none cursor-pointer font-medium text-foreground"
            >
              <option value="All">All Groups</option>
              {apiGroups.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        {/* Catalog List */}
        <div className="space-y-6">
          {filteredApis.map((api, idx) => {
            const methodColors: Record<string, string> = {
              GET: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
              POST: 'bg-indigo-500/15 text-indigo-600 border-indigo-500/20 dark:text-indigo-400',
              PUT: 'bg-amber-500/15 text-amber-600 border-amber-500/20 dark:text-amber-400',
              DELETE: 'bg-rose-500/15 text-rose-600 border-rose-500/20 dark:text-rose-400',
            };

            return (
              <Card key={idx} className="p-6 rounded-2xl border border-border bg-card space-y-4 hover:border-primary/20 transition-all text-left">
                
                {/* Method & Path */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border font-mono ${methodColors[api.method] || 'bg-slate-500/10 text-slate-500'}`}>
                      {api.method}
                    </span>
                    <span className="font-mono text-xs font-bold text-foreground">{api.path}</span>
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-accent px-2 py-0.5 rounded-full border border-border/80">
                    {api.group}
                  </span>
                </div>

                {/* API Desc */}
                <div className="space-y-4">
                  <div className="text-xs md:text-sm text-foreground/90">
                    <strong>{api.summary}:</strong> {api.description}
                  </div>

                  {/* Headers */}
                  {api.headers && api.headers.length > 0 && (
                    <div className="space-y-2">
                      <span className="block text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Required Headers</span>
                      <div className="divide-y divide-border/60 bg-accent/40 rounded-xl border border-border/60">
                        {api.headers.map((h, i) => (
                          <div key={i} className="p-2.5 text-xs flex justify-between gap-4 font-mono">
                            <span className="font-bold text-primary">{h.name}</span>
                            <span className="text-muted-foreground text-[10px] font-sans">{h.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Parameters */}
                  {api.parameters && api.parameters.length > 0 && (
                    <div className="space-y-2">
                      <span className="block text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Request Parameters</span>
                      <div className="divide-y divide-border/60 bg-accent/40 rounded-xl border border-border/60">
                        {api.parameters.map((p, i) => (
                          <div key={i} className="p-2.5 text-xs flex justify-between gap-4">
                            <div className="font-mono flex items-center gap-2">
                              <span className="font-bold text-foreground">{p.name}</span>
                              <span className="text-[9px] text-muted-foreground">({p.in} - {p.type})</span>
                            </div>
                            <span className="text-muted-foreground text-[11px]">{p.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Code Block Curl & Response */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="block text-[9px] font-bold text-muted-foreground uppercase tracking-wider font-mono">Mock Curl Command</span>
                        <button
                          onClick={() => handleCopy(api.curl, idx)}
                          className="flex items-center gap-1 text-[10px] text-primary hover:underline cursor-pointer font-semibold"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="h-3 w-3" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="p-3 bg-slate-950 text-[10px] font-mono rounded-xl overflow-x-auto text-slate-200 leading-relaxed border border-slate-800 text-left">
                        {api.curl.replace('http://localhost:8080', getBaseUrl())}
                      </pre>
                    </div>

                    <div className="space-y-1.5">
                      <span className="block text-[9px] font-bold text-muted-foreground uppercase tracking-wider font-mono">Response Payload Model</span>
                      <pre className="p-3 bg-slate-950 text-[10px] font-mono rounded-xl overflow-x-auto text-slate-200 leading-relaxed border border-slate-800 whitespace-pre text-left">
                        {api.responses}
                      </pre>
                    </div>
                  </div>

                </div>

              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
