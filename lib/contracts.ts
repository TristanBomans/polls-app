import type { CreatePollInput, UpdatePollInput } from "../types/polls";

export const MIN_POLL_OPTIONS = 2;
export const MAX_POLL_OPTIONS = 10;
export const MAX_QUESTION_LENGTH = 160;
export const MAX_OPTION_LENGTH = 80;
export const CLERK_CONVEX_JWT_TEMPLATE = "convex";

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function createSlugBase(question: string) {
  const normalized = normalizeWhitespace(question)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "poll";
}

export function validatePollInput(
  input: Pick<CreatePollInput | UpdatePollInput, "question" | "options">,
) {
  const errors: string[] = [];
  const question = normalizeWhitespace(input.question);
  const sanitizedOptions = input.options.map((option) => ({
    id: option.id,
    label: normalizeWhitespace(option.label),
  }));

  if (!question) {
    errors.push("Question is required.");
  }

  if (question.length > MAX_QUESTION_LENGTH) {
    errors.push(
      `Question must be ${MAX_QUESTION_LENGTH} characters or fewer.`,
    );
  }

  if (sanitizedOptions.length < MIN_POLL_OPTIONS) {
    errors.push(`At least ${MIN_POLL_OPTIONS} options are required.`);
  }

  if (sanitizedOptions.length > MAX_POLL_OPTIONS) {
    errors.push(`No more than ${MAX_POLL_OPTIONS} options are allowed.`);
  }

  const normalizedLabels = sanitizedOptions.map((option) => option.label);
  const uniqueLabels = new Set(normalizedLabels.map((label) => label.toLowerCase()));

  if (normalizedLabels.some((label) => label.length === 0)) {
    errors.push("Every option needs a label.");
  }

  if (normalizedLabels.some((label) => label.length > MAX_OPTION_LENGTH)) {
    errors.push(
      `Each option must be ${MAX_OPTION_LENGTH} characters or fewer.`,
    );
  }

  if (uniqueLabels.size !== normalizedLabels.length) {
    errors.push("Option labels must be unique.");
  }

  return errors;
}
