"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Esquema de validación para el formulario de servicio.
const EsquemaServicio = z.object({
    nombre: z.string().min(1, "El nombre es obligatorio."),
    descripcion: z.string().optional(),
    duracion: z.coerce.number().positive("La duración debe ser mayor a cero."),
});

// 1. Creamos un tipo para definir la forma exacta de nuestro estado y quitar el "any"
export type EstadoFormulario = {
    errores?: Record<string, string[]>;
    mensaje: string;
};

// 2. Le decimos a la función que reciba y devuelva ese tipo exacto
export async function crearServicio(
    _estadoPrevio: EstadoFormulario,
    formData: FormData
): Promise<EstadoFormulario> {
    const campos = EsquemaServicio.safeParse({
        nombre: formData.get("nombre"),
        descripcion: formData.get("descripcion"),
        duracion: formData.get("duracion"),
    });

    // Si la validación falla, retornamos los errores respetando el tipo EstadoFormulario
    if (!campos.success) {
        return {
            errores: campos.error.flatten().fieldErrors,
            mensaje: "Error de validación.",
        };
    }

    await prisma.servicio.create({ data: campos.data });

    revalidatePath("/servicios");
    redirect("/servicios");
}

export async function eliminarServicio(id: number) {
    try {
        await prisma.servicio.delete({ where: { id } });
        revalidatePath("/servicios");
        return { exito: true };
    } catch {
        return { exito: false, mensaje: "No se pudo eliminar el servicio." };
    }
}