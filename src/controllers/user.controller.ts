import prisma from "../config/db.js";
import { Request, Response } from "express";
import {
  createUserSchema,
  updateUserSchema,
  uuidSchema,
} from "../schemas/user.schema.js";
import argon2 from "argon2";

// Helper para excluir la contraseña de las respuestas
const excludePassword = <T extends { password?: string }>(user: T) => {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const getUsers = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        tasks: true,
      },
    });
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ error: "Error fetching users" });
  }
};

export const getUserById = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<Response> => {
  try {
    const { id } = req.params;

    // Validar formato UUID (comenta esta parte si no usas UUIDs)
    const validationResult = uuidSchema.safeParse(id);
    if (!validationResult.success) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        tasks: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: "Error fetching user" });
  }
};

export const createUser = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const validatedData = createUserSchema.parse(req.body);

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash de la contraseña
    const hashedPassword = await argon2.hash(validatedData.password);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        ...validatedData,
        password: hashedPassword,
      },
    });

    // Excluir la contraseña de la respuesta
    const userWithoutPassword = excludePassword(user);

    return res.status(201).json(userWithoutPassword);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: "Error creating user" });
  }
};

export const updateUser = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<Response> => {
  try {
    const { id } = req.params;

    // Validar formato UUID (comenta esta parte si no usas UUIDs)
    const validationResult = uuidSchema.safeParse(id);
    if (!validationResult.success) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const validatedData = updateUserSchema.parse(req.body);

    // Si intenta actualizar el email, verificar si ya existe otro usuario con ese email
    if (validatedData.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });
      if (existingUser && existingUser.id !== id) {
        return res.status(400).json({ error: "Email already exists" });
      }
    }
    // Preparar datos para actualizar
    const dataToUpdate: any = { ...validatedData };

    // Si se proporciona una nueva contraseña, hashearla
    if (validatedData.password) {
      dataToUpdate.password = await argon2.hash(validatedData.password);
    }

    // Actualizar usuario
    const user = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

    // Excluir la contraseña de la respuesta
    const userWithoutPassword = excludePassword(user);

    return res.json(userWithoutPassword);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: error.errors });
    }
    if (error.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(500).json({ error: "Error updating user" });
  }
};

export const deleteUser = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const { id } = req.params;

    // Validar formato UUID (comenta esta parte si no usas UUIDs)
    const validationResult = uuidSchema.safeParse(id);
    if (!validationResult.success) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    await prisma.user.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(500).json({ error: "Error deleting user" });
  }
};
