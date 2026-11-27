'use client';

import * as React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Archive, ArchiveRestore, Pencil, Plus, Shield, Trash2 } from 'lucide-react';
import { useAppContext } from '@/components/providers/AppProviders';
import { CategoryBadge } from '@/components/shared/CategoryBadge';
import { CategoryIcon } from '@/components/shared/CategoryIcon';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Dialog, DialogContent } from '@/components/ui/Dialog';
import { Input, NativeSelect } from '@/components/ui/Input';
import { db } from '@/db/database';
import type { CategoryRecord, TransactionType } from '@/db/types';
import {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  PROTECTED_FALLBACK_CATEGORY_IDS,
  type CategoryIconKey,
} from '@/domain/constants';
import { cn } from '@/lib/cn';
import {
  createCategory,
  deleteCategoryWithStrategy,
  getCategoryUsage,
  setCategoryArchived,
  updateCategory,
} from '@/services/categoryService';

export default function CategoriesPage() {
  const { bootstrapReady, showToast } = useAppContext();
  const [activeTab, setActiveTab] = React.useState<TransactionType>('expense');
  const [showArchived, setShowArchived] = React.useState(false);

  // Create / Edit Modal
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingCat, setEditingCat] = React.useState<CategoryRecord | null>(null);
  const [catName, setCatName] = React.useState('');
  const [catIcon, setCatIcon] = React.useState<CategoryIconKey>('tag');
  const [catColor, setCatColor] = React.useState<string>(CATEGORY_COLORS[0]);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  // Delete / Reassign Modal
  const [deleteTarget, setDeleteTarget] = React.useState<CategoryRecord | null>(null);
  const [usageInfo, setUsageInfo] = React.useState<{
    transactionsCount: number;
    budgetsCount: number;
    recurringCount: number;
    totalRefs: number;
  } | null>(null);
  const [targetReassignId, setTargetReassignId] = React.useState('');
  const [mergeBudgets, setMergeBudgets] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const allCategories = useLiveQuery(() => db.categories.toArray(), [], []);

  const { activeList, archivedList } = React.useMemo(() => {
    const byTab = allCategories
      .filter((c) => c.type === activeTab)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'id-ID'));
    return {
      activeList: byTab.filter((c) => !c.isArchived),
      archivedList: byTab.filter((c) => c.isArchived),
    };
  }, [allCategories, activeTab]);

  const openCreate = () => {
    setEditingCat(null);
    setCatName('');
    setCatIcon('tag');
    setCatColor(CATEGORY_COLORS[0]);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (cat: CategoryRecord) => {
    setEditingCat(cat);
    setCatName(cat.name);
    setCatIcon((CATEGORY_ICONS.includes(cat.icon as CategoryIconKey) ? cat.icon : 'tag') as CategoryIconKey);
    setCatColor(cat.color);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);

    const res = editingCat
      ? await updateCategory(editingCat.id, {
          name: catName,
          icon: catIcon,
          color: catColor,
        })
      : await createCategory({
          name: catName,
          type: activeTab,
          icon: catIcon,
          color: catColor,
        });

    setSaving(false);
    if (!res.ok) {
      setFormError(res.error.message);
      return;
    }

    setModalOpen(false);
    showToast(editingCat ? 'Kategori berhasil diperbarui.' : 'Kategori baru berhasil ditambahkan.');
  };

  const handleToggleArchive = async (cat: CategoryRecord, nextArchived: boolean) => {
    const res = await setCategoryArchived(cat.id, nextArchived);
    if (!res.ok) {
      showToast(res.error.message, 'error');
      return;
    }
    showToast(
      nextArchived ? `Kategori "${cat.name}" diarsipkan.` : `Kategori "${cat.name}" diaktifkan kembali.`
    );
  };

  const openDeleteFlow = async (cat: CategoryRecord) => {
    const res = await getCategoryUsage(cat.id);
    if (!res.ok) {
      showToast(res.error.message, 'error');
      return;
    }
    setUsageInfo(res.data);
    const candidates = activeList.filter((c) => c.id !== cat.id);
    setTargetReassignId(candidates[0]?.id ?? '');
    setMergeBudgets(false);
    setDeleteTarget(cat);
  };

  const handleExecuteDelete = async () => {
    if (!deleteTarget || !usageInfo) return;
    setDeleting(true);

    const res =
      usageInfo.totalRefs === 0
        ? await deleteCategoryWithStrategy(deleteTarget.id, { mode: 'direct' })
        : await deleteCategoryWithStrategy(deleteTarget.id, {
            mode: 'reassign',
            targetCategoryId: targetReassignId,
            mergeConflictingBudgets: mergeBudgets,
          });

    setDeleting(false);
    if (!res.ok) {
      showToast(res.error.message, 'error');
      return;
    }
    setDeleteTarget(null);
    showToast('Kategori berhasil dihapus dengan aman.');
  };

  if (!bootstrapReady) {
    return <Card className="h-64 animate-pulse" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-1">
          <button
            type="button"
            onClick={() => setActiveTab('expense')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer',
              activeTab === 'expense'
                ? 'bg-[var(--accent-primary)] text-[var(--accent-foreground)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            )}
          >
            Pengeluaran
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('income')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer',
              activeTab === 'income'
                ? 'bg-[var(--accent-primary)] text-[var(--accent-foreground)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            )}
          >
            Pemasukan
          </button>
        </div>

        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" />
          Tambah Kategori
        </Button>
      </div>

      {/* Active Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeList.map((cat) => {
          const isFallbackProtected = PROTECTED_FALLBACK_CATEGORY_IDS.has(cat.id);
          return (
            <Card key={cat.id} className="p-4 flex items-center justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <CategoryBadge name={cat.name} icon={cat.icon} color={cat.color} />
                {isFallbackProtected ? (
                  <div className="pl-11">
                    <Badge tone="neutral">
                      <Shield className="w-3 h-3" />
                      Sistem • Dilindungi
                    </Badge>
                  </div>
                ) : cat.isSystem ? (
                  <p className="text-[11px] text-[var(--text-secondary)] pl-11">
                    Kategori bawaan
                  </p>
                ) : null}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Ubah kategori ${cat.name}`}
                  onClick={() => openEdit(cat)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                {!isFallbackProtected ? (
                  <>
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Arsipkan kategori"
                      aria-label={`Arsipkan kategori ${cat.name}`}
                      onClick={() => void handleToggleArchive(cat, true)}
                    >
                      <Archive className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Hapus kategori"
                      aria-label={`Hapus kategori ${cat.name}`}
                      onClick={() => void openDeleteFlow(cat)}
                    >
                      <Trash2 className="w-4 h-4 text-[var(--status-danger-text)]" />
                    </Button>
                  </>
                ) : null}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Archived Accordion */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowArchived((v) => !v)}
          className="text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
        >
          {showArchived ? '▼' : '▶'} Kategori Diarsipkan ({archivedList.length})
        </button>

        {showArchived ? (
          <div className="mt-3">
            {archivedList.length === 0 ? (
              <Card className="p-4 text-sm text-[var(--text-secondary)]">
                Belum ada kategori yang diarsipkan pada tipe ini.
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {archivedList.map((cat) => (
                  <Card key={cat.id} className="p-4 flex items-center justify-between gap-3">
                    <CategoryBadge
                      name={cat.name}
                      icon={cat.icon}
                      color={cat.color}
                      isArchived
                    />
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Pulihkan kategori"
                        aria-label={`Pulihkan kategori ${cat.name}`}
                        onClick={() => void handleToggleArchive(cat, false)}
                      >
                        <ArchiveRestore className="w-4 h-4 text-[var(--accent-primary)]" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Hapus kategori"
                        aria-label={`Hapus kategori ${cat.name}`}
                        onClick={() => void openDeleteFlow(cat)}
                      >
                        <Trash2 className="w-4 h-4 text-[var(--status-danger-text)]" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Create/Edit Category Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent
          title={editingCat ? 'Ubah Kategori' : 'Tambah Kategori Baru'}
          description={`Tipe: ${activeTab === 'expense' ? 'Pengeluaran' : 'Pemasukan'}`}
        >
          <form onSubmit={(e) => void handleSaveCategory(e)} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="cat-name" className="block text-sm font-medium text-[var(--text-primary)]">
                Nama Kategori
              </label>
              <Input
                id="cat-name"
                maxLength={50}
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="Contoh: Kopi & Camilan"
                hasError={Boolean(formError)}
                required
              />
              {formError ? (
                <p className="text-xs text-[var(--status-danger-text)]">{formError}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <span className="block text-sm font-medium text-[var(--text-primary)]">Ikon</span>
              <div className="grid grid-cols-6 sm:grid-cols-7 gap-2">
                {CATEGORY_ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    aria-label={`Pilih ikon ${ic}`}
                    onClick={() => setCatIcon(ic)}
                    className={cn(
                      'h-10 rounded-lg border flex items-center justify-center cursor-pointer',
                      catIcon === ic
                        ? 'bg-emerald-500/20 border-[var(--accent-primary)] text-[var(--accent-primary)]'
                        : 'bg-[var(--bg-canvas)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
                    )}
                  >
                    <CategoryIcon name={ic} className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="block text-sm font-medium text-[var(--text-primary)]">Warna</span>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_COLORS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    aria-label={`Pilih warna ${col}`}
                    onClick={() => setCatColor(col)}
                    className={cn(
                      'w-8 h-8 rounded-full border-2 cursor-pointer',
                      catColor === col ? 'border-white scale-110' : 'border-transparent'
                    )}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Safe Delete / Reassign Dialog */}
      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent
          title={`Hapus Kategori "${deleteTarget?.name ?? ''}"?`}
          description={
            usageInfo && usageInfo.totalRefs > 0
              ? `Kategori ini masih direferensikan oleh ${usageInfo.transactionsCount} transaksi, ${usageInfo.budgetsCount} anggaran, dan ${usageInfo.recurringCount} jadwal berulang.`
              : 'Kategori ini belum digunakan di catatan mana pun dan aman dihapus langsung.'
          }
        >
          {deleteTarget && usageInfo ? (
            <div className="space-y-4">
              {usageInfo.totalRefs > 0 ? (
                <>
                  <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-3.5 text-xs text-[var(--text-secondary)]">
                    Pilih kategori pengganti untuk memindahkan seluruh histori sebelum menghapus, atau pilih <strong>Arsipkan</strong> agar histori lama tetap utuh.
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="reassign-target"
                      className="block text-sm font-medium text-[var(--text-primary)]"
                    >
                      Pindahkan Referensi ke Kategori:
                    </label>
                    <NativeSelect
                      id="reassign-target"
                      value={targetReassignId}
                      onChange={(e) => setTargetReassignId(e.target.value)}
                    >
                      {activeList
                        .filter((c) => c.id !== deleteTarget.id)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                    </NativeSelect>
                  </div>
                  {usageInfo.budgetsCount > 0 ? (
                    <label className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mergeBudgets}
                        onChange={(e) => setMergeBudgets(e.target.checked)}
                        className="mt-0.5"
                      />
                      <span>
                        Jika kategori tujuan sudah memiliki anggaran pada bulan yang sama, jumlahkan batas anggarannya.
                      </span>
                    </label>
                  ) : null}
                </>
              ) : null}

              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                  Batal
                </Button>
                {usageInfo.totalRefs > 0 && !deleteTarget.isArchived ? (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      const target = deleteTarget;
                      setDeleteTarget(null);
                      void handleToggleArchive(target, true);
                    }}
                  >
                    Arsipkan Saja
                  </Button>
                ) : null}
                <Button
                  variant="destructive"
                  disabled={deleting || (usageInfo.totalRefs > 0 && !targetReassignId)}
                  onClick={() => void handleExecuteDelete()}
                >
                  {deleting
                    ? 'Memproses...'
                    : usageInfo.totalRefs > 0
                      ? 'Pindahkan & Hapus'
                      : 'Hapus Permanen'}
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
