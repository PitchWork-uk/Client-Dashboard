"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Loader2,
  CheckCircle,
  XCircle,
  ChevronDown,
  CalendarIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { QuestionField } from "@/lib/notion";

interface CreateTaskSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
  databaseId?: string;
  onTaskCreated?: () => void;
}

type SubmissionStatus = "idle" | "loading" | "success" | "error";

export function CreateTaskSheet({
  isOpen,
  onOpenChange,
  projectId,
  databaseId,
  onTaskCreated,
}: CreateTaskSheetProps) {
  const [formData, setFormData] = useState({
    submittedBy: "",
    taskTitle: "",
    dateRange: undefined as DateRange | undefined,
    priority: "",
    category: "",
    extra: {} as Record<string, string>,
  });

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submissionStatus, setSubmissionStatus] =
    useState<SubmissionStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [questions, setQuestions] = useState<QuestionField[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleExtraChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      extra: { ...prev.extra, [field]: value },
    }));
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setFormData((prev) => ({
      ...prev,
      dateRange: range,
    }));
  };

  const handleCategoryChange = async (category: string) => {
    setFormData((prev) => ({
      ...prev,
      category,
      extra: {},
    }));

    // Fetch questions for the selected category
    setLoadingQuestions(true);
    try {
      const response = await fetch(
        `/api/get-questions?taskType=${encodeURIComponent(category)}`
      );
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions || []);
        console.log(data.questions);
      } else {
        console.error("Failed to fetch questions");
        setQuestions([]);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      setQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data (Submitted By, Title, Date range, Priority, Category)
    if (
      !formData.submittedBy.trim() ||
      !formData.taskTitle.trim() ||
      !formData.dateRange?.from ||
      !formData.dateRange?.to ||
      !formData.priority ||
      !formData.category
    ) {
      setErrorMessage(
        "Please fill in all required fields: Submitted By, Title, Date, Priority, Category."
      );
      return;
    }

    // Validate category-specific required fields
    const missing = questions.filter(
      (q) => q.required && !String(formData.extra?.[q.id] || "").trim()
    );
    if (missing.length > 0) {
      setErrorMessage(
        `Please fill in required: ${missing.map((m) => m.question).join(", ")}`
      );
      return;
    }

    if (!databaseId) {
      setErrorMessage("Database ID is required");
      return;
    }

    // Show confirmation dialog
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    setSubmissionStatus("loading");
    setErrorMessage("");

    try {
      // Build labeled extra display pairs for clearer Notion formatting
      const extraDisplay = Object.entries(formData.extra || {})
        .filter(([, v]) => String(v || "").trim())
        .map(([id, value]) => {
          const question = questions.find((q) => q.id === id);
          return {
            label: question ? question.question : id,
            value: String(value),
          };
        });

      const response = await fetch("/api/create-task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submittedBy: formData.submittedBy,
          title: formData.taskTitle,
          dateRange: {
            from: formData.dateRange?.from?.toISOString(),
            to: formData.dateRange?.to?.toISOString(),
          },
          priority: formData.priority,
          category: formData.category,
          projectId: projectId,
          databaseId: databaseId,
          extraDisplay,
        }),
      });

      if (response.ok) {
        setSubmissionStatus("success");
        setTimeout(() => {
          handleCloseConfirmation();
          onTaskCreated?.();
          resetForm();
        }, 2000);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || "Failed to create task");
        setSubmissionStatus("error");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      setErrorMessage("An unexpected error occurred");
      setSubmissionStatus("error");
    }
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    setSubmissionStatus("idle");
    setErrorMessage("");
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setFormData({
      submittedBy: "",
      taskTitle: "",
      dateRange: undefined,
      priority: "",
      category: "",
      extra: {},
    });
    setErrorMessage("");
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <div className="flex flex-col h-full">
            <SheetHeader className="px-6 py-6 border-b">
              <SheetTitle>Create New Task</SheetTitle>
              <SheetDescription>
                Provide the information below to create a new task.
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto">
              <form className="px-6 py-6 space-y-6">
                <div className="space-y-8">
                  {/* Submitted By Field */}
                  <div className="space-y-3">
                    <Label htmlFor="submittedBy">
                      Submitted By <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="submittedBy"
                      placeholder="Enter your name"
                      value={formData.submittedBy}
                      onChange={(e) =>
                        handleInputChange("submittedBy", e.target.value)
                      }
                      required
                    />
                  </div>

                  {/* Task Title Field */}
                  <div className="space-y-3">
                    <Label htmlFor="taskTitle">
                      Task Title <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="taskTitle"
                      placeholder="Enter task title"
                      value={formData.taskTitle}
                      onChange={(e) =>
                        handleInputChange("taskTitle", e.target.value)
                      }
                      required
                    />
                  </div>

                  {/* Date Range Field */}
                  <div className="space-y-3">
                    <Label>
                      Task Duration <span className="text-red-600">*</span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.dateRange && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.dateRange?.from ? (
                            formData.dateRange.to ? (
                              <>
                                {format(formData.dateRange.from, "LLL dd, y")} -{" "}
                                {format(formData.dateRange.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(formData.dateRange.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Select date range</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={formData.dateRange?.from}
                          selected={formData.dateRange}
                          onSelect={handleDateRangeChange}
                          numberOfMonths={2}
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const selectedDate = new Date(date);
                            selectedDate.setHours(0, 0, 0, 0);
                            return selectedDate < today;
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Priority Field */}
                  <div className="space-y-3">
                    <Label htmlFor="priority">
                      Priority <span className="text-red-600">*</span>
                    </Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                        >
                          {formData.priority || "Select priority"}
                          <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full">
                        <DropdownMenuItem
                          onClick={() =>
                            handleInputChange("priority", "Critical")
                          }
                        >
                          Critical
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleInputChange("priority", "High")}
                        >
                          High
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleInputChange("priority", "Medium")
                          }
                        >
                          Medium
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleInputChange("priority", "Low")}
                        >
                          Low
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Category Field */}
                  <div className="space-y-3">
                    <Label htmlFor="category">
                      Category <span className="text-red-600">*</span>
                    </Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                        >
                          {formData.category || "Select category"}
                          <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full">
                        <DropdownMenuItem
                          onClick={() => handleCategoryChange("General")}
                        >
                          General
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleCategoryChange("Deck")}
                        >
                          Deck
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleCategoryChange("Social media")}
                        >
                          Social media
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleCategoryChange("Web development")
                          }
                        >
                          Web development
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleCategoryChange("Branding")}
                        >
                          Branding
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Dynamic follow-up fields based on Category */}
                  {formData.category && (
                    <div className="space-y-8">
                      {loadingQuestions ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Loading questions...
                        </div>
                      ) : (
                        questions.map((question) => (
                          <div key={question.id} className="space-y-2">
                            <Label htmlFor={question.id}>
                              {question.question}{" "}
                              {question.required && (
                                <span className="text-red-600">*</span>
                              )}
                            </Label>

                            {/* Text input */}
                            {question.type === "Text" && (
                              <Input
                                id={question.id}
                                type="text"
                                placeholder="Enter your answer"
                                value={formData.extra[question.id] || ""}
                                onChange={(e) =>
                                  handleExtraChange(question.id, e.target.value)
                                }
                              />
                            )}

                            {/* Number input */}
                            {question.type === "Number" && (
                              <Input
                                id={question.id}
                                type="number"
                                placeholder="Enter a number"
                                value={formData.extra[question.id] || ""}
                                onChange={(e) =>
                                  handleExtraChange(question.id, e.target.value)
                                }
                              />
                            )}

                            {/* URL input */}
                            {question.type === "URL" && (
                              <Input
                                id={question.id}
                                type="url"
                                placeholder="https://example.com"
                                value={formData.extra[question.id] || ""}
                                onChange={(e) =>
                                  handleExtraChange(question.id, e.target.value)
                                }
                              />
                            )}

                            {/* Date input */}
                            {question.type === "Date" && (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !formData.extra[question.id] &&
                                        "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {formData.extra[question.id] ? (
                                      format(
                                        new Date(formData.extra[question.id]),
                                        "LLL dd, y"
                                      )
                                    ) : (
                                      <span>Select date</span>
                                    )}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    initialFocus
                                    mode="single"
                                    selected={
                                      formData.extra[question.id]
                                        ? new Date(formData.extra[question.id])
                                        : undefined
                                    }
                                    onSelect={(date) =>
                                      handleExtraChange(
                                        question.id,
                                        date ? date.toISOString() : ""
                                      )
                                    }
                                    disabled={(date) => {
                                      const today = new Date();
                                      today.setHours(0, 0, 0, 0);
                                      const selectedDate = new Date(date);
                                      selectedDate.setHours(0, 0, 0, 0);
                                      return selectedDate < today;
                                    }}
                                  />
                                </PopoverContent>
                              </Popover>
                            )}

                            {/* Textarea */}
                            {question.type === "Textarea" && (
                              <textarea
                                id={question.id}
                                placeholder="Enter your answer"
                                className="w-full min-h-[96px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={formData.extra[question.id] || ""}
                                onChange={(e) =>
                                  handleExtraChange(question.id, e.target.value)
                                }
                              />
                            )}

                            {/* Select dropdown */}
                            {question.type === "Select" && question.options && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="w-full justify-between"
                                  >
                                    {formData.extra[question.id] ||
                                      `Select an option`}
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-full">
                                  {question.options.map((opt) => (
                                    <DropdownMenuItem
                                      key={opt}
                                      onClick={() =>
                                        handleExtraChange(question.id, opt)
                                      }
                                    >
                                      {opt}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}

                            {/* Description helper text */}
                            {question.description && (
                              <p className="text-sm text-muted-foreground">
                                {question.description}
                              </p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Legacy text areas removed in favor of category follow-ups */}
                </div>
              </form>
            </div>

            <SheetFooter className="px-6 py-6 border-t bg-muted/50">
              <div className="flex flex-col gap-3 w-full">
                {errorMessage && (
                  <div className="text-red-600 text-sm">{errorMessage}</div>
                )}
                <div className="flex gap-3 w-full">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    onClick={handleSubmit}
                  >
                    Create Task
                  </Button>
                </div>
              </div>
            </SheetFooter>
          </div>
        </SheetContent>
      </Sheet>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={handleCloseConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {submissionStatus === "loading" && (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Task...
                </div>
              )}
              {submissionStatus === "success" && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Task Created Successfully!
                </div>
              )}
              {submissionStatus === "error" && (
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-4 w-4" />
                  Error Creating Task
                </div>
              )}
              {submissionStatus === "idle" && "Confirm Task Creation"}
            </DialogTitle>
            <DialogDescription>
              {submissionStatus === "idle" &&
                "Are you sure you want to create this task?"}
              {submissionStatus === "loading" &&
                "Please wait while we create your task..."}
              {submissionStatus === "success" &&
                "Your task has been created successfully!"}
              {submissionStatus === "error" && errorMessage}
            </DialogDescription>
          </DialogHeader>
          {submissionStatus === "idle" && (
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseConfirmation}>
                Cancel
              </Button>
              <Button onClick={handleConfirmSubmit}>Create Task</Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
