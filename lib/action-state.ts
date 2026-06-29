export type ActionFormState = {
  message: string;
  status: "idle" | "success" | "error";
  submittedAt: number;
};

export const initialActionFormState: ActionFormState = {
  message: "",
  status: "idle",
  submittedAt: 0,
};
