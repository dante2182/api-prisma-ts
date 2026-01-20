import { z } from "zod";

// Schema para validar UUID (ajusta según tu configuración de IDs)
export const uuidSchema = z.string().uuid();

export const createUserSchema = z.object({
  email: z.string().email("Invalid Email Format"),
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const updateUserSchema = z.object({
  email: z.string().email("Invalid Email Format").optional(),
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
});

// Esto permite que los tipos de datos sean inferidos automáticamente
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
