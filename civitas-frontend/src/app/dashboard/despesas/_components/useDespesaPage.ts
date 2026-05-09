"use client";

import { useState } from "react";
import { useDespesasDashboard } from "@/hooks/useDespesasDashboard";
import { showToast } from "@/hooks/useToast";
import { INITIAL_FILTER_FORM } from "./constants";

export function useDespesaPage() {
  const [filterForm, setFilterForm] = useState(INITIAL_FILTER_FORM);
  const [valuesVisible, setValuesVisible] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [viewing, setViewing] = useState<any>(null);

  const hook = useDespesasDashboard();

  const applyFilters = () => {
    hook.applyFilters({
      ...filterForm,
      search: filterForm.search.trim(),
    });
  };

  const clearFilters = () => {
    setFilterForm(INITIAL_FILTER_FORM);
    hook.clearFilters();
  };

  const handleCreate = async (data: any) => {
    try {
      await hook.createDespesa(data);
      setIsCreateModalOpen(false);
    } catch (e: any) {
      showToast(e.message, "error");
    }
  };

  const handleUpdate = async (data: any) => {
    try {
      await hook.updateDespesa(editing.id, data);
      setEditing(null);
    } catch (e: any) {
      showToast(e.message, "error");
    }
  };

  const handleDelete = async (item: any) => {
    if (!confirm("Deseja alterar status?")) return;

    try {
      await hook.removeDespesa(item.id);
    } catch (e: any) {
      showToast(e.message, "error");
    }
  };

  return {
    ...hook,
    filterForm,
    setFilterForm,
    valuesVisible,
    setValuesVisible,
    isCreateModalOpen,
    setIsCreateModalOpen,
    editing,
    setEditing,
    viewing,
    setViewing,
    applyFilters,
    clearFilters,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
}