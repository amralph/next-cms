import { DocumentRow, isValidContentJSON } from '@/types/types';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDocumentsPageContext } from '../Providers/DocumentsPageProvider';
import { useReferencableDocumentsContext } from '../Providers/ReferencableDocumentsProvider';
import { pageSize } from '@/lib/pagination';
import { allKeysEmpty, mergeDocumentRecords } from '../referencableDocuments';

export const ReferenceInput = ({
  name,
  referenceId,
  templateIds,
}: {
  name: string;
  referenceId?: string;
  templateIds: string[];
}) => {
  const { workspaceId } = useDocumentsPageContext();
  const {
    referencableDocuments,
    setReferencableDocuments,
    currentPage,
    setCurrentPage,
  } = useReferencableDocumentsContext();

  const referenceOptions = useMemo(() => {
    return templateIds.flatMap(
      (templateId) => referencableDocuments[templateId] ?? []
    );
  }, [templateIds, referencableDocuments]);

  const [selectedDocument, setSelectedDocument] = useState<string | undefined>(
    referenceId
  );
  const [open, setOpen] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // 👇 loading guard for scroll fetch
  const [loadingMore, setLoadingMore] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load default referenced document
  useEffect(() => {
    if (!referenceId || !workspaceId) return;

    let existingDocumentId: string | undefined;

    for (const docs of Object.values(referencableDocuments)) {
      const found = docs.find((doc) => doc.id === referenceId);
      if (found) {
        existingDocumentId = found.id;
        break;
      }
    }

    if (existingDocumentId) {
      setSelectedDocument(existingDocumentId);
      return;
    }

    async function loadDefaultValue() {
      try {
        const res = await fetch(
          `/api/workspaces/${workspaceId}/documents/${referenceId}`
        );

        if (!res.ok) return;

        const { document } = await res.json();

        setReferencableDocuments((prev) => ({
          ...prev,
          [document.template_id]: [
            ...(prev[document.template_id] ?? []),
            document,
          ],
        }));

        setSelectedDocument(document.id);
      } catch (err) {
        console.error('Failed to load referenced document', err);
      }
    }

    loadDefaultValue();
  }, [
    referenceId,
    workspaceId,
    referencableDocuments,
    setReferencableDocuments,
  ]);

  const getDocumentLabel = (doc: DocumentRow): string => {
    if (!isValidContentJSON(doc)) return doc.id as string;

    return (
      (doc.content?.title as string) ||
      (doc.content?.name as string) ||
      (() => {
        const entries = Object.entries(doc.content ?? {});
        const first = entries.find(
          ([key]) => key !== 'title' && key !== 'name'
        );
        return first ? String(first[1]) : '';
      })() ||
      doc.id
    );
  };

  const selectedLabel: string = useMemo(() => {
    const doc = referenceOptions.find((d) => d.id === selectedDocument);
    return doc ? getDocumentLabel(doc) : 'Select a document';
  }, [selectedDocument, referenceOptions]);

  // 🔽 Fetch more when scrolled to bottom
  const handleScroll = async () => {
    const el = listRef.current;
    if (!el || loadingMore || !hasMore) return;

    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 5;

    if (!atBottom) return;

    setLoadingMore(true);

    // add 1 to page

    try {
      // 🔁 replace this endpoint + logic with whatever you need

      const res = await fetch(
        `/api/workspaces/${workspaceId}/references?templateIds=${templateIds.join(
          ','
        )}&page=${currentPage + 1}&limit=${pageSize}`,
        {
          method: 'GET',
        }
      );

      if (!res.ok) return;

      const data = (await res.json()).documents;

      setCurrentPage((page) => page + 1);
      setReferencableDocuments(
        mergeDocumentRecords(data, referencableDocuments)
      );

      // then prevent loading
      if (allKeysEmpty(data)) {
        setHasMore(false);
      }

      /**
       * ⬇️ Update state here
       * Examples:
       * setReferencableDocuments(...)
       * setCurrentPage(...)
       * append items, etc.
       */
    } catch (err) {
      console.error('Failed to fetch more references');
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div ref={wrapperRef} className='relative w-full'>
      {/* Hidden input for form submission */}
      <input type='hidden' name={name} value={selectedDocument ?? ''} />

      <button
        type='button'
        onClick={() => setOpen((o) => !o)}
        className='flex w-full items-center justify-between rounded-md border border-gray-300 px-3 py-2 text-left text-sm shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
      >
        <span className={selectedDocument ? '' : 'text-gray-400'}>
          {selectedLabel}
        </span>
        <svg
          className={`h-4 w-4 text-gray-500 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
          viewBox='0 0 20 20'
          fill='currentColor'
        >
          <path
            fillRule='evenodd'
            d='M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.38a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z'
            clipRule='evenodd'
          />
        </svg>
      </button>

      {open && (
        <ul
          ref={listRef}
          onScroll={handleScroll}
          className='absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-black py-1 text-sm shadow-lg'
        >
          <li
            className='cursor-pointer px-3 py-2 text-white hover:bg-gray-600'
            onClick={() => {
              setSelectedDocument(undefined);
              setOpen(false);
            }}
          >
            Select a document
          </li>

          {referenceOptions.map((doc) => {
            const label = getDocumentLabel(doc);
            const isSelected = doc.id === selectedDocument;

            return (
              <li
                key={doc.id}
                onClick={() => {
                  setSelectedDocument(doc.id);
                  setOpen(false);
                }}
                className={`cursor-pointer px-3 py-2 hover:bg-gray-600 ${
                  isSelected ? 'bg-gray-500' : ''
                }`}
              >
                {label}
              </li>
            );
          })}

          {loadingMore && (
            <li className='px-3 py-2 text-center text-gray-400'>Loading…</li>
          )}
        </ul>
      )}
    </div>
  );
};
