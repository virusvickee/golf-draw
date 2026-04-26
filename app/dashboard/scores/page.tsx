"use client";

import * as React from "react";
import { format } from "date-fns";
import { Plus, Trash2, Edit2, AlertCircle, Target } from "lucide-react";
import { useScores } from "@/hooks/useScores";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { toast } from "sonner";
import { Score } from "@/types";

export default function ScoresPage() {
  const { scores, loading, submitScore, editScore, deleteScore } = useScores();

  // Modals state
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  
  // Form state
  const [activeScore, setActiveScore] = React.useState<Score | null>(null);
  const [scoreValue, setScoreValue] = React.useState<number | "">("");
  const [scoreDate, setScoreDate] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const today = format(new Date(), "yyyy-MM-dd");

  const openAddModal = () => {
    setScoreValue("");
    setScoreDate(today);
    setIsAddOpen(true);
  };

  const openEditModal = (score: Score) => {
    setActiveScore(score);
    setScoreValue(score.score);
    setIsEditOpen(true);
  };

  const openDeleteModal = (score: Score) => {
    setActiveScore(score);
    setIsDeleteOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (scoreValue === "" || scoreValue < 1 || scoreValue > 45) {
      toast.error("Score must be between 1 and 45");
      return;
    }
    // Prevent duplicate dates
    if (scores.some((s) => s.date === scoreDate)) {
      toast.error("You have already logged a score for this date.");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitScore(Number(scoreValue), scoreDate);
      toast.success("Score added successfully!");
      setIsAddOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add score");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeScore) return;
    if (scoreValue === "" || scoreValue < 1 || scoreValue > 45) {
      toast.error("Score must be between 1 and 45");
      return;
    }

    setIsSubmitting(true);
    try {
      await editScore(activeScore.id, Number(scoreValue));
      toast.success("Score updated successfully!");
      setIsEditOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update score");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!activeScore) return;
    setIsSubmitting(true);
    try {
      await deleteScore(activeScore.id);
      toast.success("Score removed");
      setIsDeleteOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete score");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner variant="full-page" />;

  const isAtLimit = scores.length >= 5;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Scores"
        description="Log your daily Stableford scores. The most recent 5 scores will make up your draw entry snapshot."
        action={
          <Button onClick={openAddModal}>
            <Plus className="w-4 h-4 mr-2" />
            Add Score
          </Button>
        }
      />

      <div className="flex items-center gap-4 bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
        <div className="flex-1">
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${isAtLimit ? 'bg-amber-500' : 'bg-emerald-500'}`} 
              style={{ width: `${(scores.length / 5) * 100}%` }} 
            />
          </div>
        </div>
        <div className="text-sm font-medium">
          <span className={isAtLimit ? 'text-amber-400' : 'text-emerald-400'}>{scores.length}</span>
          <span className="text-slate-400"> / 5 scores logged</span>
        </div>
      </div>

      {scores.length === 0 ? (
        <Card className="border-dashed border-2 bg-transparent">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center mb-4">
              <Target className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-200">No scores yet</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-sm mb-6">
              Start tracking your performance to become eligible for the next monthly draw.
            </p>
            <Button onClick={openAddModal}>Log Your First Score</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {scores.map((score) => (
            <Card key={score.id} hoverEffect className="flex flex-col justify-between">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Date</p>
                    <p className="text-sm font-medium text-slate-200">{score.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Score</p>
                    <p className="text-3xl font-black text-emerald-400">{score.score}</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                  <Button variant="ghost" size="sm" onClick={() => openEditModal(score)} className="text-slate-400 hover:text-white px-3">
                    <Edit2 className="w-4 h-4 mr-2" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openDeleteModal(score)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Score Modal */}
      <Modal isOpen={isAddOpen} onClose={() => !isSubmitting && setIsAddOpen(false)} title="Add New Score">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {isAtLimit && (
            <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>Adding this score will replace your oldest score to maintain your latest 5-score snapshot.</p>
            </div>
          )}
          <Input
            label="Date of Round"
            type="date"
            required
            max={today}
            value={scoreDate}
            onChange={(e) => setScoreDate(e.target.value)}
          />
          <Input
            label="Stableford Score (1-45)"
            type="number"
            required
            min={1}
            max={45}
            value={scoreValue}
            onChange={(e) => setScoreValue(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="e.g. 36"
          />
          <div className="flex gap-3 mt-6">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsAddOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" isLoading={isSubmitting}>
              Save Score
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Score Modal */}
      <Modal isOpen={isEditOpen} onClose={() => !isSubmitting && setIsEditOpen(false)} title="Edit Score">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Date of Round"
            type="date"
            value={activeScore?.date || ""}
            disabled
            className="opacity-60 cursor-not-allowed"
          />
          <p className="text-xs text-slate-400 -mt-2">To change the date, please delete this score and create a new one.</p>
          <Input
            label="Stableford Score (1-45)"
            type="number"
            required
            min={1}
            max={45}
            value={scoreValue}
            onChange={(e) => setScoreValue(e.target.value === "" ? "" : Number(e.target.value))}
          />
          <div className="flex gap-3 mt-6">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsEditOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" isLoading={isSubmitting}>
              Update Score
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={() => !isSubmitting && setIsDeleteOpen(false)}>
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-500/10 mb-4">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Delete Score?</h3>
          <p className="text-sm text-slate-400 mb-6">
            Are you sure you want to delete your score of <strong className="text-white">{activeScore?.score}</strong> from <strong className="text-white">{activeScore?.date}</strong>? This action cannot be undone.
          </p>
          <div className="flex gap-3 mt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsDeleteOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="button" variant="danger" className="flex-1" onClick={handleDeleteConfirm} isLoading={isSubmitting}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
