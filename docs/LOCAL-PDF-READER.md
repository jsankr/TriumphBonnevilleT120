# Using the private PDF library

- This static site can run from GitHub Pages, on desktop or mobile Chrome, Firefox, Safari, and similar modern browsers. It does not need Blender, WebGL or a server backend.
- The 2016 service manual has 728 pages, the November 2016 owner's handbook has 162, the 2012 earlier-model data sheet 3, and 2006 older-model checklist 1.
- Upload your own PDFs by selecting **Choose PDF** next to each document's correct title. This is **not a network upload**: the File API retains them locally, in browser memory, until refresh. No files are committed or sent to the application host.
- Click **Open** next to a document, a chapter range, or a factual torque/spec record's page citation. PDF controls and `#page` fragment support vary among mobile browsers. Use **Open PDF in separate tab** if needed.
- To find an exact phrase through all pages, load the relevant PDF and enter at least 2 characters in **Search PDFs**. When online, Mozilla PDF.js is imported from cdnjs, and parses pages in your browser. The external script is downloaded, but the original manual PDF bytes are not uploaded. If PDF.js is blocked or the browser is offline, PDF viewing remains available while search shows an informative error.
- The app identifies the expected edition/page count by the title of the row you choose. Assigning the wrong PDF to a row can produce misleading page links; the full-text search includes a page-count consistency check.
- The database has 230 active torque entries, 44 maintenance records, 32 T120-column specifications and 37 special tools from specific editions. This is a **structured subset** of the manuals and does not claim to include their entire legal text, diagrams or all service steps. The complete original content remains visible by loading the full PDFs.
- The 2012 and 2006 documents are excluded from active T120 settings even though the reader accepts them for research.
