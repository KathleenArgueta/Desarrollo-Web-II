"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export type EstadoFormulario = {
    errores?: {
        nombre?: string[];
        correo?: string[];
        fecha?: string[];
        servicioId?: string[];
    };
    mensaje?: string;
} | null | undefined;

const EsquemaReserva = z.object({
    nombre: z.string().min(1, "El nombre es obligatorio."),
    correo: z.string().email("El correo no es válido."),
    fecha: z.string().min(1, "La fecha es obligatoria."),
    servicioId: z.coerce.number().min(1, "Debe seleccionar un servicio."),
});

export async function crearReserva(prevState: EstadoFormulario, formData: FormData) {
    const validacion = EsquemaReserva.safeParse({
        nombre: formData.get("nombre"),
        correo: formData.get("correo"),
        fecha: formData.get("fecha"),
        servicioId: formData.get("servicioId"),
    });

    if (!validacion.success) {
        return { errores: validacion.error.flatten().fieldErrors };
    }

    const data = validacion.data;
    const nuevaFechaInicio = new Date(data.fecha);

    try {
        const servicio = await prisma.servicio.findUnique({
            where: { id: data.servicioId }
        });

        if (!servicio) {
            return { errores: { servicioId: ["El servicio no existe."] } };
        }

        const nuevaFechaFin = new Date(nuevaFechaInicio.getTime() + servicio.duracion * 60000);

        const reservasActivas = await prisma.reserva.findMany({
            where: {
                servicioId: data.servicioId,
                estado: { not: "cancelada" }
            },
            include: { servicio: true }
        });

        const hayConflicto = reservasActivas.some((reserva) => {
            const inicioExistente = new Date(reserva.fecha);
            const finExistente = new Date(inicioExistente.getTime() + reserva.servicio.duracion * 60000);

            return nuevaFechaInicio < finExistente && nuevaFechaFin > inicioExistente;
        });

        if (hayConflicto) {
            return { errores: { fecha: ["El horario choca con otra reserva existente."] } };
        }

        // ¡AQUÍ ESTÁ LA MAGIA! Conectamos tu formulario con los nombres reales de tu base de datos
        await prisma.reserva.create({
            data: {
                clienteNombre: data.nombre, // Le damos a Prisma el 'clienteNombre' que exige
                clienteEmail: data.correo,  // Le damos a Prisma el 'clienteEmail' que exige
                fecha: nuevaFechaInicio,
                servicioId: data.servicioId,
                estado: "pendiente"
            },
        });

    } catch (error) {
        if (error instanceof Error) {
            return { mensaje: "EL ERROR EXACTO ES: " + error.message };
        }
        return { mensaje: "Ocurrió un error desconocido." };
    }

    revalidatePath("/reservas");
    redirect("/reservas");
}

// --- EJERCICIO 2: CANCELAR ---
export async function cancelarReserva(id: number) {
    try {
        await prisma.reserva.update({
            where: { id },
            data: { estado: "cancelada" }
        });
        revalidatePath("/reservas");
        return { exito: true };
    } catch (error) {
        return { exito: false, mensaje: "No se pudo cancelar." };
    }
}

// --- EJERCICIO 4: CONFIRMAR ---
export async function confirmarReserva(id: number) {
    try {
        await prisma.reserva.update({
            where: { id },
            data: { estado: "confirmada" }
        });
        revalidatePath("/reservas");
        return { exito: true };
    } catch (error) {
        return { exito: false, mensaje: "No se pudo confirmar." };
    }
}