"use client";

import { useState } from "react";
import Link from "next/link";

interface RelatedWiki  { title: string; slug: string }
interface RelatedSkill { name: string;  id: string }
interface RelatedItem  { node: string; wikis: RelatedWiki[]; skills: RelatedSkill[] }

interface KnowledgeDrillProps {
  nodeId: string;
  label:  string;
}

export default function KnowledgeDrill({ nodeId, label }: KnowledgeDrillProps) {
  const [isOpen,  setIsOpen]  = useState(false);
  const [related, setRelated] = useState<RelatedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const handleExpand = async () => {
    if (isOpen) { setIsOpen(false); return; }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/knowledge/${encodeURIComponent(nodeId)}/related`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data: RelatedItem[] = await res.json();
      setRelated(data);
      setIsOpen(true);
    } catch (err) {
      console.error("Failed to load related knowledge:", err);
      setError("Could not load related knowledge. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleExpand}
        className="text-blue-600 hover:underline cursor-pointer"
      >
        {label}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="w-96 bg-white shadow-lg overflow-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">{label}</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-black text-xl"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              {loading ? (
                <p className="text-gray-500 text-sm">Loading…</p>
              ) : error ? (
                <p className="text-red-500 text-sm">{error}</p>
              ) : related.length === 0 ? (
                <p className="text-gray-400 text-sm">No related content found.</p>
              ) : (
                <div className="space-y-6">
                  {related.map((item, idx) => (
                    <div key={idx}>
                      <h3 className="font-semibold text-sm text-gray-700 mb-2">
                        Related to: {item.node}
                      </h3>

                      {item.wikis.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                            Wikis
                          </p>
                          <ul className="space-y-1">
                            {item.wikis.map((wiki) => (
                              <li key={wiki.slug}>
                                <Link
                                  href={`/wikis/${wiki.slug}`}
                                  className="text-blue-600 hover:underline text-sm"
                                  onClick={() => setIsOpen(false)}
                                >
                                  {wiki.title}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {item.skills.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                            Skills
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {item.skills.map((skill) => (
                              <span
                                key={skill.id}
                                className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded"
                              >
                                {skill.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
