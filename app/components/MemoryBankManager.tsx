"use client";

import { useState, useMemo } from "react";
import { Brain, Search, Plus, Trash2, Filter, Calendar, Tag, Lightbulb, FileText, Star, X } from "lucide-react";
import { useMemoryBank, type MemoryItem } from "@/lib/memory-bank";
import { findRelatedIdeas } from "@/lib/idea-linker";

type MemoryFilter = "all" | "idea" | "article" | "preference";
type MemorySort = "newest" | "oldest" | "relevance";

export function MemoryBankManager() {
  const { memories, addMemory, deleteMemory, searchMemory } = useMemoryBank();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<MemoryFilter>("all");
  const [sort, setSort] = useState<MemorySort>("newest");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemoryContent, setNewMemoryContent] = useState("");
  const [newMemoryType, setNewMemoryType] = useState<MemoryItem["type"]>("idea");
  const [selectedMemory, setSelectedMemory] = useState<MemoryItem | null>(null);

  const filteredMemories = useMemo(() => {
    let result = [...memories];

    // Apply search filter
    if (searchQuery.trim()) {
      result = searchMemory(searchQuery);
    } else if (filter !== "all") {
      result = result.filter(m => m.type === filter);
    }

    // Apply sorting
    if (sort === "newest") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sort === "oldest") {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }

    return result;
  }, [memories, searchQuery, filter, sort, searchMemory]);

  const stats = useMemo(() => {
    const typeCounts = {
      idea: memories.filter(m => m.type === "idea").length,
      article: memories.filter(m => m.type === "article").length,
      preference: memories.filter(m => m.type === "preference").length
    };
    return typeCounts;
  }, [memories]);

  const handleAddMemory = () => {
    if (!newMemoryContent.trim()) return;
    addMemory(newMemoryContent, newMemoryType);
    setNewMemoryContent("");
    setShowAddModal(false);
  };

  const relatedIdeas = selectedMemory ? findRelatedIdeas(selectedMemory.content, memories.filter(m => m.id !== selectedMemory.id), 3) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card p-6 border-l-4 border-blue-500">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Memory Bank
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Store and manage your ideas, articles, and preferences
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Memory
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard
          icon={<Lightbulb className="w-5 h-5" />}
          value={stats.idea}
          label="Ideas"
          color="yellow"
        />
        <StatCard
          icon={<FileText className="w-5 h-5" />}
          value={stats.article}
          label="Articles"
          color="blue"
        />
        <StatCard
          icon={<Star className="w-5 h-5" />}
          value={stats.preference}
          label="Preferences"
          color="purple"
        />
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as MemoryFilter)}
              className="px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="all">All Types</option>
              <option value="idea">Ideas</option>
              <option value="article">Articles</option>
              <option value="preference">Preferences</option>
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as MemorySort)}
              className="px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Memories List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredMemories.length === 0 ? (
            <div className="card p-8 text-center">
              <Brain className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No memories found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchQuery || filter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Start adding memories to build your knowledge base"
                }
              </p>
              {(!searchQuery || filter === "all") && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Memory
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMemories.map((memory) => (
                <div
                  key={memory.id}
                  onClick={() => setSelectedMemory(memory)}
                  className={`card p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedMemory?.id === memory.id
                      ? "border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      memory.type === "idea" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400" :
                      memory.type === "article" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" :
                      "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                    }`}>
                      {memory.type === "idea" ? <Lightbulb className="w-5 h-5" /> :
                       memory.type === "article" ? <FileText className="w-5 h-5" /> :
                       <Star className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          memory.type === "idea" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300" :
                          memory.type === "article" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" :
                          "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                        }`}>
                          {memory.type}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(memory.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 line-clamp-2">
                        {memory.content}
                      </p>
                      {memory.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {memory.keywords.slice(0, 3).map((keyword, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMemory(memory.id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Memory Details */}
        <div className="space-y-4">
          {selectedMemory ? (
            <div className="card p-5 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Memory Details
                </h3>
                <button
                  onClick={() => setSelectedMemory(null)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    selectedMemory.type === "idea" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300" :
                    selectedMemory.type === "article" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" :
                    "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                  }`}>
                    {selectedMemory.type}
                  </span>
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {selectedMemory.content}
                </p>
                
                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Added {new Date(selectedMemory.createdAt).toLocaleString()}
                </div>
                
                {selectedMemory.keywords.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedMemory.keywords.map((keyword, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-sm"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {relatedIdeas.length > 0 && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-yellow-500" />
                      Related Memories
                    </h4>
                    <div className="space-y-2">
                      {relatedIdeas.map((related, i) => (
                        <div
                          key={related.memory.id}
                          onClick={() => setSelectedMemory(related.memory)}
                          className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                            {related.memory.content}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {Math.round(related.relevanceScore)}% relevant
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card p-8 text-center sticky top-4">
              <Brain className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Select a memory to view details
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Memory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Add New Memory
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Memory Type
                </label>
                <div className="flex gap-2">
                  {(["idea", "article", "preference"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setNewMemoryType(type)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        newMemoryType === type
                          ? type === "idea" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300" :
                            type === "article" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" :
                            "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content
                </label>
                <textarea
                  value={newMemoryContent}
                  onChange={(e) => setNewMemoryContent(e.target.value)}
                  placeholder="Write your memory..."
                  className="w-full h-40 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 px-4 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMemory}
                  disabled={!newMemoryContent.trim()}
                  className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  Add Memory
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ 
  icon, 
  value, 
  label, 
  color 
}: { 
  icon: React.ReactNode;
  value: number;
  label: string;
  color: "yellow" | "blue" | "purple";
}) {
  const colorClasses = {
    yellow: "from-yellow-500 to-amber-600 text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/20",
    blue: "from-blue-500 to-indigo-600 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20",
    purple: "from-purple-500 to-pink-600 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20"
  };

  return (
    <div className="card p-5">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color].split(' ')[0]} ${colorClasses[color].split(' ')[1]} flex items-center justify-center text-white`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        </div>
      </div>
    </div>
  );
}
